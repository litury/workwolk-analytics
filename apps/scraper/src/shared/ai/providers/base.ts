import { createLogger } from '../../utils/logger';
import type { IAIProvider, AIAnalysisResult, VacancyInput } from '../types';
import { AIAnalysisSchema } from '../types';

/**
 * Абстрактный базовый класс для всех AI провайдеров
 * Содержит общую логику: построение промпта, парсинг, валидация
 */
export abstract class BaseAIProvider implements IAIProvider {
  protected readonly log = createLogger(`AI:${this.name}`);

  abstract readonly name: string;
  abstract readonly model: string;
  abstract readonly rateLimit: {
    requestsPerMinute: number;
    maxBatchSize: number;
  };

  abstract isAvailable(): boolean;

  /**
   * Реализуется конкретным провайдером (Gemini, OpenRouter)
   * Должна вызвать AI API и вернуть текстовый ответ
   */
  protected abstract callAPI(prompt: string): Promise<string>;

  /**
   * Анализ одной вакансии (template method)
   */
  async analyzeVacancy(
    description: string,
    skills: string[]
  ): Promise<AIAnalysisResult | null> {
    try {
      const prompt = this.buildSinglePrompt(description, skills);
      const response = await this.callAPI(prompt);
      return this.parseAndValidate(response);
    } catch (error) {
      this.log.error('Failed to analyze vacancy', error instanceof Error ? error : undefined);
      return null;
    }
  }

  /**
   * Батчевый анализ (template method)
   */
  async analyzeBatch(vacancies: VacancyInput[]): Promise<AIAnalysisResult[]> {
    const prompt = this.buildBatchPrompt(vacancies);
    const response = await this.callAPI(prompt);
    return this.parseBatchAndValidate(response, vacancies.length);
  }

  /**
   * Построение промпта для одной вакансии
   * Использует полный промпт из enrich-ai-batch.ts
   */
  protected buildSinglePrompt(description: string, skills: string[]): string {
    return `Analyze this job vacancy and extract structured data in JSON format.

Vacancy Description:
${description.substring(0, 4000)}

Skills from page: ${skills.join(', ')}

Return JSON object with these fields:

1. jobCategory: ONE main category (ai-ml > devops > fullstack > frontend/backend > other)
   - ai-ml: AI/ML engineer, data scientist, computer vision
   - devops: DevOps, SRE, cloud engineer, security
   - mobile: iOS, Android, React Native, Flutter
   - fullstack: explicitly mentions both frontend AND backend
   - frontend: React, Vue, Angular developers
   - backend: Python, Go, Java, Node.js backend
   - qa: QA, testers
   - product: PM, designer, analyst
   - security: security engineer, pentester
   - data: data analyst, BI analyst
   - other: NON-IT jobs (marketing, HR, sales)

2. jobTags: 2-5 lowercase tags, NO duplicates from jobCategory
   Examples: ["react", "typescript", "nextjs"], ["python", "fastapi", "postgresql"]

3. companyNameNormalized: Remove "ООО", "LLC", "(Москва)", keep original spelling
   Examples: "ООО Яндекс" → "Яндекс", "VK LLC" → "VK"

4. companyType: "product" | "outsource" | "consulting" | "startup" | null
   - product: Яндекс, VK, Ozon, Сбербанк
   - outsource: Andersen, EPAM, Luxoft
   - startup: small company, seed/series A

5. techStack: ALL mentioned technologies
   - category: ONLY "language", "framework", "tool", or "cloud"
   - required: true if must-have, false if nice-to-have
   - Examples: Python, React, Docker, AWS

6. seniorityLevel: "junior" | "middle" | "senior" | "lead" | "principal" | null
   - junior: 0-1y, middle: 1-3y, senior: 3-6y, lead: 6+y

7. requiresAi: true if mentions AI/ML/GPT/LLM/ChatGPT/neural networks

8. benefits: array of strings (e.g., ["ДМС", "Обучение", "Гибкий график"])

9. workFormat: "remote" | "hybrid" | "office" | null

10. companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null
    - Just the range, not "51-200 employees"

11. companyIndustry: string (e.g., "Fintech", "E-commerce", "SaaS") or null

12. contractType: "permanent" | "contract" | "freelance" | "intern" | null

13. descriptionShort: краткое Twitter-style описание 200-300 символов БЕЗ EMOJI
    Структура:
    [Роль] | [Top 3 технологии]
    [Зарплата если есть] | [Тип компании] | [Формат]
    Требования: [Ключевые требования через •]

    Пример:
    "Senior React Developer | React, TypeScript, Next.js
    250-350k RUB | Product | Remote
    Требования: 5+ years • B2B SaaS • ДМС, Опции"

14. salaryRecommendation: AI-оценка справедливой зарплаты
    - Analyze: jobCategory, seniorityLevel, techStack, companyType
    - confidence: "high" if matches market (±10%), "medium" if ±20%, "low" if >20%
    - reasoning: краткое объяснение (1-2 предложения, макс 200 символов)
    - Example: {"min": 250000, "max": 350000, "currency": "RUB", "confidence": "high", "reasoning": "Senior React в Product 500+ обычно 250-400k."}

Return ONLY valid JSON object, no markdown formatting, no explanations.`;
  }

