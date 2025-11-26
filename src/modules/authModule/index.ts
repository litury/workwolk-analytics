/**
 * Auth Module Index
 *
 * Следует соглашению proj-str.md - индексный файл для экспорта
 */

export { authRoutes } from './authRoutes';
export { hhClient } from './hhClient';

// Экспорт типов для внешнего использования
export type {
  HHVacancy,
  HHVacancyDetail,
  HHVacanciesResponse,
  HHResume,
  HHResumesResponse,
  HHUser,
  HHTokens,
  HHSalary,
  HHEmployer,
  HHVacancySearchParams,
} from './parts/hhTypes';
