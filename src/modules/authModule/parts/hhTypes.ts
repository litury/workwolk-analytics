/**
 * HH.ru API Types
 *
 * Типы для работы с API HeadHunter
 * Документация: https://api.hh.ru/openapi/redoc
 */

// ============================================
// Базовые типы
// ============================================

export interface HHValueDescriptor {
  id: string;
  name: string;
}

export interface HHArea {
  id: string;
  name: string;
  url?: string;
}

export interface HHLogoUrls {
  '90'?: string;
  '240'?: string;
  original?: string;
}

// ============================================
// Employer (Работодатель)
// ============================================

export interface HHEmployer {
  id: string;
  name: string;
  url: string;
  alternate_url?: string;
  logo_urls?: HHLogoUrls | null;
  trusted: boolean;
  accredited_it_employer?: boolean;
}

// ============================================
// Salary (Зарплата)
// ============================================

export interface HHSalary {
  from: number | null;
  to: number | null;
  currency: string;
  gross: boolean;
}

// ============================================
// Snippet (Краткое описание)
// ============================================

export interface HHSnippet {
  requirement: string | null;
  responsibility: string | null;
}

// ============================================
// Address (Адрес)
// ============================================

export interface HHMetroStation {
  station_id: string;
  station_name: string;
  line_id: string;
  line_name: string;
  lat: number;
  lng: number;
}

export interface HHAddress {
  city?: string;
  street?: string;
  building?: string;
  description?: string;
  lat?: number;
  lng?: number;
  raw?: string;
  metro_stations?: HHMetroStation[];
}

// ============================================
// Vacancy (Вакансия)
// ============================================

export interface HHVacancy {
  id: string;
  name: string;
  area: HHArea;
  salary: HHSalary | null;
  employer: HHEmployer;
  snippet: HHSnippet;
  schedule?: HHValueDescriptor;
  experience?: HHValueDescriptor;
  employment?: HHValueDescriptor;
  address?: HHAddress | null;
  published_at: string;
  created_at?: string;
  url: string;
  alternate_url: string;
  apply_alternate_url?: string;
  premium?: boolean;
  archived?: boolean;
  type?: HHValueDescriptor;
  response_letter_required?: boolean;
  has_test?: boolean;
  professional_roles?: HHValueDescriptor[];
}

export interface HHVacancyDetail extends HHVacancy {
  description: string;
  key_skills: { name: string }[];
  branded_description?: string;
  accept_incomplete_resumes?: boolean;
  working_days?: HHValueDescriptor[];
  working_time_intervals?: HHValueDescriptor[];
  working_time_modes?: HHValueDescriptor[];
  languages?: {
    id: string;
    name: string;
    level: HHValueDescriptor;
  }[];
  driver_license_types?: { id: string }[];
}

// ============================================
// Response Types (Ответы API)
// ============================================

export interface HHPaginatedResponse<T> {
  items: T[];
  found: number;
  pages: number;
  per_page: number;
  page: number;
}

export type HHVacanciesResponse = HHPaginatedResponse<HHVacancy>;

// ============================================
// Resume (Резюме)
// ============================================

export interface HHResume {
  id: string;
  title: string;
  url: string;
  alternate_url: string;
  created_at: string;
  updated_at: string;
  access?: {
    type: HHValueDescriptor;
  };
  finished?: boolean;
  status?: HHValueDescriptor;
  moderation_note?: { id: string; name: string }[];
}

export type HHResumesResponse = HHPaginatedResponse<HHResume>;

// ============================================
// User (Пользователь)
// ============================================

export interface HHUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  is_admin?: boolean;
  is_applicant?: boolean;
  is_employer?: boolean;
  phone?: string;
}

// ============================================
// OAuth Tokens
// ============================================

export interface HHTokens {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

export interface HHTokenError {
  error: string;
  error_description?: string;
}

// ============================================
// Search Params
// ============================================

export interface HHVacancySearchParams {
  text?: string;
  area?: string | string[];
  salary?: number;
  only_with_salary?: boolean;
  experience?: string;
  employment?: string;
  schedule?: string;
  page?: number;
  per_page?: number;
  order_by?: 'publication_time' | 'salary_desc' | 'salary_asc' | 'relevance';
  search_field?: string | string[];
  professional_role?: string | string[];
}

// ============================================
// Negotiations (Отклики)
// ============================================

export interface HHNegotiationResponse {
  id: string;
}

export interface HHNegotiationError {
  error: string;
  description?: string;
  bad_arguments?: { name: string; description: string }[];
}
