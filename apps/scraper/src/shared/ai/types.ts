import { z } from 'zod';

/**
 * Схема AI анализа вакансии
 * Используется в enrich-ai.ts и enrich-ai-batch.ts
 */
export const AIAnalysisSchema = z.object({
  jobCategory: z.enum([
    'frontend', 'backend', 'devops', 'mobile', 'data',
    'qa', 'product', 'fullstack', 'ai-ml', 'security', 'other'
  ]),
  jobTags: z.array(z.string()).max(5),
  companyNameNormalized: z.string().nullable(),
  companyType: z.enum(['product', 'outsource', 'consulting', 'startup']).optional().nullable(),
  techStack: z.array(z.object({
    name: z.string(),
    category: z.enum(['language', 'framework', 'tool', 'cloud']),
    required: z.boolean(),
  })).optional().nullable(),
  seniorityLevel: z.enum(['junior', 'middle', 'senior', 'lead', 'principal']).optional().nullable(),
  requiresAi: z.boolean().optional(),
  benefits: z.array(z.string()).optional().nullable(),
  workFormat: z.enum(['remote', 'hybrid', 'office']).optional().nullable(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional().nullable(),
  companyIndustry: z.string().optional().nullable(),
  contractType: z.enum(['permanent', 'contract', 'freelance', 'intern']).optional().nullable(),
  descriptionShort: z.string().min(50).max(300),
  salaryRecommendation: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
    reasoning: z.string().max(200),
  }).nullable().optional(),
});

export type AIAnalysisResult = z.infer<typeof AIAnalysisSchema>;

/**
 * Входные данные для анализа вакансии
 */
export interface VacancyInput {
  title: string;
  company: string;
  description: string;
  skills: string[];
  salaryFrom?: number | null;
  salaryTo?: number | null;
}

/**
 * Интерфейс AI провайдера
 * Все провайдеры (Gemini, OpenRouter) должны реализовать этот интерфейс
 */
export interface IAIProvider {
  /**
   * Название провайдера (для логирования)
   */
  readonly name: string;

  /**
   * ID модели (например, 'gemini-3-flash-preview' или 'deepseek/deepseek-v3')
   */
  readonly model: string;

  /**
   * Rate limits провайдера
   */
  readonly rateLimit: {
    requestsPerMinute: number;
    maxBatchSize: number;
  };

  /**
   * Проверить доступность провайдера (есть ли API key)
   */
  isAvailable(): boolean;

  /**
   * Анализ одной вакансии
   */
  analyzeVacancy(
    description: string,
    skills: string[]
  ): Promise<AIAnalysisResult | null>;

  /**
   * Батчевый анализ (несколько вакансий за раз)
   */
  analyzeBatch(
    vacancies: VacancyInput[]
  ): Promise<AIAnalysisResult[]>;
}

/**
 * Конфигурация AI провайдеров
 */
export interface AIConfig {
  primaryProvider: 'gemini' | 'openrouter';
  fallbackProvider: 'gemini' | 'openrouter' | 'none';
  openRouterModel: string;
}
