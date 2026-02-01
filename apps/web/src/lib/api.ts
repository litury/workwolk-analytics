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
  // Базовые метрики (для главной)
  totalVacancies: number;
  remoteVacancies: number;
  lastScrapedAt: string | null;
  activeSources: number;

  // Навыки (для раздела "Навыки")
  topSkills: Array<{ skill: string; count: number }>;           // топ 12 (для главной - slice(0,10))
  topTechStack: Array<{ tech: string; count: number }>;         // топ 100 (AI-enriched, для раздела Skills)

  // Зарплаты (для раздела "Зарплаты")
  salaryBySeniority: Array<{
    level: string;  // junior, middle, senior, lead, principal
    count: number;
    avgMin: number;
    avgMax: number;
    p25: number;
    p50: number;
    p75: number;
  }>;

  // Категории (для будущего SEO)
  categoryDistribution: Array<{
    category: string;
    count: number;
    avgMinSalary: number;
    avgMaxSalary: number;
    companies: number;
  }>;

  // Дополнительные метрики
  seniorityDistribution: Array<{ level: string; count: number }>;
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
// В production используется Next.js API proxy для доступа к internal Docker API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Получить аналитические данные
 */
export async function getAnalytics(): Promise<IAnalytics> {
  const response = await fetch(`${API_BASE_URL}/vacancies/analytics`, {
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

  const url = `${API_BASE_URL}/vacancies?${searchParams.toString()}`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vacancies: ${response.statusText}`);
  }

  return response.json();
}
