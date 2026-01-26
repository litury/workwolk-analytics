/**
 * Сервис для работы с вакансиями
 * CRUD операции + оркестрация скрапинга
 */

import { db } from '../../shared/db/client';
import { sources, vacancies, type NewVacancy, type Vacancy, type Source } from '../../shared/db/schema';
import { eq, desc, and, gte, sql, isNotNull } from 'drizzle-orm';
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
  // === AI ENRICHED METRICS ===
  categoryDistribution: Array<{
    category: string;
    count: number;
    avgMinSalary: number;
    avgMaxSalary: number;
    companies: number;
  }>;
  topCompanies: Array<{
    company: string;
    type: string | null;
    vacancies: number;
    categories: number;
    avgMinSalary: number;
    avgMaxSalary: number;
  }>;
  salaryPercentiles: {
    bySeniority: Array<{
      level: string;
      count: number;
      p25: number;
      p50: number;
      p75: number;
      aiJobs: number;
    }>;
  };
  techStackDetailed: Array<{
    name: string;
    category: string;
    count: number;
    requiredPercent: number;
  }>;
  aiAdoptionByCategory: Array<{
    category: string;
    total: number;
    aiJobs: number;
    aiPercentage: number;
  }>;
  // === ADDITIONAL ENRICHED METRICS ===
  topJobTags: Array<{ tag: string; count: number }>;
  companySizeDistribution: Array<{ size: string; count: number }>;
  contractTypeDistribution: Array<{ type: string; count: number }>;
  topIndustries: Array<{ industry: string; count: number; avgSalary: number }>;
  // === SALARY METRICS (AI-enriched) ===
  salaryBySeniority: Array<{
    level: string;  // junior, middle, senior, lead, principal
    count: number;
    avgMin: number;
    avgMax: number;
    p25: number;
    p50: number;
    p75: number;
  }>;
  salaryDistribution: {
    withSalary: number;
    withoutSalary: number;
    percentWithSalary: number;
  };
}

/**
 * Получить агрегированные аналитические данные
 */
