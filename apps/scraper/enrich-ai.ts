/**
 * ETL Phase 3: Load - AI Enrichment
 *
 * Обогащает вакансии через Gemini AI анализ.
 * Читает вакансии с description но БЕЗ AI-данных, анализирует и сохраняет:
 * - techStack (структурированный список технологий)
 * - seniorityLevel (junior/middle/senior/lead/principal)
 * - requiresAi (упоминается ли AI/ML)
 * - benefits (бонусы и преимущества)
 * - workFormat (remote/hybrid/office)
 * - companySize (размер компании)
 * - companyIndustry (индустрия)
 * - contractType (тип контракта)
 *
 * Использование:
 * bun run enrich-ai.ts --limit 100    # Обработать 100 вакансий
 * bun run enrich-ai.ts --batch 20     # По 20 за раз (рекомендуется для Gemini rate limits)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { sql, isNull, isNotNull, and } from 'drizzle-orm';
import { createLogger } from './src/shared/utils/logger';
import { env } from './src/config/env';

const log = createLogger('EnrichAI');

// Схема для AI-анализа
const AIAnalysisSchema = z.object({
  techStack: z.array(z.object({
    name: z.string(),
    category: z.enum(['language', 'framework', 'tool', 'cloud']),
    required: z.boolean(),
  })).optional(),
  seniorityLevel: z.enum(['junior', 'middle', 'senior', 'lead', 'principal']).nullable().optional(),
  requiresAi: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
  workFormat: z.enum(['remote', 'hybrid', 'office']).nullable().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).nullable().optional(),
  companyIndustry: z.string().nullable().optional(),
  contractType: z.enum(['permanent', 'contract', 'freelance', 'intern']).nullable().optional(),
});

type AIAnalysisResult = z.infer<typeof AIAnalysisSchema>;

// Gemini client singleton
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment');
    }
    genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
    log.info('Gemini AI client initialized');
  }
  return genAI;
}

/**
 * Анализировать вакансию через Gemini AI
 */
