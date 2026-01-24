/**
 * Скрапер вакансий с HH.ru
 * Использует Stagehand для AI-powered парсинга страниц поиска
 */

import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { createLogger } from '../../shared/utils/logger';

export interface ISearchParams {
  query?: string;
  area?: number;      // ID региона (1 = Москва)
  salary?: number;
  experience?: string;
  pages?: number;
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
}

// Схема для одной вакансии
const VacancySchema = z.object({
  externalId: z.string().describe('Vacancy ID extracted from URL path (e.g., /vacancy/123456 → "123456")'),
  title: z.string().describe('Job title'),
  company: z.string().describe('Company name'),
  url: z.string().url().describe('Full URL to the vacancy page'),
  salaryText: z.string().optional().describe('Salary information as displayed (e.g., "от 100 000 до 150 000 руб.")'),
  location: z.string().optional().describe('Job location (city or remote indicator)'),
});

// Схема для страницы с вакансиями
const VacanciesPageSchema = z.object({
  vacancies: z.array(VacancySchema).describe('Array of all job vacancies visible on current page'),
  hasNextPage: z.boolean().describe('True if there is a "Next page" or pagination button available'),
});

type ExtractedPage = z.infer<typeof VacanciesPageSchema>;

const log = createLogger('HHScraper');
let stagehand: Stagehand | null = null;

// Получить или создать Stagehand
async function getStagehandAsync(): Promise<Stagehand> {
  if (!stagehand) {
    log.info('Initializing Stagehand browser...');
    stagehand = new Stagehand({
      env: 'LOCAL', // Локальный браузер без Browserbase
      model: 'google/gemini-2.5-flash', // v3 использует 'model' вместо 'modelName'
      localBrowserLaunchOptions: {
        headless: env.headless,
      },
      verbose: 1, // Логирование для отладки
      domSettleTimeout: 3000, // Ждем загрузки динамического контента (ms)
    });
    log.info('Calling stagehand.init()...');
    await stagehand.init();
    log.info('Stagehand initialized successfully!');
  }
  return stagehand;
}

// Закрыть Stagehand
export async function closeStagehandAsync(): Promise<void> {
  if (stagehand) {
    await stagehand.close();
    stagehand = null;
  }
}

// Парсинг зарплаты из строки "от 100 000 до 150 000 руб."
function parseSalary(_salaryText: string | null): { from?: number; to?: number; currency?: string } {
  if (!_salaryText) return {};

  const text = _salaryText.toLowerCase().replace(/\s+/g, '');
  const numbers = text.match(/\d+/g)?.map(Number) || [];

  let currency: string | undefined;
  if (text.includes('руб') || text.includes('₽')) currency = 'RUB';
  else if (text.includes('usd') || text.includes('$')) currency = 'USD';
  else if (text.includes('eur') || text.includes('€')) currency = 'EUR';

  if (text.includes('от') && text.includes('до') && numbers.length >= 2) {
    return { from: numbers[0], to: numbers[1], currency };
  } else if (text.includes('от') && numbers.length >= 1) {
    return { from: numbers[0], currency };
  } else if (text.includes('до') && numbers.length >= 1) {
    return { to: numbers[0], currency };
  } else if (numbers.length >= 1) {
    return { from: numbers[0], to: numbers[0], currency };
  }

  return { currency };
}

// Основная функция скрапинга
export async function scrapeVacanciesAsync(params: ISearchParams): Promise<IScrapedVacancy[]> {
  log.info('scrapeVacanciesAsync called', { params });
  const stagehand = await getStagehandAsync();
  log.info('Got Stagehand instance');

  // v3: получаем page из context
  const page = stagehand.context.pages()[0];

  const allVacancies: IScrapedVacancy[] = [];
  const maxPages = params.pages || 5;

  try {
    // Формируем URL поиска HH.ru
    const searchUrl = new URL('https://hh.ru/search/vacancy');
    if (params.query) searchUrl.searchParams.set('text', params.query);
    if (params.area) searchUrl.searchParams.set('area', String(params.area));
    if (params.salary) searchUrl.searchParams.set('salary', String(params.salary));
    if (params.experience) searchUrl.searchParams.set('experience', params.experience);

    log.info(`Navigating to: ${searchUrl.toString()}`);
    await page.goto(searchUrl.toString());

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      log.info(`Scraping page ${pageNum}/${maxPages}...`);

      // AI-powered извлечение данных со страницы
      const extracted = await stagehand.extract(
        `Extract all job vacancies from this HeadHunter search results page.
        For each vacancy card:
        - Extract the vacancy ID from the URL (e.g., /vacancy/123456 → "123456")
        - Get the job title
        - Get the company name
        - Get the full URL link to the vacancy
        - Get salary information exactly as displayed (e.g., "от 100 000 до 150 000 руб.")
        - Get the location/city information

        Also determine if there is a "Next page" button or pagination available.`,
        VacanciesPageSchema
      ) as ExtractedPage;

      log.info(`Extracted ${extracted.vacancies.length} vacancies from page ${pageNum}`);

      // Преобразуем извлеченные данные в формат IScrapedVacancy
      for (const vacancy of extracted.vacancies) {
        const salary = parseSalary(vacancy.salaryText || null);

        // Определяем удаленку по ключевым словам в локации
        const isRemote =
          vacancy.location?.toLowerCase().includes('удал') ||
          vacancy.location?.toLowerCase().includes('remote') ||
          vacancy.location?.toLowerCase().includes('дистанц') ||
          false;

        allVacancies.push({
          externalId: vacancy.externalId,
          url: vacancy.url.startsWith('http') ? vacancy.url : `https://hh.ru${vacancy.url}`,
          title: vacancy.title.trim(),
          company: vacancy.company.trim(),
          salaryFrom: salary.from,
          salaryTo: salary.to,
          currency: salary.currency,
          location: vacancy.location?.trim(),
          remote: isRemote,
        });
      }

      // Проверка наличия следующей страницы
      if (!extracted.hasNextPage || pageNum >= maxPages) {
        log.info('No more pages or reached max pages limit');
        break;
      }

      // AI-powered клик по кнопке "Следующая страница"
      log.info('Clicking next page button...');
      await stagehand.act('click on the next page button to load more vacancies');

      // Ждем загрузки новой страницы
      await page.waitForLoadState('networkidle');

      // Небольшая задержка для имитации человека
      await page.waitForTimeout(1000 + Math.random() * 2000);
    }

    log.info(`Total vacancies scraped: ${allVacancies.length}`);
  } catch (error) {
    log.error('Error during scraping', error instanceof Error ? error : undefined, { error });
    throw error;
  }

  return allVacancies;
}