export async function getAnalyticsAsync(): Promise<IAnalytics> {
  // Общее количество вакансий (только AI-enriched)
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(vacancies)
    .where(isNotNull(vacancies.aiEnrichedAt));
  const totalVacancies = Number(totalResult?.count ?? 0);

  // Количество удаленных вакансий (только AI-enriched)
  const [remoteResult] = await db.select({ count: sql<number>`count(*)` })
    .from(vacancies)
    .where(and(
      eq(vacancies.remote, true),
      isNotNull(vacancies.aiEnrichedAt)
    ));
  const remoteVacancies = Number(remoteResult?.count ?? 0);

  // Средняя зарплата (из AI salary_recommendation)
  const [avgSalaryResult] = await db.execute<{
    avg_min: string;
    avg_max: string;
  }>(sql`
    SELECT
      ROUND(AVG((salary_recommendation->>'min')::numeric)) as avg_min,
      ROUND(AVG((salary_recommendation->>'max')::numeric)) as avg_max
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL
      AND salary_recommendation IS NOT NULL
  `);

  const averageSalaryFrom = avgSalaryResult?.avg_min ? Number(avgSalaryResult.avg_min) : null;
  const averageSalaryTo = avgSalaryResult?.avg_max ? Number(avgSalaryResult.avg_max) : null;

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

  // === AI ENRICHED METRICS ===

  // Category distribution with salaries
  const categoryResult = await db.execute<{
    job_category: string;
    count: string;
    companies: string;
    avg_min: string;
    avg_max: string;
  }>(sql`
    SELECT
      job_category,
      COUNT(*) as count,
      COUNT(DISTINCT company_name_normalized) as companies,
      ROUND(AVG((salary_recommendation->>'min')::numeric)) as avg_min,
      ROUND(AVG((salary_recommendation->>'max')::numeric)) as avg_max
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL AND job_category IS NOT NULL
    GROUP BY job_category
    ORDER BY count DESC
  `);
  const categoryDistribution = Array.isArray(categoryResult)
    ? categoryResult.map(row => ({
        category: row.job_category,
        count: Number(row.count),
        avgMinSalary: Number(row.avg_min || 0),
        avgMaxSalary: Number(row.avg_max || 0),
        companies: Number(row.companies),
      }))
    : [];

  // Top companies (normalized) with types and salaries
  const companiesResult = await db.execute<{
    company: string;
    company_type: string | null;
    vacancies: string;
    categories: string;
    avg_min: string;
    avg_max: string;
  }>(sql`
    SELECT
      company_name_normalized as company,
      company_type,
      COUNT(*) as vacancies,
      COUNT(DISTINCT job_category) as categories,
      ROUND(AVG((salary_recommendation->>'min')::numeric)) as avg_min,
      ROUND(AVG((salary_recommendation->>'max')::numeric)) as avg_max
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL
      AND company_name_normalized IS NOT NULL
    GROUP BY company_name_normalized, company_type
    HAVING COUNT(*) >= 3
    ORDER BY vacancies DESC
    LIMIT 15
  `);
  const topCompanies = Array.isArray(companiesResult)
    ? companiesResult.map(row => ({
        company: row.company,
        type: row.company_type,
        vacancies: Number(row.vacancies),
        categories: Number(row.categories),
        avgMinSalary: Number(row.avg_min || 0),
        avgMaxSalary: Number(row.avg_max || 0),
      }))
    : [];

  // Salary percentiles by seniority
  const percentilesBySeniorityResult = await db.execute<{
    seniority_level: string;
    count: string;
    p25: string;
    p50: string;
    p75: string;
    ai_jobs: string;
  }>(sql`
    SELECT
      seniority_level,
      COUNT(*) as count,
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric)) as p25,
      ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric)) as p50,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric)) as p75,
      COUNT(CASE WHEN requires_ai = true THEN 1 END) as ai_jobs
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL
      AND seniority_level IS NOT NULL
      AND salary_recommendation IS NOT NULL
    GROUP BY seniority_level
    ORDER BY
      CASE seniority_level
        WHEN 'junior' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'senior' THEN 3
        WHEN 'lead' THEN 4
        WHEN 'principal' THEN 5
      END
  `);
  const bySeniority = Array.isArray(percentilesBySeniorityResult)
    ? percentilesBySeniorityResult.map(row => ({
        level: row.seniority_level,
        count: Number(row.count),
        p25: Number(row.p25 || 0),
        p50: Number(row.p50 || 0),
        p75: Number(row.p75 || 0),
        aiJobs: Number(row.ai_jobs),
      }))
    : [];

  // Detailed tech stack with category and required percentage
  const techStackDetailedResult = await db.execute<{
    technology: string;
    category: string;
    count: string;
    required_pct: string;
  }>(sql`
    SELECT
      tech->>'name' as technology,
      tech->>'category' as category,
      COUNT(*) as count,
      ROUND(COUNT(CASE WHEN (tech->>'required')::boolean = true THEN 1 END) * 100.0 / COUNT(*), 1) as required_pct
    FROM ${vacancies}
    CROSS JOIN LATERAL jsonb_array_elements(tech_stack) as tech
    WHERE ai_enriched_at IS NOT NULL
    GROUP BY tech->>'name', tech->>'category'
    HAVING COUNT(*) >= 1
    ORDER BY count DESC
    LIMIT 20
  `);
  const techStackDetailed = Array.isArray(techStackDetailedResult)
    ? techStackDetailedResult.map(row => ({
        name: row.technology,
        category: row.category,
        count: Number(row.count),
        requiredPercent: Number(row.required_pct || 0),
      }))
    : [];

  // AI adoption by category
  const aiAdoptionResult = await db.execute<{
    job_category: string;
    total: string;
    ai_jobs: string;
    ai_percentage: string;
  }>(sql`
    SELECT
      job_category,
      COUNT(*) as total,
      COUNT(CASE WHEN requires_ai = true THEN 1 END) as ai_jobs,
      ROUND(COUNT(CASE WHEN requires_ai = true THEN 1 END) * 100.0 / COUNT(*), 1) as ai_percentage
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL AND job_category IS NOT NULL
    GROUP BY job_category
    HAVING COUNT(*) >= 5
    ORDER BY ai_percentage DESC
  `);
  const aiAdoptionByCategory = Array.isArray(aiAdoptionResult)
    ? aiAdoptionResult.map(row => ({
        category: row.job_category,
        total: Number(row.total),
        aiJobs: Number(row.ai_jobs),
        aiPercentage: Number(row.ai_percentage || 0),
      }))
    : [];

  // === ADDITIONAL ENRICHED METRICS ===

  // Top job tags
  const jobTagsResult = await db.execute<{ tag: string; count: number }>(sql`
    SELECT tag, COUNT(*) as count
    FROM ${vacancies}, jsonb_array_elements_text(job_tags) AS tag
    WHERE ai_enriched_at IS NOT NULL AND job_tags IS NOT NULL
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 15
  `);
  const topJobTags = Array.isArray(jobTagsResult)
    ? jobTagsResult.map(row => ({ tag: row.tag, count: Number(row.count) }))
    : [];

  // Company size distribution
  const companySizeResult = await db.select({
    size: vacancies.companySize,
    count: sql<number>`count(*)`,
  })
    .from(vacancies)
    .where(sql`${vacancies.companySize} IS NOT NULL`)
    .groupBy(vacancies.companySize)
    .orderBy(sql`count(*) DESC`);
  const companySizeDistribution = companySizeResult.map(row => ({
    size: row.size || 'unknown',
    count: Number(row.count),
  }));

  // Contract type distribution
  const contractTypeResult = await db.select({
    type: vacancies.contractType,
    count: sql<number>`count(*)`,
  })
    .from(vacancies)
    .where(sql`${vacancies.contractType} IS NOT NULL`)
    .groupBy(vacancies.contractType)
    .orderBy(sql`count(*) DESC`);
  const contractTypeDistribution = contractTypeResult.map(row => ({
    type: row.type || 'unknown',
    count: Number(row.count),
  }));

  // Top industries with avg salary
  const industriesResult = await db.execute<{
    industry: string;
    count: string;
    avg_salary: string;
  }>(sql`
    SELECT
      company_industry as industry,
      COUNT(*) as count,
      ROUND(AVG((salary_from + salary_to) / 2)) as avg_salary
    FROM ${vacancies}
    WHERE company_industry IS NOT NULL
      AND salary_from IS NOT NULL
      AND salary_to IS NOT NULL
    GROUP BY company_industry
    ORDER BY count DESC
    LIMIT 10
  `);
  const topIndustries = Array.isArray(industriesResult)
    ? industriesResult.map(row => ({
        industry: row.industry,
        count: Number(row.count),
        avgSalary: Number(row.avg_salary || 0),
      }))
    : [];

  // === SALARY METRICS (AI-enriched) ===

  // Salary analysis by seniority level (AI-enriched)
  const salaryBySeniorityResult = await db.execute<{
    seniority_level: string;
    count: string;
    avg_min: string;
    avg_max: string;
    p25: string;
    p50: string;
    p75: string;
  }>(sql`
    SELECT
      seniority_level,
      COUNT(*) as count,
      ROUND(AVG((salary_recommendation->>'min')::numeric)) as avg_min,
      ROUND(AVG((salary_recommendation->>'max')::numeric)) as avg_max,
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric)) as p25,
      ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric)) as p50,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (salary_recommendation->>'min')::numeric)) as p75
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL
      AND seniority_level IS NOT NULL
      AND salary_recommendation IS NOT NULL
    GROUP BY seniority_level
    ORDER BY
      CASE seniority_level
        WHEN 'junior' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'senior' THEN 3
        WHEN 'lead' THEN 4
        WHEN 'principal' THEN 5
        ELSE 6
      END
  `);

  const salaryBySeniority = Array.isArray(salaryBySeniorityResult)
    ? salaryBySeniorityResult.map(row => ({
        level: row.seniority_level,
        count: Number(row.count),
        avgMin: Number(row.avg_min || 0),
        avgMax: Number(row.avg_max || 0),
        p25: Number(row.p25 || 0),
        p50: Number(row.p50 || 0),
        p75: Number(row.p75 || 0),
      }))
    : [];

  // Salary distribution (AI-enriched вакансии с/без salaryRecommendation)
  const [salaryStatsResult] = await db.execute<{
    with_salary: string;
    without_salary: string;
  }>(sql`
    SELECT
      COUNT(CASE WHEN salary_recommendation IS NOT NULL THEN 1 END) as with_salary,
      COUNT(CASE WHEN salary_recommendation IS NULL THEN 1 END) as without_salary
    FROM ${vacancies}
    WHERE ai_enriched_at IS NOT NULL
  `);

  const withSalary = Number(salaryStatsResult?.with_salary || 0);
  const withoutSalary = Number(salaryStatsResult?.without_salary || 0);
  const totalAiEnriched = withSalary + withoutSalary;
  const percentWithSalary = totalAiEnriched > 0
    ? Math.round((withSalary / totalAiEnriched) * 100)
    : 0;

  const salaryDistribution = {
    withSalary,
    withoutSalary,
    percentWithSalary,
  };

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
    categoryDistribution,
    topCompanies,
    salaryPercentiles: { bySeniority },
    techStackDetailed,
    aiAdoptionByCategory,
    topJobTags,
    companySizeDistribution,
    contractTypeDistribution,
    topIndustries,
    salaryBySeniority,
    salaryDistribution,
  };
}
