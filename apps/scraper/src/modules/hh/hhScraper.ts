/**
 * Скрапер вакансий с HH.ru
 * Использует чистый Playwright для быстрого скрапинга + Gemini AI для аналитики
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { createLogger } from '../../shared/utils/logger';

export interface ISearchParams {
  query?: string;
  area?: number;      // ID региона (1 = Москва)
  salary?: number;
  experience?: string;
  pages?: number;
  // ❌ УДАЛЕНО: detailed - теперь используем ETL подход (fetch-details.ts + enrich-ai.ts)
}

export interface IScrapedVacancy {
  externalId: string;
  url: string;
  title: string;
  company: string;
  companyUrl?: string;
  salaryFrom?: number;
  salaryTo?: number;
  currency?: string;
  location?: string;
  remote?: boolean;
  description?: string;
  skills?: string[];
  experience?: string;
  publishedAt?: Date;
  // === НОВЫЕ ПОЛЯ (Phase 1: Quick Wins) ===
  companySize?: string;
  companyIndustry?: string;
  seniorityLevel?: string;
  workFormat?: string;
  contractType?: string;
  benefits?: string[];
  requiresAi?: boolean;
  techStack?: Array<{ name: string; category: string; required: boolean }>;
}

// Схема для детального парсинга одной вакансии через Gemini AI
const VacancyDetailsSchema = z.object({
  // ✅ Базовые поля со страницы вакансии
  description: z.string().optional().describe('Full job description text'),
  skills: z.array(z.string()).optional().describe('Key skills from vacancy page'),
  experience: z.string().nullable().optional().describe('Required experience (e.g., "1-3 года", "Нет опыта")'),
  employment: z.string().nullable().optional().describe('Employment type (e.g., "Полная занятость")'),
  schedule: z.string().nullable().optional().describe('Work schedule (e.g., "Полный день", "Гибкий график")'),
  publishedAt: z.string().nullable().optional().describe('Publication date string'),

  // ✅ AI-анализируемые поля
  techStack: z.array(z.object({
    name: z.string().describe('Technology name (e.g., React, Docker, AWS)'),
    category: z.enum(['language', 'framework', 'tool', 'cloud']).describe('Category of technology'),
    required: z.boolean().describe('Is this a must-have (true) or nice-to-have (false) skill'),
  })).optional().describe('Array of technologies and tools mentioned in the vacancy'),
  seniorityLevel: z.enum(['junior', 'middle', 'senior', 'lead', 'principal']).nullable().optional().describe('Seniority level based on job title and description'),
  requiresAi: z.boolean().optional().describe('Does vacancy mention AI/ML/GPT/neural networks/deep learning'),
  benefits: z.array(z.string()).optional().describe('Company benefits (e.g., ДМС, Опционы, Обучение, Гибкий график)'),
  workFormat: z.enum(['remote', 'hybrid', 'office']).nullable().optional().describe('Work format based on description'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).nullable().optional().describe('Company size if mentioned'),
  companyIndustry: z.string().nullable().optional().describe('Industry/domain (e.g., Fintech, E-commerce, SaaS, GameDev)'),
  contractType: z.enum(['permanent', 'contract', 'freelance', 'intern']).nullable().optional().describe('Employment contract type'),
});

type VacancyDetails = z.infer<typeof VacancyDetailsSchema>;

const log = createLogger('HHScraper');
let browser: Browser | null = null;
let context: BrowserContext | null = null;
let genAI: GoogleGenerativeAI | null = null;

/**
 * Получить или создать Playwright Browser
 */
async function getBrowserAsync(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  if (!browser || !context) {
    log.info('Launching Playwright browser...');
    browser = await chromium.launch({
      headless: env.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Для стабильности в Docker
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ru-RU',
    });

    log.info('Playwright browser launched successfully!');
  }

  const page = await context.newPage();
  return { browser, context, page };
}

/**
 * Получить или создать Gemini AI client (для detailed режима)
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY не установлен в .env');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    log.info('Gemini AI client initialized');
  }
  return genAI;
}

/**
 * Закрыть браузер
 */
export async function closeBrowserAsync(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
  log.info('Browser closed');
}

/**
 * Парсинг salary из текста (например: "от 100 000 до 150 000 ₽")
 */
