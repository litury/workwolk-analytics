/**
 * API клиент для взаимодействия с бэкендом
 */

// Типы данных
export interface IVacancy {
  id: string;
  sourceId: string;
  externalId: string;
  url: string;
  title: string;
  company: string | null;
  companyUrl: string | null;
  salaryFrom: number | null;
  salaryTo: number | null;
  currency: string | null;
  description: string | null;
  skills: string[] | null;
  experience: string | null;
  location: string | null;
  remote: boolean;
  publishedAt: Date | null;
  collectedAt: Date;
  updatedAt: Date;
}

export interface IAnalytics {
  // Базовые метрики
  totalVacancies: number;
  remoteVacancies: number;
  averageSalaryFrom: number | null;
  averageSalaryTo: number | null;
  topSkills: Array<{ skill: string; count: number }>;
  lastScrapedAt: string | null;
  activeSources: number;
  // === НОВЫЕ МЕТРИКИ (Phase 1: Quick Wins) ===
  aiAdoptionRate: number;
  seniorityDistribution: Array<{ level: string; count: number }>;
  topBenefits: Array<{ benefit: string; count: number }>;
  workFormatDistribution: Array<{ format: string; count: number }>;
  topTechStack: Array<{ tech: string; count: number }>;
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
  // === SALARY METRICS (базовые поля) ===
  salaryByExperience: Array<{
    experience: string;
    count: number;
    avgFrom: number;
    avgTo: number;
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

export interface IVacanciesResponse {
  data: IVacancy[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Базовый URL API (можно вынести в env)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Получить аналитические данные
 */
export async function getAnalytics(): Promise<IAnalytics> {
  const response = await fetch(`${API_BASE_URL}/api/vacancies/analytics`, {
    cache: 'no-store', // Всегда свежие данные
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Получить список вакансий
 */
export async function getVacancies(params?: {
  limit?: number;
  offset?: number;
  remote?: boolean;
  skills?: string[];
}): Promise<IVacanciesResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.remote !== undefined) searchParams.set('remote', params.remote.toString());
  if (params?.skills && params.skills.length > 0) {
    searchParams.set('skills', params.skills.join(','));
  }

  const url = `${API_BASE_URL}/api/vacancies?${searchParams.toString()}`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vacancies: ${response.statusText}`);
  }

  return response.json();
}
