/**
 * ETL Phase 2: Transform - Fetch Details
 *
 * Собирает детальные данные для вакансий, у которых есть только базовая информация.
 * Читает URL из БД, открывает страницу вакансии, собирает:
 * - description (полное описание)
 * - skills (список навыков)
 * - experience (требуемый опыт)
 * - employment (тип занятости)
 * - schedule (график работы)
 * - publishedAt (дата публикации)
 *
 * Использование:
 * bun run fetch-details.ts --limit 100  # Обработать 100 вакансий
 * bun run fetch-details.ts --batch 50   # По 50 за раз
 */

import { chromium, Browser, Page } from 'playwright';
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { sql, isNull } from 'drizzle-orm';
import { createLogger } from './src/shared/utils/logger';

const log = createLogger('FetchDetails');

// Интерфейс для детальных данных
interface VacancyDetails {
  description: string;
  skills: string[];
  experience: string | null;
  employment: string | null;
  schedule: string | null;
  publishedAt: Date | null;
}

// Browser singleton
let browser: Browser | null = null;
let page: Page | null = null;

async function getBrowserAsync(): Promise<{ browser: Browser; page: Page }> {
  if (!browser || !page) {
    log.info('Launching browser...');
    browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ru-RU',
    });
    page = await context.newPage();
    log.info('Browser launched successfully');
  }
  return { browser, page };
}

async function closeBrowserAsync(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    log.info('Browser closed');
  }
}

/**
 * Извлечь детальные данные со страницы вакансии
 */
async function extractDetailsFromPageAsync(page: Page, url: string): Promise<VacancyDetails | null> {
  try {
    log.info(`Fetching details from: ${url}`);

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Небольшая задержка для загрузки контента
    await page.waitForTimeout(1500);

    const details = await page.evaluate(() => {
      // Description
      const descEl = document.querySelector('[data-qa="vacancy-description"]') ||
                     document.querySelector('[class*="vacancy-description"]');
      const description = descEl?.textContent?.trim() || '';

      // Skills
      const skillElements = document.querySelectorAll('[data-qa="skills-element"], [data-qa="bloko-tag"]');
      const skills = Array.from(skillElements)
        .map((el: any) => el.textContent?.trim())
        .filter(Boolean) as string[];

      // Experience
      const expEl = document.querySelector('[data-qa="vacancy-experience"]');
      const experience = expEl?.textContent?.trim() || null;

      // Employment
      const empEl = document.querySelector('[data-qa="vacancy-view-employment-mode"]');
      const employment = empEl?.textContent?.trim() || null;

      // Schedule
      const schedEl = document.querySelector('[data-qa="vacancy-view-accept-temporary"]') ||
                      document.querySelector('[data-qa="vacancy-view-work-schedule"]');
      const schedule = schedEl?.textContent?.trim() || null;

      // Published date
      const dateEl = document.querySelector('[data-qa="vacancy-creation-time"]') ||
                     document.querySelector('[class*="creation-time"]');
      const publishedAtStr = dateEl?.textContent?.trim() || null;

      return {
        description,
        skills,
        experience,
        employment,
        schedule,
        publishedAt: publishedAtStr
      };
    });

    // Парсинг даты (если есть)
    let publishedAt: Date | null = null;
    if (details.publishedAt) {
      // HH.ru формат: "21 января", "вчера", "сегодня"
      // Для простоты просто сохраняем текущую дату, если что-то есть
      // TODO: улучшить парсинг дат
      publishedAt = new Date();
    }

    log.info(`Extracted details: ${details.skills.length} skills, ${details.description.length} chars description`);

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
 * Главная функция
 */
async function main() {
  const limit = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '100', 10);
  const batchSize = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '50', 10);

  console.log('🔄 ETL Phase 2: Fetching vacancy details...\n');
  console.log(`📊 Параметры:`);
  console.log(`   - Максимум вакансий: ${limit}`);
  console.log(`   - Размер батча: ${batchSize}\n`);

  try {
    // Получаем вакансии без деталей
    const vacanciesWithoutDetails = await db.select()
      .from(vacancies)
      .where(isNull(vacancies.detailsFetchedAt))
      .limit(limit);

    console.log(`📋 Найдено ${vacanciesWithoutDetails.length} вакансий без деталей\n`);

    if (vacanciesWithoutDetails.length === 0) {
      console.log('✅ Все вакансии уже обработаны!');
      return;
    }

    const { page } = await getBrowserAsync();

    let processed = 0;
    let successful = 0;
    let failed = 0;

    // Обработка батчами
    for (let i = 0; i < vacanciesWithoutDetails.length; i += batchSize) {
      const batch = vacanciesWithoutDetails.slice(i, i + batchSize);
      console.log(`\n📦 Батч ${Math.floor(i / batchSize) + 1}/${Math.ceil(vacanciesWithoutDetails.length / batchSize)}`);
      console.log(`   Обработка вакансий ${i + 1}-${Math.min(i + batchSize, vacanciesWithoutDetails.length)}...\n`);

      for (const vacancy of batch) {
        processed++;
        console.log(`[${processed}/${vacanciesWithoutDetails.length}] ${vacancy.title} - ${vacancy.company}`);

        const details = await extractDetailsFromPageAsync(page, vacancy.url);

        if (details) {
          // Обновляем запись в БД
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
            .where(sql`${vacancies.id} = ${vacancy.id}`);

          successful++;
          console.log(`   ✅ Успешно: ${details.skills.length} skills, ${details.description.length} chars\n`);
        } else {
          failed++;
          console.log(`   ❌ Ошибка при извлечении деталей\n`);
        }

        // Задержка между запросами
        await page.waitForTimeout(800 + Math.random() * 1200);
      }

      console.log(`\n📊 Статус батча: ${successful}/${processed} успешно, ${failed} ошибок`);
    }

    console.log('\n\n✅ Обработка завершена!');
    console.log(`📊 Итоговая статистика:`);
    console.log(`   - Обработано: ${processed}`);
    console.log(`   - Успешно: ${successful}`);
    console.log(`   - Ошибок: ${failed}`);
    console.log(`   - Процент успеха: ${Math.round((successful / processed) * 100)}%`);

  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    throw error;
  } finally {
    await closeBrowserAsync();
    await closeDatabase();
    console.log('\n🔒 Браузер и БД закрыты');
  }
}

main();