  /**
   * Построение промпта для батча вакансий
   * Берется из enrich-ai-batch.ts
   */
  protected buildBatchPrompt(vacancies: VacancyInput[]): string {
    return `Analyze ${vacancies.length} job vacancies and return JSON array.

${vacancies.map((v, i) => `
=== VACANCY ${i + 1} ===
Title: ${v.title}
Company: ${v.company}
Description: ${v.description?.substring(0, 800) || 'No description'}
Skills: ${v.skills.join(', ')}
${v.salaryFrom || v.salaryTo ? `Salary: ${v.salaryFrom || '?'}-${v.salaryTo || '?'} RUB` : ''}
`).join('\n')}

Return JSON array with ${vacancies.length} objects (PRESERVE ORDER!):
[
  {
    "jobCategory": "frontend",
    "jobTags": ["react", "typescript", "nextjs"],
    "companyNameNormalized": "Яндекс",
    "companyType": "product",
    "techStack": [
      {"name": "React", "category": "framework", "required": true},
      {"name": "TypeScript", "category": "language", "required": true}
    ],
    "seniorityLevel": "middle",
    "requiresAi": false,
    "benefits": ["ДМС", "Обучение"],
    "workFormat": "remote",
    "companySize": "500+",
    "companyIndustry": "Tech",
    "contractType": "permanent",
    "descriptionShort": "Middle React Developer | React, TypeScript, Next.js\\n200-300k RUB | Product | Remote\\nТребования: 3+ years • B2B SaaS • ДМС",
    "salaryRecommendation": {
      "min": 200000,
      "max": 300000,
      "currency": "RUB",
      "confidence": "high",
      "reasoning": "Middle React в Product компании 500+ обычно 200-300k. Диапазон соответствует рынку."
    }
  },
  ... (${vacancies.length - 1} more objects)
]

RULES:
1. jobCategory: ONE main category (ai-ml > devops > fullstack > frontend/backend > other)
   - ai-ml: AI/ML engineer, data scientist, computer vision
   - devops: DevOps, SRE, cloud engineer, security
   - mobile: iOS, Android, React Native, Flutter
   - fullstack: explicitly mentions both frontend AND backend
   - frontend: React, Vue, Angular developers
   - backend: Python, Go, Java, Node.js backend
   - qa: QA, testers
   - product: PM, designer, analyst
   - other: NON-IT jobs (marketing, HR, sales)

2. jobTags: 2-5 lowercase tags, NO duplicates from jobCategory
   Examples:
   - Frontend React → ["react", "typescript", "nextjs"]
   - Backend Python → ["python", "fastapi", "postgresql"]
   - DevOps → ["kubernetes", "docker", "terraform"]

3. companyNameNormalized: Remove "ООО", "LLC", "(Москва)", keep original spelling
   Examples:
   - "ООО Яндекс" → "Яндекс"
   - "VK LLC" → "VK"
   - "Andersen" → "Andersen"

4. companyType:
   - product: Яндекс, VK, Ozon, Сбербанк
   - outsource: Andersen, EPAM, Luxoft, КРОК
   - consulting: McKinsey, Deloitte
   - startup: small company, seed/series A
   - null: if unknown

5. techStack: ALL mentioned technologies
   - category: ONLY "language", "framework", "tool", or "cloud" (no other values!)
   - Examples:
     * Python → {"name": "Python", "category": "language", "required": true}
     * React → {"name": "React", "category": "framework", "required": true}
     * Docker → {"name": "Docker", "category": "tool", "required": false}
     * AWS → {"name": "AWS", "category": "cloud", "required": false}

6. seniorityLevel: ONLY "junior", "middle", "senior", "lead", or "principal" (or null if unknown)
   - junior: 0-1y, middle: 1-3y, senior: 3-6y, lead: 6+y

7. requiresAi: true if mentions AI/ML/GPT/LLM/ChatGPT/neural networks

8. benefits: array of strings (e.g., ["ДМС", "Обучение", "Гибкий график"])

9. workFormat: ONLY "remote", "hybrid", or "office" (or null)

10. companySize: EXACTLY one of "1-10", "11-50", "51-200", "201-500", "500+" (or null)
    - Do NOT add words like "employees" or "человек"
    - Just the range: "51-200" not "51-200 employees"

11. companyIndustry: string (e.g., "Fintech", "E-commerce", "SaaS") or null

12. contractType: ONLY "permanent", "contract", "freelance", or "intern" (or null)

13. descriptionShort: краткое Twitter-style описание 200-300 символов (НЕ заменяет оригинал!)
    Структура БЕЗ EMOJI:
    [Роль] | [Top 3 технологии]
    [Зарплата если есть] | [Тип компании] | [Формат]
    Требования: [Ключевые требования через •]

    Пример:
    "Senior React Developer | React, TypeScript, Next.js
    250-350k RUB | Product | Remote
    Требования: 5+ years • B2B SaaS • ДМС, Опции"

    Правила:
    - 200-300 символов (не меньше 50!)
    - Только ключевая информация
    - БЕЗ EMOJI! Только текст
    - Bullet points (•) для требований
    - Краткие фразы, без воды

14. salaryRecommendation: AI-оценка справедливой зарплаты
    Анализируй: jobCategory, seniorityLevel, techStack, companyType, companySize, requiresAi

    Если зарплата УКАЗАНА (salaryFrom/salaryTo):
    - Сравни с рынком для этой роли/уровня/стека
    - confidence: "high" если соответствует рынку (±10%)
    - confidence: "medium" если ±20% от рынка
    - confidence: "low" если сильно отличается >20%

    Если зарплата НЕ УКАЗАНА:
    - Оцени рыночную зарплату по роли/стеку/уровню
    - confidence: "medium" (нет данных от работодателя)

    reasoning: краткое объяснение (1-2 предложения, макс 200 символов)

    Примеры:
    {"min": 250000, "max": 350000, "currency": "RUB", "confidence": "high", "reasoning": "Senior React в Product 500+ обычно 250-400k. Диапазон соответствует рынку."}

    {"min": 180000, "max": 250000, "currency": "RUB", "confidence": "medium", "reasoning": "Middle Python обычно 180-250k. Зарплата не указана, оценка по рынку."}

Return ONLY valid JSON array, no markdown, no explanations.`;
  }

