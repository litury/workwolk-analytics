/**
 * Сервис для работы с вакансиями
 * CRUD операции + оркестрация скрапинга
 */

import { db } from '../../shared/db/client';
import { sources, vacancies, type NewVacancy, type Vacancy, type Source } from '../../shared/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { scrapeVacanciesAsync, type ISearchParams, type IScrapedVacancy } from '../hh';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('VacancyService');

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
      // === НОВЫЕ ПОЛЯ (Phase 1: Quick Wins) ===
      companySize: v.companySize,
      companyIndustry: v.companyIndustry,
      seniorityLevel: v.seniorityLevel,
      workFormat: v.workFormat,
      contractType: v.contractType,
      benefits: v.benefits,
      requiresAi: v.requiresAi,
      techStack: v.techStack,
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
          // Обновляем новые поля
          companySize: vacancy.companySize,
          companyIndustry: vacancy.companyIndustry,
          seniorityLevel: vacancy.seniorityLevel,
          workFormat: vacancy.workFormat,
          contractType: vacancy.contractType,
          benefits: vacancy.benefits,
          requiresAi: vacancy.requiresAi,
          techStack: vacancy.techStack,
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
  log.info('scrapeAndSaveAsync called', { params: _params });
  const result: IScrapeResult = {
    total: 0,
    saved: 0,
    updated: 0,
    errors: [],
  };

  // Получаем источник
  log.info('Getting source hh from database...');
  const source = await getSourceByNameAsync('hh');
  if (!source) {
    result.errors.push('Источник hh не найден');
    return result;
  }

  try {
    // Скрапим вакансии с автосохранением после каждой страницы
    log.info('Starting scraping...', { params: _params });

    // Колбэк для сохранения вакансий после каждой страницы
    const savePageCallback = async (pageVacancies: IScrapedVacancy[]) => {
      const { saved, updated } = await saveVacanciesAsync(source.id, pageVacancies);
      result.saved += saved;
      result.updated += updated;
      return { saved, updated };
    };

    const scraped = await scrapeVacanciesAsync(_params, source.id, savePageCallback);
    log.info('Scraping completed', { count: scraped.length });
    result.total = scraped.length;

    // Обновляем время последнего скрапинга
    await db.update(sources)
      .set({ lastScrapedAt: new Date() })
      .where(eq(sources.id, source.id));
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

/**
 * Интерфейс для аналитических данных
 */
export interface IAnalytics {
  // Базовые метрики
  totalVacancies: number;
  remoteVacancies: number;
  averageSalaryFrom: number | null;
  averageSalaryTo: number | null;
  topSkills: Array<{ skill: string; count: number }>;
  lastScrapedAt: Date | null;
  activeSources: number;
  // === НОВЫЕ МЕТРИКИ (Phase 1: Quick Wins) ===
  aiAdoptionRate: number;  // Процент вакансий с requiresAi = true
  seniorityDistribution: Array<{ level: string; count: number }>;
  topBenefits: Array<{ benefit: string; count: number }>;
  workFormatDistribution: Array<{ format: string; count: number }>;
  topTechStack: Array<{ tech: string; count: number }>;  // Из structured techStack
}

/**
 * Получить агрегированные аналитические данные
 */
export async function getAnalyticsAsync(): Promise<IAnalytics> {
  // Общее количество вакансий
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(vacancies);
  const totalVacancies = Number(totalResult?.count ?? 0);

  // Количество удаленных вакансий
  const [remoteResult] = await db.select({ count: sql<number>`count(*)` })
    .from(vacancies)
    .where(eq(vacancies.remote, true));
  const remoteVacancies = Number(remoteResult?.count ?? 0);

  // Средняя зарплата (от)
  const [avgFromResult] = await db.select({
    avg: sql<number>`avg(${vacancies.salaryFrom})`
  })
    .from(vacancies)
    .where(sql`${vacancies.salaryFrom} IS NOT NULL`);
  const averageSalaryFrom = avgFromResult?.avg ? Math.round(Number(avgFromResult.avg)) : null;

  // Средняя зарплата (до)
  const [avgToResult] = await db.select({
    avg: sql<number>`avg(${vacancies.salaryTo})`
  })
    .from(vacancies)
    .where(sql`${vacancies.salaryTo} IS NOT NULL`);
  const averageSalaryTo = avgToResult?.avg ? Math.round(Number(avgToResult.avg)) : null;

  // Топ навыков (распаковываем JSONB массив и считаем)
  const topSkillsResult = await db.execute<{ skill: string; count: number }>(sql`
    SELECT skill, COUNT(*) as count
    FROM ${vacancies}, jsonb_array_elements_text(skills) AS skill
    WHERE skills IS NOT NULL
    GROUP BY skill
    ORDER BY count DESC
    LIMIT 10
  `);
  const topSkills = Array.isArray(topSkillsResult)
    ? topSkillsResult.map(row => ({
        skill: row.skill,
        count: Number(row.count)
      }))
    : [];

  // Последнее время скрапинга
  const [lastScrapedResult] = await db.select({ lastScrapedAt: sources.lastScrapedAt })
    .from(sources)
    .orderBy(desc(sources.lastScrapedAt))
    .limit(1);
  const lastScrapedAt = lastScrapedResult?.lastScrapedAt ?? null;

  // Количество активных источников
  const [activeSourcesResult] = await db.select({ count: sql<number>`count(*)` })
    .from(sources)
    .where(eq(sources.enabled, true));
  const activeSources = Number(activeSourcesResult?.count ?? 0);

  // === НОВЫЕ МЕТРИКИ (Phase 1: Quick Wins) ===

  // AI adoption rate (% вакансий с requiresAi = true)
  const [aiCountResult] = await db.select({ count: sql<number>`count(*)` })
    .from(vacancies)
    .where(eq(vacancies.requiresAi, true));
  const aiCount = Number(aiCountResult?.count ?? 0);
  const aiAdoptionRate = totalVacancies > 0 ? Math.round((aiCount / totalVacancies) * 100) : 0;

  // Seniority distribution
  const seniorityResult = await db.select({
    level: vacancies.seniorityLevel,
    count: sql<number>`count(*)`,
  })
    .from(vacancies)
    .where(sql`${vacancies.seniorityLevel} IS NOT NULL`)
    .groupBy(vacancies.seniorityLevel)
    .orderBy(sql`count(*) DESC`);
  const seniorityDistribution = seniorityResult.map(row => ({
    level: row.level || 'unknown',
    count: Number(row.count),
  }));

  // Top benefits (unnest JSONB array)
  const benefitsResult = await db.execute<{ benefit: string; count: number }>(sql`
    SELECT benefit, COUNT(*) as count
    FROM ${vacancies}, jsonb_array_elements_text(benefits) AS benefit
    WHERE benefits IS NOT NULL
    GROUP BY benefit
    ORDER BY count DESC
    LIMIT 10
  `);
  const topBenefits = Array.isArray(benefitsResult)
    ? benefitsResult.map(row => ({ benefit: row.benefit, count: Number(row.count) }))
    : [];

  // Work format distribution
  const workFormatResult = await db.select({
    format: vacancies.workFormat,
    count: sql<number>`count(*)`,
  })
    .from(vacancies)
    .where(sql`${vacancies.workFormat} IS NOT NULL`)
    .groupBy(vacancies.workFormat)
    .orderBy(sql`count(*) DESC`);
  const workFormatDistribution = workFormatResult.map(row => ({
    format: row.format || 'unknown',
    count: Number(row.count),
  }));

  // Top tech stack (unnest structured JSONB array and count by name)
  const techStackResult = await db.execute<{ tech: string; count: number }>(sql`
    SELECT tech->>'name' as tech, COUNT(*) as count
    FROM ${vacancies}, jsonb_array_elements(tech_stack) AS tech
    WHERE tech_stack IS NOT NULL
    GROUP BY tech->>'name'
    ORDER BY count DESC
    LIMIT 15
  `);
  const topTechStack = Array.isArray(techStackResult)
    ? techStackResult.map(row => ({ tech: row.tech, count: Number(row.count) }))
    : [];

  return {
    totalVacancies,
    remoteVacancies,
    averageSalaryFrom,
    averageSalaryTo,
    topSkills,
    lastScrapedAt,
    activeSources,
    aiAdoptionRate,
    seniorityDistribution,
    topBenefits,
    workFormatDistribution,
    topTechStack,
  };
}
