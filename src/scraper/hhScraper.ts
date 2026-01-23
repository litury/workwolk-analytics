/**
 * Скрапер вакансий с HH.ru
 * Использует Playwright для парсинга страниц поиска
 */

import { chromium, type Browser, type Page } from 'playwright';

// Селекторы HH.ru (data-qa атрибуты для стабильности)
const HH_SELECTORS = {
  vacancyCard: '[data-qa="vacancy-serp__vacancy"]',
  title: '[data-qa="serp-item__title"]',
  company: '[data-qa="vacancy-serp__vacancy-employer"]',
  salary: '[data-qa="vacancy-serp__vacancy-compensation"]',
  location: '[data-qa="vacancy-serp__vacancy-address"]',
  nextPage: '[data-qa="pager-next"]',
};

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

let p_browser: Browser | null = null;

// Получить или создать браузер
async function getBrowserAsync(): Promise<Browser> {
  if (!p_browser) {
    p_browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return p_browser;
}

// Закрыть браузер
export async function closeBrowserAsync(): Promise<void> {
  if (p_browser) {
    await p_browser.close();
    p_browser = null;
  }
}

// Случайная задержка для имитации человека
function randomDelay(_min: number = 1000, _max: number = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (_max - _min + 1)) + _min;
  return new Promise(resolve => setTimeout(resolve, delay));
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

// Скрапинг одной страницы
async function scrapePageAsync(_page: Page): Promise<IScrapedVacancy[]> {
  const vacancies: IScrapedVacancy[] = [];

  const cards = await _page.$$(HH_SELECTORS.vacancyCard);

  for (const card of cards) {
    try {
      const titleEl = await card.$(HH_SELECTORS.title);
      const companyEl = await card.$(HH_SELECTORS.company);
      const salaryEl = await card.$(HH_SELECTORS.salary);
      const locationEl = await card.$(HH_SELECTORS.location);

      const title = await titleEl?.textContent() || '';
      const url = await titleEl?.getAttribute('href') || '';
      const company = await companyEl?.textContent() || '';
      const salaryText = await salaryEl?.textContent();
      const location = await locationEl?.textContent() || '';

      // Извлекаем ID из URL
      const idMatch = url.match(/vacancy\/(\d+)/);
      const externalId = idMatch?.[1] || '';

      if (!externalId || !title) continue;

      const salary = parseSalary(salaryText || null);

      // Определяем удалёнку по локации
      const isRemote = location.toLowerCase().includes('удал') ||
                       location.toLowerCase().includes('remote');

      vacancies.push({
        externalId,
        url: url.startsWith('http') ? url : `https://hh.ru${url}`,
        title: title.trim(),
        company: company.trim(),
        salaryFrom: salary.from,
        salaryTo: salary.to,
        currency: salary.currency,
        location: location.trim(),
        remote: isRemote,
      });
    } catch (error) {
      // Пропускаем битые карточки
      console.error('Ошибка парсинга карточки:', error);
    }
  }

  return vacancies;
}

// Основная функция скрапинга
export async function scrapeVacanciesAsync(_params: ISearchParams): Promise<IScrapedVacancy[]> {
  const browser = await getBrowserAsync();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const allVacancies: IScrapedVacancy[] = [];
  const maxPages = _params.pages || 5;

  try {
    // Формируем URL поиска
    const searchUrl = new URL('https://hh.ru/search/vacancy');
    if (_params.query) searchUrl.searchParams.set('text', _params.query);
    if (_params.area) searchUrl.searchParams.set('area', String(_params.area));
    if (_params.salary) searchUrl.searchParams.set('salary', String(_params.salary));
    if (_params.experience) searchUrl.searchParams.set('experience', _params.experience);

    await page.goto(searchUrl.toString(), { waitUntil: 'networkidle' });
    await randomDelay();

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Скрапинг страницы ${pageNum}...`);

      const pageVacancies = await scrapePageAsync(page);
      allVacancies.push(...pageVacancies);

      // Проверяем есть ли следующая страница
      const nextButton = await page.$(HH_SELECTORS.nextPage);
      if (!nextButton || pageNum >= maxPages) break;

      await nextButton.click();
      await page.waitForLoadState('networkidle');
      await randomDelay();
    }
  } finally {
    await context.close();
  }

  return allVacancies;
}