function parseSalary(salaryText: string | null | undefined): {
  from?: number;
  to?: number;
  currency?: string;
} {
  if (!salaryText) return {};

  const result: { from?: number; to?: number; currency?: string } = {};

  // Извлечь валюту
  if (salaryText.includes('₽') || salaryText.toLowerCase().includes('руб')) {
    result.currency = 'RUB';
  } else if (salaryText.includes('$')) {
    result.currency = 'USD';
  } else if (salaryText.includes('€')) {
    result.currency = 'EUR';
  }

  // Извлечь числа (убрать пробелы)
  const numbers = salaryText.match(/[\d\s]+/g)?.map(n => parseInt(n.replace(/\s/g, ''), 10));

  if (numbers && numbers.length > 0) {
    if (salaryText.includes('от') && salaryText.includes('до')) {
      result.from = numbers[0];
      result.to = numbers[1];
    } else if (salaryText.includes('от')) {
      result.from = numbers[0];
    } else if (salaryText.includes('до')) {
      result.to = numbers[0];
    } else {
      // Только одно число
      result.from = numbers[0];
    }
  }

  return result;
}

/**
 * Извлечение вакансий со страницы поиска через Playwright (БЕЗ AI)
 * ~0.1-0.5 секунды на страницу
 */
async function extractVacanciesFromPageAsync(page: Page): Promise<Array<{
  url: string;
  externalId: string;
  title: string;
  company: string;
  salaryText: string | null;
  location: string | null;
}>> {
  try {
    // Ждем появления vacancy cards
    log.info('Waiting for vacancy cards to appear...');
    await page.waitForSelector('[data-qa="vacancy-serp__vacancy"]', { timeout: 30000 });
    log.info('✅ Vacancy cards found!');

    // Дополнительная задержка для полной загрузки карточек
    await page.waitForTimeout(1500);

    // Извлекаем данные напрямую из DOM
    const vacancies = await page.evaluate(() => {
      // @ts-ignore - browser context has document
      const cards = document.querySelectorAll('[data-qa="vacancy-serp__vacancy"]');

      // ✅ ИСПРАВЛЕНИЕ: Используем Array.from() + map() вместо forEach
      // forEach НЕ возвращает массив, а map() возвращает!
      return Array.from(cards).map((card: any) => {
        try {
          // ✅ НОВАЯ СТРУКТУРА HH.RU (2026):
          // Старый селектор [data-qa="vacancy-serp__vacancy-title"] больше не работает
          // Теперь используем первую ссылку внутри карточки

          // Найти первую ссылку с href="/vacancy/..."
          const allLinks = card.querySelectorAll('a');
          let titleLink = null;

          for (let i = 0; i < allLinks.length; i++) {
            const link = allLinks[i];
            const href = link.href || link.getAttribute('href');
            if (href && href.includes('/vacancy/')) {
              titleLink = link;
              break;
            }
          }

          if (!titleLink) return null;

          const href = titleLink.href || titleLink.getAttribute('href');
          const title = titleLink.textContent?.trim();

          if (!href || !title) return null;

          // Построить полный URL
          const fullUrl = href.startsWith('http') ? href : `https://hh.ru${href}`;

          // Extract vacancy ID из URL
          const idMatch = fullUrl.match(/\/vacancy\/(\d+)/);
          if (!idMatch) return null;

          // Company - пробуем разные селекторы
          const companyEl = card.querySelector('[data-qa="vacancy-serp__vacancy-employer"]') ||
                           card.querySelector('[class*="company"]') ||
                           allLinks[1]; // Вторая ссылка часто - компания
          const company = companyEl?.textContent?.trim() || '';

          // Salary - ищем по тексту с ₽ или "руб"
          let salary = null;
          const textContent = card.textContent || '';
          const salaryMatch = textContent.match(/(от|до|)\s*([\d\s]+)\s*(₽|руб)/i);
          if (salaryMatch) {
            salary = salaryMatch[0].trim();
          }

          // Location - ищем текст с городами или "Удалённая работа"
          let location = null;
          if (textContent.includes('Удалённая') || textContent.includes('Remote')) {
            location = 'Удалённая работа';
          } else {
            const locationMatch = textContent.match(/(Москва|Санкт-Петербург|Новосибирск|Екатеринбург|Казань|Нижний Новгород)/);
            if (locationMatch) {
              location = locationMatch[0];
            }
          }

          return {
            url: fullUrl,
            externalId: idMatch[1],
            title,
            company,
            salaryText: salary,
            location,
          };
        } catch (err) {
          // Skip invalid cards
          console.error('Error parsing card:', err);
          return null;
        }
      }).filter((v: any) => v !== null) as Array<{
        url: string;
        externalId: string;
        title: string;
        company: string;
        salaryText: string | null;
        location: string | null;
      }>; // Type assertion после фильтрации null
    });

    log.info(`Found ${vacancies.length} vacancies on page`);
    return vacancies;
  } catch (error) {
    log.error('Error extracting vacancies from page', error instanceof Error ? error : undefined);
    return [];
  }
}

