/**
 * Общие типы для API
 */

import type { Source, Vacancy } from '../db/schema';

/**
 * Стандартная обертка для ответа API
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/**
 * Ответ проверки работоспособности сервиса
 */
export interface IHealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
}

/**
 * Ответ проверки подключения к базе данных
 */
export interface IDbHealthResponse {
  status: string;
  database: string;
}

/**
 * Вакансия с данными источника
 */
export type VacancyWithSource = Vacancy & {
  source: Source;
};

/**
 * Пагинация
 */
export interface IPagination {
  total: number;
  limit: number;
  offset: number;
}
