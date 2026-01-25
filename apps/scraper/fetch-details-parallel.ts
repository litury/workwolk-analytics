/**
 * ETL Phase 2: Transform - Parallel Fetch Details
 *
 * Параллельная версия сбора детальных данных (10x быстрее!)
 * Использует 10 параллельных браузерных контекстов
 *
 * Использование:
 * bun run fetch-details-parallel.ts --limit=14000 --concurrency=10
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { sql, isNull, eq } from 'drizzle-orm';
import { createLogger } from './src/shared/utils/logger';
import pLimit from 'p-limit';

const log = createLogger('FetchDetailsParallel');

interface VacancyDetails {
  description: string;
  skills: string[];
  experience: string | null;
  employment: string | null;
  schedule: string | null;
  publishedAt: Date | null;
}

/**
 * Извлечь детальные данные со страницы вакансии
 */
async function extractDetailsFromPageAsync(page: Page, url: string): Promise<VacancyDetails | null> {
  try {
    // Random delay для имитации человека (1-3 сек)
    const randomDelay = 1000 + Math.random() * 2000;
    await page.waitForTimeout(randomDelay);

    await page.goto(url, {
      waitUntil: 'load',  // Ждём основную загрузку DOM (более мягкая стратегия чем networkidle)
      timeout: 30000
    });

    // Явно ждём появления description элемента
    try {
      await page.waitForSelector('[data-qa="vacancy-description"], .vacancy-branded-user-content, .vacancy-description', {
        timeout: 10000
      });
    } catch (e) {
      // Если элемент не появился - продолжим, но description будет пустым
    }

    // Еще один random delay после загрузки (0.5-1.5 сек)
    await page.waitForTimeout(500 + Math.random() * 1000);

    const details = await page.evaluate(() => {
      // Попробовать несколько селекторов для description (учитывая branded-вакансии)
      const descEl = document.querySelector('.vacancy-branded-user-content[data-qa="vacancy-description"]') ||
                     document.querySelector('[data-qa="vacancy-description"]') ||
                     document.querySelector('.vacancy-description') ||
                     document.querySelector('[class*="vacancy-description"]');

      // Если нашли элемент - извлекаем только текст (без CSS/JS)
      let description = '';
      if (descEl) {
        // Клонируем элемент чтобы не трогать DOM
        const clone = descEl.cloneNode(true) as HTMLElement;

        // Удаляем script, style, svg теги
        clone.querySelectorAll('script, style, svg').forEach(el => el.remove());

        // Берём только текст
        description = clone.textContent?.trim() || '';
      }

      const skillElements = document.querySelectorAll('[data-qa="skills-element"], [data-qa="bloko-tag"]');
      const skills = Array.from(skillElements)
        .map((el: any) => el.textContent?.trim())
        .filter(Boolean) as string[];

      const expEl = document.querySelector('[data-qa="vacancy-experience"]');
      const experience = expEl?.textContent?.trim() || null;

      const empEl = document.querySelector('[data-qa="vacancy-view-employment-mode"]');
      const employment = empEl?.textContent?.trim() || null;

      const schedEl = document.querySelector('[data-qa="vacancy-view-accept-temporary"]') ||
                      document.querySelector('[data-qa="vacancy-view-work-schedule"]');
      const schedule = schedEl?.textContent?.trim() || null;

      const dateEl = document.querySelector('[data-qa="vacancy-creation-time"]') ||
                     document.querySelector('[class*="creation-time"]');
      const publishedAtStr = dateEl?.textContent?.trim() || null;

      return { description, skills, experience, employment, schedule, publishedAt: publishedAtStr };
    });

    let publishedAt: Date | null = null;
    if (details.publishedAt) {
      publishedAt = new Date();
    }

    return {
      description: details.description,
      skills: details.skills,
      experience: details.experience,
      employment: details.employment,
      schedule: details.schedule,
      publishedAt,
    };
  } catch (error) {
    log.error(`Failed to extract details from ${url}`, error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Обработать одну вакансию (используется в pLimit)
 */
async function processVacancy(
  context: BrowserContext,
  vacancy: any,
  index: number,
  total: number
): Promise<{ success: boolean }> {
  const page = await context.newPage();

  try {
    console.log(`[${index + 1}/${total}] ${vacancy.title} - ${vacancy.company}`);

    const details = await extractDetailsFromPageAsync(page, vacancy.url);

    if (details) {
      await db.update(vacancies)
        .set({
          description: details.description,
          skills: details.skills,
          experience: details.experience,
          employment: details.employment,
          schedule: details.schedule,
          publishedAt: details.publishedAt,
          detailsFetchedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vacancies.id, vacancy.id));

      console.log(`   ✅ ${details.skills.length} skills, ${details.description.length} chars\n`);
      return { success: true };
    } else {
      console.log(`   ❌ Failed\n`);
      return { success: false };
    }
  } finally {
    await page.close();
  }
}

/**
 * Главная функция
 */
async function main() {
  const limit = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '14000', 10);
  const concurrency = parseInt(process.argv.find(arg => arg.startsWith('--concurrency='))?.split('=')[1] || '10', 10);  // Увеличено до 10 для скорости

  console.log('🚀 ETL Phase 2: Parallel Fetch Details\n');
  console.log('=' .repeat(80));
  console.log(`📊 Parameters:`);
  console.log(`   Max vacancies: ${limit}`);
  console.log(`   Concurrency: ${concurrency} browser contexts`);
  console.log(`   Expected speedup: ${concurrency}x faster!`);
  console.log('=' .repeat(80) + '\n');

  let browser: Browser | null = null;

  try {
    // Получаем вакансии без деталей
    const vacanciesWithoutDetails = await db.select()
      .from(vacancies)
      .where(isNull(vacancies.detailsFetchedAt))
      .limit(limit);

    console.log(`📋 Found ${vacanciesWithoutDetails.length} vacancies without details\n`);

    if (vacanciesWithoutDetails.length === 0) {
      console.log('✅ All vacancies already processed!');
      return;
    }

    // Запускаем браузер (headless: true для экономии ресурсов)
    console.log('🌐 Launching browser (headless mode)...\n');
    browser = await chromium.launch({
      headless: true,  // Невидимый режим - экономит RAM
    });

    // Создаём pool контекстов
    console.log(`📦 Creating ${concurrency} browser contexts...\n`);
    const contexts: BrowserContext[] = [];
    for (let i = 0; i < concurrency; i++) {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'ru-RU',
      });
      contexts.push(context);
    }

    console.log('✅ Browser contexts ready!\n');
    console.log('=' .repeat(80) + '\n');

    // Создаём concurrency limiter
    const limiter = pLimit(concurrency);

    let successful = 0;
    let failed = 0;

    // Обрабатываем все вакансии параллельно
    const startTime = Date.now();

    const promises = vacanciesWithoutDetails.map((vacancy, index) => {
      const contextIndex = index % concurrency;
      return limiter(() =>
        processVacancy(contexts[contextIndex], vacancy, index, vacanciesWithoutDetails.length)
      );
    });

    // Ждём завершения всех
    const results = await Promise.all(promises);

    // Подсчёт статистики
    successful = results.filter(r => r.success).length;
    failed = results.filter(r => !r.success).length;

    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes

    console.log('\n' + '=' .repeat(80));
    console.log('\n✅ Processing complete!\n');
    console.log('📊 Final statistics:');
    console.log(`   Processed: ${results.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${Math.round((successful / results.length) * 100)}%`);
    console.log(`   Time elapsed: ${elapsed.toFixed(1)} minutes`);
    console.log(`   Speed: ${(results.length / elapsed).toFixed(1)} vacancies/min`);
    console.log('\n' + '=' .repeat(80) + '\n');

    // Закрываем контексты
    for (const context of contexts) {
      await context.close();
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      log.info('Browser closed');
    }
    await closeDatabase();
    console.log('🔒 Browser and DB closed\n');
  }
}

main();
