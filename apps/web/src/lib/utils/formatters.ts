import type { IVacancy } from '../api'

/**
 * Format relative time from ISO date string
 * @param dateStr ISO date string or null
 * @returns Formatted relative time in Russian
 */
export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'никогда'

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  return `${diffDays} дн назад`
}

/**
 * Format vacancy salary range with currency symbol
 * @param vacancy Vacancy object with salary data
 * @returns Formatted salary string
 */
export function formatSalary(vacancy: IVacancy): string {
  if (!vacancy.salaryFrom && !vacancy.salaryTo) return 'не указано'

  const currency = vacancy.currency || 'RUB'
  const symbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€'

  if (vacancy.salaryFrom && vacancy.salaryTo) {
    return `${vacancy.salaryFrom.toLocaleString('ru-RU')}–${vacancy.salaryTo.toLocaleString('ru-RU')} ${symbol}`
  }

  if (vacancy.salaryFrom) {
    return `от ${vacancy.salaryFrom.toLocaleString('ru-RU')} ${symbol}`
  }

  if (vacancy.salaryTo) {
    return `до ${vacancy.salaryTo.toLocaleString('ru-RU')} ${symbol}`
  }

  return 'не указано'
}

/**
 * Calculate and format percentage
 * @param value Numerator value
 * @param total Denominator value
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format large numbers with thousand separators
 * @param num Number to format
 * @returns Formatted string with thousand separators
 */
export function formatLargeNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}