/**
 * Извлечение детальной информации о вакансии через Gemini AI
 * Используется ТОЛЬКО в detailed режиме
 */
async function extractVacancyDetailsAsync(page: Page, vacancyUrl: string): Promise<VacancyDetails | null> {
  try {
    log.info('Navigating to vacancy page for detailed analysis...');
    await page.goto(vacancyUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(2000); // Дождаться загрузки контента

    // ✅ НОВЫЙ КОД: Извлечение всех базовых полей со страницы вакансии
    const pageData = await page.evaluate(() => {
      // Description
      const descEl = document.querySelector('[data-qa="vacancy-description"]') ||
                     document.querySelector('[class*="vacancy-description"]');
      const description = descEl?.textContent?.trim() || '';

      // Skills (ключевые навыки)
      const skillElements = document.querySelectorAll('[data-qa="skills-element"], [data-qa="bloko-tag"]');
      const skills = Array.from(skillElements).map((el: any) => el.textContent?.trim()).filter(Boolean) as string[];

      // Experience
      const expEl = document.querySelector('[data-qa="vacancy-experience"]');
      const experience = expEl?.textContent?.trim() || null;

      // Employment (тип занятости)
      const empEl = document.querySelector('[data-qa="vacancy-view-employment-mode"]');
      const employment = empEl?.textContent?.trim() || null;

      // Schedule (график)
      const schedEl = document.querySelector('[data-qa="vacancy-view-accept-temporary"]');
      const schedule = schedEl?.textContent?.trim() || null;

      // Published date
      const dateEl = document.querySelector('[data-qa="vacancy-creation-time"]') ||
                     document.querySelector('[class*="creation-time"]');
      const publishedAt = dateEl?.textContent?.trim() || null;

      return { description, skills, experience, employment, schedule, publishedAt };
    });

    if (!pageData.description) {
      log.warn('No description found for vacancy');
      return null;
    }

    // ✅ Вызов Gemini AI для анализа (Gemini 3 Flash - последняя версия)
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `Analyze this job vacancy and extract structured data in JSON format.

Vacancy Description:
${pageData.description.substring(0, 4000)}

Skills from page: ${pageData.skills?.join(', ')}

Extract:
1. techStack: array of { name, category (language|framework|tool|cloud), required (bool) }
2. seniorityLevel: junior | middle | senior | lead | principal (based on title and requirements)
3. requiresAi: boolean (mentions AI/ML/GPT/neural networks/deep learning/LLM/RAG)
4. benefits: array of strings (ДМС, Опционы, Обучение, Гибкий график, etc.)
5. workFormat: remote | hybrid | office
6. companySize: 1-10 | 11-50 | 51-200 | 201-500 | 500+ (if mentioned)
7. companyIndustry: string (Fintech, E-commerce, SaaS, GameDev, etc.)
8. contractType: permanent | contract | freelance | intern

Return valid JSON only, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Парсинг JSON из ответа Gemini
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.warn('Could not extract JSON from Gemini response');
      return null;
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // ✅ Объединяем данные со страницы + AI анализ
    const details = VacancyDetailsSchema.parse({
      ...pageData,
      ...aiData,
    });

    log.info('Successfully extracted vacancy details');
    return details;
  } catch (error) {
    log.error('Error extracting vacancy details', error instanceof Error ? error : undefined, { url: vacancyUrl });
    return null;
  }
}

/**
 * Главная функция скрапинга
 */
export async function scrapeVacanciesAsync(
  params: ISearchParams,
  _sourceId?: string, // Префикс _ чтобы избежать warning о неиспользуемой переменной
  saveCallback?: (vacancies: IScrapedVacancy[]) => Promise<{ saved: number; updated: number }>
): Promise<IScrapedVacancy[]> {
  log.info('scrapeVacanciesAsync called', { params });

  const { browser: _browser, context: _context, page } = await getBrowserAsync();
  const allVacancies: IScrapedVacancy[] = [];
  const maxPages = params.pages || 5;

  try {
    // Построение URL для поиска
    const searchUrl = new URL('https://hh.ru/search/vacancy');
    if (params.query) searchUrl.searchParams.set('text', params.query);
    if (params.area) searchUrl.searchParams.set('area', String(params.area));
    if (params.salary) searchUrl.searchParams.set('salary', String(params.salary));
    if (params.experience) searchUrl.searchParams.set('experience', params.experience);

    // ✅ ФИЛЬТР: Только удалённые вакансии (work_format=REMOTE)
    searchUrl.searchParams.set('work_format', 'REMOTE');
    searchUrl.searchParams.set('search_field', 'name');
    searchUrl.searchParams.append('search_field', 'company_name');
    searchUrl.searchParams.append('search_field', 'description');
    searchUrl.searchParams.set('enable_snippets', 'false');

    log.info(`Navigating to: ${searchUrl.toString()}`);
    await page.goto(searchUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 60000 // 60 секунд для сложных запросов
    });

    // Дополнительная задержка для загрузки JavaScript контента
    await page.waitForTimeout(3000);
    log.info('Page loaded, waiting for content to render...');

    // Скрапинг страниц
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      log.info(`Scraping page ${pageNum}/${maxPages}...`);

      // ШАГ 1: Быстрое извлечение через Playwright (0.1-0.5s)
      const rawVacancies = await extractVacanciesFromPageAsync(page);
      log.info(`Extracted ${rawVacancies.length} vacancies via Playwright`);

      if (rawVacancies.length === 0) {
        log.warn('No vacancies found on this page, stopping');
        break;
      }

      // ШАГ 2: Обработка каждой вакансии
      for (const raw of rawVacancies) {
        // Парсинг salary
        const salary = parseSalary(raw.salaryText);

        // Определение remote
        // Поскольку используем фильтр work_format=REMOTE, все вакансии удалённые
        // (даже если в location указан "Москва", это всё равно удалёнка по факту)
        const isRemote = true;

        // ✅ ETL Phase 1: Extract - только базовые данные из ленты
        const vacancy: IScrapedVacancy = {
          externalId: raw.externalId,
          url: raw.url,
          title: raw.title,
          company: raw.company,
          salaryFrom: salary.from,
          salaryTo: salary.to,
          currency: salary.currency,
          location: raw.location || undefined,
          remote: isRemote,
        };

        allVacancies.push(vacancy);
      }

      log.info(`Total vacancies collected so far: ${allVacancies.length}`);

      // Сохранение в БД после каждой страницы
      if (saveCallback && allVacancies.length > 0) {
        try {
          const currentPageVacancies = allVacancies.slice(-rawVacancies.length);
          const { saved, updated } = await saveCallback(currentPageVacancies);
          log.info(`Saved page ${pageNum} to database: ${saved} new, ${updated} updated`);
        } catch (saveError) {
          log.error('Failed to save page to database', saveError instanceof Error ? saveError : undefined);
        }
      }

      // Пагинация
      const hasNextPage = await page.locator('[data-qa="pager-next"]').count() > 0;
      if (!hasNextPage || pageNum >= maxPages) {
        log.info('No more pages or reached max pages limit');
        break;
      }

      // URL-based pagination
      log.info('Navigating to next page...');
      const currentUrl = new URL(page.url());
      currentUrl.searchParams.set('page', String(pageNum));
      await page.goto(currentUrl.toString(), {
        waitUntil: 'domcontentloaded',
        timeout: 60000 // Тот же таймаут что и для первой страницы
      });
      await page.waitForTimeout(3000); // Задержка для загрузки JS контента
      log.info(`Page ${pageNum + 1} loaded`);
    }

    log.info(`✅ Scraping completed! Total vacancies: ${allVacancies.length}`);
  } catch (error) {
    log.error('Error during scraping', error instanceof Error ? error : undefined);
    throw error;
  } finally {
    await page.close();
  }

  return allVacancies;
}
