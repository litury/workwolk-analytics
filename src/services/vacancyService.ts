/**
 * Сервис для работы с вакансиями
 * CRUD операции + оркестрация скрапинга
 */

import { db } from '../db/client';
import { sources, vacancies, type NewVacancy, type Vacancy, type Source } from '../db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { scrapeVacanciesAsync, type ISearchParams, type IScrapedVacancy } from '../scraper';

// Интерфейсы
export interface IVacancyFilters {
  sourceId?: string;
  skills?: string[];
  remote?: boolean;
  limit?: number;
  offset?: number;
}

export interface IScrapeResult {
  total: number;
  saved: number;
  updated: number;
  errors: string[];
}

// Источники по умолчанию
const DEFAULT_SOURCES = [
  { name: 'hh', displayName: 'HeadHunter', baseUrl: 'https://hh.ru' },
];

/**
 * Инициализация источников при старте
 */
export async function initSourcesAsync(): Promise<void> {
  for (const src of DEFAULT_SOURCES) {
    await db.insert(sources)
      .values(src)
      .onConflictDoNothing({ target: sources.name });
  }
}

/**
 * Получить источник по имени
 */
export async function getSourceByNameAsync(_name: string): Promise<Source | undefined> {
  const [source] = await db.select()
    .from(sources)
    .where(eq(sources.name, _name))
    .limit(1);
  return source;
}

/**
 * Получить список вакансий из БД
 */
export async function getVacanciesAsync(_filters: IVacancyFilters = {}): Promise<Vacancy[]> {
  const { sourceId, skills, remote, limit = 50, offset = 0 } = _filters;

  let query = db.select().from(vacancies).$dynamic();

  const conditions = [];

  if (sourceId) {
    conditions.push(eq(vacancies.sourceId, sourceId));
  }

  if (remote !== undefined) {
    conditions.push(eq(vacancies.remote, remote));
  }

  if (skills && skills.length > 0) {
    // Поиск по jsonb массиву skills
    conditions.push(sql`${vacancies.skills} ?| ${skills}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query
    .orderBy(desc(vacancies.collectedAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Получить количество вакансий
 */
export async function countVacanciesAsync(_filters: IVacancyFilters = {}): Promise<number> {
  const { sourceId, remote } = _filters;

  const conditions = [];

  if (sourceId) {
    conditions.push(eq(vacancies.sourceId, sourceId));
  }

  if (remote !== undefined) {
    conditions.push(eq(vacancies.remote, remote));
  }

  const [result] = await db.select({ count: sql<number>`count(*)` })
    .from(vacancies)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return Number(result?.count ?? 0);
}

/**
 * Сохранить вакансии (upsert)
 */
export async function saveVacanciesAsync(
  _sourceId: string,
  _vacancies: IScrapedVacancy[]
): Promise<{ saved: number; updated: number }> {
  let saved = 0;
  let updated = 0;

  for (const v of _vacancies) {
    const vacancy: NewVacancy = {
      sourceId: _sourceId,
      externalId: v.externalId,
      url: v.url,
      title: v.title,
      company: v.company,
      companyUrl: v.companyUrl,
      salaryFrom: v.salaryFrom,
      salaryTo: v.salaryTo,
      currency: v.currency,
      description: v.description,
      skills: v.skills,
      experience: v.experience,
      location: v.location,
      remote: v.remote,
      publishedAt: v.publishedAt,
    };

    // Upsert: вставить или обновить
    const result = await db.insert(vacancies)
      .values(vacancy)
      .onConflictDoUpdate({
        target: [vacancies.sourceId, vacancies.externalId],
        set: {
          title: vacancy.title,
          company: vacancy.company,
          salaryFrom: vacancy.salaryFrom,
          salaryTo: vacancy.salaryTo,
          currency: vacancy.currency,
          description: vacancy.description,
          skills: vacancy.skills,
          updatedAt: new Date(),
        },
      })
      .returning({ id: vacancies.id, updatedAt: vacancies.updatedAt });

    // Определяем, был ли это insert или update
    const row = result[0];
    if (row && row.updatedAt && row.updatedAt.getTime() > Date.now() - 1000) {
      updated++;
    } else {
      saved++;
    }
  }

  return { saved, updated };
}

/**
 * Запустить скрапинг и сохранить результаты
 */
export async function scrapeAndSaveAsync(_params: ISearchParams): Promise<IScrapeResult> {
  const result: IScrapeResult = {
    total: 0,
    saved: 0,
    updated: 0,
    errors: [],
  };

  // Получаем источник
  const source = await getSourceByNameAsync('hh');
  if (!source) {
    result.errors.push('Источник hh не найден');
    return result;
  }

  try {
    // Скрапим вакансии
    const scraped = await scrapeVacanciesAsync(_params);
    result.total = scraped.length;

    if (scraped.length > 0) {
      // Сохраняем в БД
      const { saved, updated } = await saveVacanciesAsync(source.id, scraped);
      result.saved = saved;
      result.updated = updated;

      // Обновляем время последнего скрапинга
      await db.update(sources)
        .set({ lastScrapedAt: new Date() })
        .where(eq(sources.id, source.id));
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err));
  }

  return result;
}

/**
 * Экспорт вакансий в JSON
 */
export async function exportVacanciesJsonAsync(_filters: IVacancyFilters = {}): Promise<string> {
  const data = await getVacanciesAsync({ ..._filters, limit: 10000 });
  return JSON.stringify(data, null, 2);
}

/**
 * Экспорт вакансий в CSV
 */
export async function exportVacanciesCsvAsync(_filters: IVacancyFilters = {}): Promise<string> {
  const data = await getVacanciesAsync({ ..._filters, limit: 10000 });

  const headers = [
    'id', 'title', 'company', 'url', 'salaryFrom', 'salaryTo',
    'currency', 'location', 'remote', 'skills', 'publishedAt'
  ];

  const rows = data.map(v => [
    v.id,
    `"${(v.title || '').replace(/"/g, '""')}"`,
    `"${(v.company || '').replace(/"/g, '""')}"`,
    v.url,
    v.salaryFrom ?? '',
    v.salaryTo ?? '',
    v.currency ?? '',
    `"${(v.location || '').replace(/"/g, '""')}"`,
    v.remote ? 'true' : 'false',
    `"${(v.skills || []).join(', ')}"`,
    v.publishedAt?.toISOString() ?? '',
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