  /**
   * Парсинг и валидация одиночного ответа
   */
  protected parseAndValidate(responseText: string): AIAnalysisResult | null {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.log.warn('Could not extract JSON from response');
      return null;
    }

    try {
      const aiData = JSON.parse(jsonMatch[0]);
      const validated = AIAnalysisSchema.parse(aiData);

      this.log.info('AI analysis successful', {
        jobCategory: validated.jobCategory,
        techStackCount: validated.techStack?.length || 0,
        seniorityLevel: validated.seniorityLevel,
      });

      return validated;
    } catch (error) {
      this.log.error('Validation failed', error instanceof Error ? error : undefined);
      return null;
    }
  }

  /**
   * Парсинг и валидация батча
   */
  protected parseBatchAndValidate(
    responseText: string,
    expectedLength: number
  ): AIAnalysisResult[] {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON array from response');
    }

    const aiResults = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(aiResults) || aiResults.length !== expectedLength) {
      throw new Error(`Expected ${expectedLength} results, got ${aiResults.length}`);
    }

    // Clean and validate each result
    return aiResults.map((r: any, i: number) => {
      try {
        // Fix: "null" string → null
        const cleaned = JSON.parse(JSON.stringify(r, (key, value) =>
          value === "null" ? null : value
        ));
        return AIAnalysisSchema.parse(cleaned);
      } catch (error) {
        this.log.error(`Validation failed for vacancy ${i + 1}`, error instanceof Error ? error : undefined);
        throw error;
      }
    });
  }
}
