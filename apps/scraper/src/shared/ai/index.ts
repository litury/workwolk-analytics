/**
 * Публичный API для работы с AI провайдерами
 *
 * Использование:
 *
 * import { getAIProvider } from './src/shared/ai';
 *
 * const provider = getAIProvider(); // Автоматический fallback
 * const result = await provider.analyzeVacancy(description, skills);
 */

import { aiFactory } from './factory';

export { aiFactory } from './factory';
export { AIAnalysisSchema } from './types';
export type { IAIProvider, AIAnalysisResult, VacancyInput, AIConfig } from './types';

/**
 * Удобная функция для получения провайдера с автоматическим fallback
 */
export function getAIProvider() {
  return aiFactory.getProvider();
}
