/**
 * ETL Phase 3: Load - AI Batch Enrichment
 *
 * Обогащает вакансии через Gemini AI батчами (5 вакансий за раз)
 * Определяет: jobCategory, jobTags, companyNameNormalized, techStack, и др.
 *
 * Использование:
 * bun run enrich-ai-batch.ts --limit=14000
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import pLimit from 'p-limit';
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { isNotNull, isNull, and, eq } from 'drizzle-orm';
import { createLogger } from './src/shared/utils/logger';
import { env } from './src/config/env';

const log = createLogger('EnrichAIBatch');
const BATCH_SIZE = 5;
const CONCURRENCY = 50;  // 50 параллельных запросов (1000 RPM лимит - можно до 1000/60*5 = 83)

// Schema для одной вакансии
const AIAnalysisSchema = z.object({
  jobCategory: z.enum([
    'frontend', 'backend', 'devops', 'mobile', 'data',
    'qa', 'product', 'fullstack', 'ai-ml', 'security', 'other'
  ]),
  jobTags: z.array(z.string()).max(5),
  companyNameNormalized: z.string(),
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

  // === НОВОЕ: Краткое описание (Twitter-style, НЕ заменяет оригинал!) ===
  descriptionShort: z.string().min(50).max(300),

  // === НОВОЕ: AI-рекомендация зарплаты ===
  salaryRecommendation: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
    reasoning: z.string().max(200),
  }).nullable().optional(),
});

type AIAnalysisResult = z.infer<typeof AIAnalysisSchema>;

/**
 * Анализ батча вакансий (5 штук за раз)
 */
async function analyzeBatch(batch: any[]): Promise<AIAnalysisResult[]> {
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment');
  }

  const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const prompt = `Analyze ${batch.length} job vacancies and return JSON array.

${batch.map((v, i) => `
=== VACANCY ${i + 1} ===
Title: ${v.title}
Company: ${v.company}
Description: ${v.description?.substring(0, 800) || 'No description'}
Skills: ${(v.skills || []).join(', ')}
`).join('\n')}

Return JSON array with ${batch.length} objects (PRESERVE ORDER!):
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
  ... (${batch.length - 1} more objects)
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

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON array from Gemini response');
    }

    const aiResults = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(aiResults) || aiResults.length !== batch.length) {
      throw new Error(`Expected ${batch.length} results, got ${aiResults.length}`);
    }

    // Validate each result
    const validated = aiResults.map((r: any, i: number) => {
      try {
        // Fix: Gemini sometimes returns "null" string instead of null
        // Convert all "null" strings to actual null
        const cleaned = JSON.parse(JSON.stringify(r, (key, value) =>
          value === "null" ? null : value
        ));

        return AIAnalysisSchema.parse(cleaned);
      } catch (error) {
        console.log(`\n❌ Validation failed for vacancy ${i + 1}`);
        console.log('Raw AI response:', JSON.stringify(r, null, 2));
        log.error(`Validation failed for vacancy ${i + 1}:`, error instanceof Error ? error : undefined);
        throw error;
      }
    });

    return validated;
  } catch (error) {
    log.error('Failed to analyze batch', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Главная функция
 */
async function main() {
  const limit = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '14000', 10);

  console.log('🤖 ETL Phase 3: AI Batch Enrichment (Parallel)\n');
  console.log('=' .repeat(80));
  console.log(`📊 Parameters:`);
  console.log(`   Max vacancies: ${limit}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Concurrency: ${CONCURRENCY} parallel requests`);
  console.log(`   Model: Gemini 3 Flash Preview`);
  console.log(`   Rate limit: 1000 RPM (Pay-as-you-go)`);
  console.log('=' .repeat(80) + '\n');

  try {
    // Get vacancies WITH description but WITHOUT AI
    const vacanciesWithoutAI = await db.select()
      .from(vacancies)
      .where(
        and(
          isNotNull(vacancies.description),
          isNull(vacancies.aiEnrichedAt)
        )
      )
      .limit(limit);

    console.log(`📋 Found ${vacanciesWithoutAI.length} vacancies to enrich\n`);

    if (vacanciesWithoutAI.length === 0) {
      console.log('✅ All vacancies already enriched!');
      return;
    }

    // Подготовка батчей
    const batches = [];
    for (let i = 0; i < vacanciesWithoutAI.length; i += BATCH_SIZE) {
      batches.push(vacanciesWithoutAI.slice(i, i + BATCH_SIZE));
    }

    const totalBatches = batches.length;
    let processed = 0;
    let successful = 0;
    let failed = 0;

    const startTime = Date.now();

    // Параллельная обработка с ограничением concurrency
    const limitConcurrency = pLimit(CONCURRENCY);

    const results = await Promise.allSettled(
      batches.map((batch, index) =>
        limitConcurrency(async () => {
          const batchNum = index + 1;
          console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} vacancies)`);

          try {
            const aiResults = await analyzeBatch(batch);

            // Save to DB
            for (let j = 0; j < batch.length; j++) {
              await db.update(vacancies)
                .set({
                  jobCategory: aiResults[j].jobCategory,
                  jobTags: aiResults[j].jobTags,
                  companyNameNormalized: aiResults[j].companyNameNormalized,
                  companyType: aiResults[j].companyType,
                  techStack: aiResults[j].techStack,
                  seniorityLevel: aiResults[j].seniorityLevel,
                  requiresAi: aiResults[j].requiresAi,
                  benefits: aiResults[j].benefits,
                  workFormat: aiResults[j].workFormat,
                  companySize: aiResults[j].companySize,
                  companyIndustry: aiResults[j].companyIndustry,
                  contractType: aiResults[j].contractType,
                  descriptionShort: aiResults[j].descriptionShort,            // НОВОЕ: краткое Twitter-style (НЕ заменяет оригинал!)
                  salaryRecommendation: aiResults[j].salaryRecommendation,    // НОВОЕ: AI-оценка зарплаты
                  aiEnrichedAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(vacancies.id, batch[j].id));
            }

            console.log(`✅ Batch ${batchNum} saved (${batch.length} vacancies)`);
            return { success: true, count: batch.length };
          } catch (error) {
            console.error(`❌ Batch ${batchNum} failed:`, error);
            return { success: false, count: batch.length, error };
          }
        })
      )
    );

    // Подсчёт результатов
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successful += result.value.count;
        } else {
          failed += result.value.count;
        }
        processed += result.value.count;
      }
    });

    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes

    console.log('\n' + '=' .repeat(80));
    console.log('\n✅ Enrichment complete!\n');
    console.log('📊 Final statistics:');
    console.log(`   Processed: ${processed}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${Math.round((successful / processed) * 100)}%`);
    console.log(`   Time elapsed: ${elapsed.toFixed(1)} minutes`);
    console.log(`   Speed: ${(processed / elapsed).toFixed(1)} vacancies/min`);
    console.log('\n' + '=' .repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

main();
