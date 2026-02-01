import type { IAnalytics, IVacancy } from '../lib/api'

/**
 * Base props for all terminal view components
 */
export interface BaseViewProps {
  analytics: IAnalytics | null
  loading: boolean
}

/**
 * Props for VacanciesView component
 */
export interface VacanciesViewProps extends BaseViewProps {
  vacancies: IVacancy[]
}

/**
 * Props for StatusView component
 */
export interface StatusViewProps extends BaseViewProps {
  error: string | null
}

/**
 * Terminal view type union
 */
export type TerminalView = 'home' | 'vacancies' | 'salaries' | 'skills' | 'trends' | 'status'