async function analyzeWithGeminiAsync(description: string, skills: string[]): Promise<AIAnalysisResult | null> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `Analyze this job vacancy and extract structured data in JSON format.

Vacancy Description:
${description.substring(0, 4000)}

Skills from page: ${skills.join(', ')}

Extract:
1. techStack: array of { name, category (language|framework|tool|cloud), required (bool) }
   - Example: [{"name": "React", "category": "framework", "required": true}]
   - Include both explicitly listed and inferred from description
   - Mark as required=true if mentioned in requirements, false if nice-to-have

2. seniorityLevel: junior | middle | senior | lead | principal
   - Infer from title, years of experience, responsibilities
   - junior: 0-1 year, middle: 1-3 years, senior: 3-6 years, lead: 6+ years

3. requiresAi: boolean
   - true if mentions: AI, ML, machine learning, GPT, neural networks, deep learning, LLM, RAG, ChatGPT, AI/ML
   - false otherwise

4. benefits: array of strings
   - Examples: "ДМС", "Опционы", "Обучение", "Гибкий график", "Удалённая работа", "Офис в центре"
   - Extract ALL mentioned benefits

5. workFormat: remote | hybrid | office
   - remote: полностью удалённо
   - hybrid: гибрид офиса и удалёнки
   - office: только офис

6. companySize: 1-10 | 11-50 | 51-200 | 201-500 | 500+
   - Infer from description if mentioned (startup, small team, large company, etc.)
   - null if not mentioned

7. companyIndustry: string
   - Examples: "Fintech", "E-commerce", "SaaS", "GameDev", "AdTech", "EdTech", "HealthTech"
   - null if cannot determine

8. contractType: permanent | contract | freelance | intern
   - permanent: постоянная работа
   - contract: контракт, B2B
   - freelance: фриланс проект
   - intern: стажировка

Return ONLY valid JSON, no markdown formatting, no explanations.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Извлечь JSON из ответа
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.warn('Could not extract JSON from Gemini response');
      return null;
    }

    const aiData = JSON.parse(jsonMatch[0]);
    const validated = AIAnalysisSchema.parse(aiData);

    log.info('AI analysis successful', {
      techStackCount: validated.techStack?.length || 0,
      seniorityLevel: validated.seniorityLevel,
      requiresAi: validated.requiresAi,
    });

    return validated;
  } catch (error) {
    log.error('Failed to analyze with Gemini', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Главная функция
 */
async function main() {
  const limit = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '100', 10);
  const batchSize = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '20', 10);

  console.log('🤖 ETL Phase 3: AI Enrichment...\n');
  console.log(`📊 Параметры:`);
  console.log(`   - Максимум вакансий: ${limit}`);
  console.log(`   - Размер батча: ${batchSize} (медленнее, но надёжнее для Gemini rate limits)`);
  console.log(`   - Модель: Gemini 3 Flash Preview\n`);

  try {
    // Получаем вакансии с description но БЕЗ AI-анализа
    const vacanciesWithoutAI = await db.select()
      .from(vacancies)
      .where(
        and(
          isNotNull(vacancies.description),
          isNull(vacancies.aiEnrichedAt)
        )
      )
      .limit(limit);

    console.log(`📋 Найдено ${vacanciesWithoutAI.length} вакансий для AI-обогащения\n`);

    if (vacanciesWithoutAI.length === 0) {
      console.log('✅ Все вакансии уже обработаны!');
      return;
    }

    let processed = 0;
    let successful = 0;
    let failed = 0;

    // Обработка батчами
    for (let i = 0; i < vacanciesWithoutAI.length; i += batchSize) {
      const batch = vacanciesWithoutAI.slice(i, i + batchSize);
      console.log(`\n🤖 Батч ${Math.floor(i / batchSize) + 1}/${Math.ceil(vacanciesWithoutAI.length / batchSize)}`);
      console.log(`   Обработка вакансий ${i + 1}-${Math.min(i + batchSize, vacanciesWithoutAI.length)}...\n`);

      for (const vacancy of batch) {
        processed++;
        console.log(`[${processed}/${vacanciesWithoutAI.length}] ${vacancy.title} - ${vacancy.company}`);

        if (!vacancy.description) {
          console.log(`   ⚠️  Пропущено: нет description\n`);
          continue;
        }

        const analysis = await analyzeWithGeminiAsync(
          vacancy.description,
          (vacancy.skills as string[]) || []
        );

        if (analysis) {
          // Обновляем запись в БД
          await db.update(vacancies)
            .set({
              techStack: analysis.techStack as any,
              seniorityLevel: analysis.seniorityLevel,
              requiresAi: analysis.requiresAi || false,
              benefits: analysis.benefits,
              workFormat: analysis.workFormat,
              companySize: analysis.companySize,
              companyIndustry: analysis.companyIndustry,
              contractType: analysis.contractType,
              aiEnrichedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(sql`${vacancies.id} = ${vacancy.id}`);

          successful++;
          console.log(`   ✅ AI анализ: ${analysis.techStack?.length || 0} tech, ${analysis.seniorityLevel || '?'}, AI=${analysis.requiresAi}\n`);
        } else {
          failed++;
          console.log(`   ❌ Ошибка AI анализа\n`);
        }

        // Задержка между запросами к Gemini (rate limits!)
        // Gemini 3 Flash: 15 RPM (requests per minute)
        await new Promise(resolve => setTimeout(resolve, 4000 + Math.random() * 2000));
      }

      console.log(`\n📊 Статус батча: ${successful}/${processed} успешно, ${failed} ошибок`);

      // Пауза между батчами
      if (i + batchSize < vacanciesWithoutAI.length) {
        console.log('⏸️  Пауза 10 секунд между батчами...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log('\n\n✅ AI обогащение завершено!');
    console.log(`📊 Итоговая статистика:`);
    console.log(`   - Обработано: ${processed}`);
    console.log(`   - Успешно: ${successful}`);
    console.log(`   - Ошибок: ${failed}`);
    console.log(`   - Процент успеха: ${Math.round((successful / processed) * 100)}%`);

    const estimatedTime = (processed * 5) / 60;
    console.log(`   - Время выполнения: ~${Math.round(estimatedTime)} минут`);

  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    throw error;
  } finally {
    await closeDatabase();
    console.log('\n🔒 БД закрыта');
  }
}

main();
