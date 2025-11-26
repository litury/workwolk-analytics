/**
 * HH.ru API Client
 *
 * Клиент для работы с API HeadHunter
 * Следует паттерну Service из ARCHITECTURE.md
 */

import { env } from '../../config/env';
import type {
  HHTokens,
  HHTokenError,
  HHVacanciesResponse,
  HHVacancyDetail,
  HHResumesResponse,
  HHUser,
  HHVacancySearchParams,
  HHNegotiationResponse,
  HHNegotiationError,
} from './parts/hhTypes';

const HH_API = env.hh.apiUrl;
const HH_AUTH_URL = env.hh.authUrl;
const HH_TOKEN_URL = env.hh.tokenUrl;

/**
 * Клиент для работы с HH.ru API
 * Включает публичные методы (без токена) и приватные (с токеном)
 */
export const hhClient = {
  // ============================================
  // ПУБЛИЧНЫЕ МЕТОДЫ (без авторизации)
  // ============================================

  /**
   * Поиск вакансий
   */
  searchVacancies: async (params: HHVacancySearchParams): Promise<HHVacanciesResponse> => {
    const searchParams = new URLSearchParams();

    if (params.text) searchParams.set('text', params.text);
    if (params.area) {
      const areas = Array.isArray(params.area) ? params.area : [params.area];
      areas.forEach(a => searchParams.append('area', a));
    }
    if (params.salary) searchParams.set('salary', String(params.salary));
    if (params.only_with_salary) searchParams.set('only_with_salary', 'true');
    if (params.experience) searchParams.set('experience', params.experience);
    if (params.employment) searchParams.set('employment', params.employment);
    if (params.schedule) searchParams.set('schedule', params.schedule);
    if (params.order_by) searchParams.set('order_by', params.order_by);
    if (params.professional_role) {
      const roles = Array.isArray(params.professional_role) ? params.professional_role : [params.professional_role];
      roles.forEach(r => searchParams.append('professional_role', r));
    }

    searchParams.set('page', String(params.page ?? 0));
    searchParams.set('per_page', String(params.per_page ?? 20));

    const res = await fetch(`${HH_API}/vacancies?${searchParams}`);
    return res.json() as Promise<HHVacanciesResponse>;
  },

  /**
   * Получить детали вакансии
   */
  getVacancy: async (id: string): Promise<HHVacancyDetail> => {
    const res = await fetch(`${HH_API}/vacancies/${id}`);
    return res.json() as Promise<HHVacancyDetail>;
  },

  // ============================================
  // OAuth МЕТОДЫ
  // ============================================

  /**
   * Получить URL для авторизации пользователя
   */
  getAuthUrl: (state?: string): string => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.hh.clientId,
      redirect_uri: env.hh.redirectUri,
    });
    if (state) params.set('state', state);
    return `${HH_AUTH_URL}?${params}`;
  },

  /**
   * Обменять authorization code на токены
   */
  exchangeCode: async (code: string): Promise<HHTokens | HHTokenError> => {
    const res = await fetch(HH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.hh.clientId,
        client_secret: env.hh.clientSecret,
        code,
        redirect_uri: env.hh.redirectUri,
      }),
    });
    return res.json() as Promise<HHTokens | HHTokenError>;
  },

  /**
   * Обновить access_token используя refresh_token
   */
  refreshToken: async (refreshToken: string): Promise<HHTokens | HHTokenError> => {
    const res = await fetch(HH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    return res.json() as Promise<HHTokens | HHTokenError>;
  },

  // ============================================
  // ПРИВАТНЫЕ МЕТОДЫ (требуют access_token)
  // ============================================

  /**
   * Получить резюме текущего пользователя
   */
  getMyResumes: async (accessToken: string): Promise<HHResumesResponse> => {
    const res = await fetch(`${HH_API}/resumes/mine`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json() as Promise<HHResumesResponse>;
  },

  /**
   * Получить информацию о текущем пользователе
   */
  getMe: async (accessToken: string): Promise<HHUser> => {
    const res = await fetch(`${HH_API}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json() as Promise<HHUser>;
  },

  /**
   * Откликнуться на вакансию
   */
  applyToVacancy: async (
    accessToken: string,
    vacancyId: string,
    resumeId: string,
    message?: string
  ): Promise<HHNegotiationResponse | HHNegotiationError> => {
    const params = new URLSearchParams({
      vacancy_id: vacancyId,
      resume_id: resumeId,
    });
    if (message) params.set('message', message);

    const res = await fetch(`${HH_API}/negotiations?${params}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 201) {
      const location = res.headers.get('Location');
      const id = location?.split('/').pop() || '';
      return { id };
    }

    return res.json() as Promise<HHNegotiationError>;
  },
};
