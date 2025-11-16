/**
 * Общие типы для API
 */

import { User, Resume, Application } from '@prisma/client';

/**
 * Стандартная обертка для ответа API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/**
 * Ответ проверки работоспособности сервиса
 */
export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
}

/**
 * Ответ проверки подключения к базе данных
 */
export interface DbHealthResponse {
  status: string;
  database: string;
}

/**
 * Пользователь со связанными данными
 */
export type UserWithRelations = User & {
  resumes: Resume[];
  applications: Application[];
};

/**
 * Резюме со связанными данными
 */
export type ResumeWithRelations = Resume & {
  user: User;
  applications: Application[];
};

/**
 * Отклик со связанными данными
 */
export type ApplicationWithRelations = Application & {
  resume: Resume;
  user: User;
};

/**
 * Статистика откликов по статусам
 */
export interface ApplicationStats {
  [status: string]: number;
}
