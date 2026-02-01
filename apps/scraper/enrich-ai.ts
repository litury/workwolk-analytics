/**
 * ETL Phase 3: Load - AI Enrichment
 *
 * Обогащает вакансии через AI анализ (OpenRouter или Gemini с автоматическим fallback).
 * Читает вакансии с description но БЕЗ AI-данных, анализирует и сохраняет:
 * - jobCategory, jobTags (категоризация)
 * - companyNameNormalized, companyType (нормализация компании)
 * - techStack (структурированный список технологий)
 * - seniorityLevel (junior/middle/senior/lead/principal)
 * - requiresAi (упоминается ли AI/ML)
 * - benefits (бонусы и преимущества)
 * - workFormat (remote/hybrid/office)
 * - companySize, companyIndustry (размер и индустрия компании)
 * - contractType (тип контракта)
 * - descriptionShort (краткое описание для UI)
 * - salaryRecommendation (AI-рекомендация зарплаты)
 *
 * Использование:
 * bun run enrich-ai.ts --limit 100    # Обработать 100 вакансий
 * bun run enrich-ai.ts --batch 20     # По 20 за раз
 */

import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { sql, isNull, isNotNull, and } from 'drizzle-orm';
import { createLogger } from './src/shared/utils/logger';
import { getAIProvider } from './src/shared/ai';
import type { AIAnalysisResult } from './src/shared/ai';

const log = createLogger('EnrichAI');

/**
 * Главная функция
 */
async function main() {
  const limit = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '100', 10);
  const batchSize = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '20', 10);

  // Получаем AI провайдера (с автоматическим fallback)
  const aiProvider = getAIProvider();

  console.log('🤖 ETL Phase 3: AI Enrichment...\n');
  console.log(`📊 Параметры:`);
  console.log(`   - Провайдер: ${aiProvider.name} (${aiProvider.model})`);
  console.log(`   - Максимум вакансий: ${limit}`);
  console.log(`   - Размер батча: ${batchSize}`);
  console.log(`   - Rate limit: ${aiProvider.rateLimit.requestsPerMinute} RPM\n`);

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

        const analysis = await aiProvider.analyzeVacancy(
          vacancy.description,
          (vacancy.skills as string[]) || []
        );

        if (analysis) {
          // Обновляем запись в БД (все поля включая новые)
          await db.update(vacancies)
            .set({
              jobCategory: analysis.jobCategory,
              jobTags: analysis.jobTags,
              companyNameNormalized: analysis.companyNameNormalized,
              companyType: analysis.companyType,
              techStack: analysis.techStack as any,
              seniorityLevel: analysis.seniorityLevel,
              requiresAi: analysis.requiresAi || false,
              benefits: analysis.benefits,
              workFormat: analysis.workFormat,
              companySize: analysis.companySize,
              companyIndustry: analysis.companyIndustry,
              contractType: analysis.contractType,
              descriptionShort: analysis.descriptionShort,
              salaryRecommendation: analysis.salaryRecommendation as any,
              aiEnrichedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(sql`${vacancies.id} = ${vacancy.id}`);

          successful++;
          console.log(`   ✅ ${analysis.jobCategory} | ${analysis.techStack?.length || 0} tech | ${analysis.seniorityLevel || '?'}\n`);
        } else {
          failed++;
          console.log(`   ❌ Ошибка AI анализа\n`);
        }

        // Динамическая задержка по rate limit провайдера
        const delay = Math.ceil(60000 / aiProvider.rateLimit.requestsPerMinute);
        await new Promise(resolve => setTimeout(resolve, delay));
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
