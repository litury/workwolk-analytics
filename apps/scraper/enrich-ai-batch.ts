/**
 * ETL Phase 3: Load - AI Batch Enrichment
 *
 * Обогащает вакансии через AI батчами (OpenRouter или Gemini с автоматическим fallback)
 * Определяет: jobCategory, jobTags, companyNameNormalized, techStack, и др.
 *
 * Использование:
 * bun run enrich-ai-batch.ts --limit=14000
 */

import pLimit from 'p-limit';
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { isNotNull, isNull, and, eq } from 'drizzle-orm';
import { createLogger } from './src/shared/utils/logger';
import { getAIProvider } from './src/shared/ai';
import type { VacancyInput } from './src/shared/ai';

const log = createLogger('EnrichAIBatch');
const CONCURRENCY = 100; // Увеличено для OpenRouter (нет жестких rate limits)

/**
 * Главная функция
 */
async function main() {
  const limit = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '14000', 10);

  // Получаем AI провайдера (с автоматическим fallback)
  const aiProvider = getAIProvider();
  const BATCH_SIZE = aiProvider.rateLimit.maxBatchSize;

  console.log('🤖 ETL Phase 3: AI Batch Enrichment (Parallel)\n');
  console.log('='.repeat(80));
  console.log(`📊 Parameters:`);
  console.log(`   Provider: ${aiProvider.name}`);
  console.log(`   Model: ${aiProvider.model}`);
  console.log(`   Max vacancies: ${limit}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Concurrency: ${CONCURRENCY} parallel requests`);
  console.log(`   Rate limit: ${aiProvider.rateLimit.requestsPerMinute} RPM`);
  console.log('='.repeat(80) + '\n');

  try {
    const vacanciesWithoutAI = await db.select()
      .from(vacancies)
      .where(and(isNotNull(vacancies.description), isNull(vacancies.aiEnrichedAt)))
      .limit(limit);

    console.log(`📋 Found ${vacanciesWithoutAI.length} vacancies to enrich\n`);

    if (vacanciesWithoutAI.length === 0) {
      console.log('✅ All vacancies already enriched!');
      return;
    }

    const batches = [];
    for (let i = 0; i < vacanciesWithoutAI.length; i += BATCH_SIZE) {
      batches.push(vacanciesWithoutAI.slice(i, i + BATCH_SIZE));
    }

    const totalBatches = batches.length;
    let successful = 0;
    let failed = 0;
    const startTime = Date.now();

    const limitConcurrency = pLimit(CONCURRENCY);

    const results = await Promise.allSettled(
      batches.map((batch, index) =>
        limitConcurrency(async () => {
          const batchNum = index + 1;
          console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} vacancies)`);

          try {
            // Преобразуем в VacancyInput[]
            const vacancyInputs: VacancyInput[] = batch.map(v => ({
              title: v.title,
              company: v.company,
              description: v.description || '',
              skills: (v.skills as string[]) || [],
              salaryFrom: v.salaryFrom,
              salaryTo: v.salaryTo,
            }));

            const aiResults = await aiProvider.analyzeBatch(vacancyInputs);

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
                  descriptionShort: aiResults[j].descriptionShort,
                  salaryRecommendation: aiResults[j].salaryRecommendation,
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

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successful += result.value.count;
        } else {
          failed += result.value.count;
        }
      }
    });

    const elapsed = (Date.now() - startTime) / 1000 / 60;

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Enrichment complete!\n');
    console.log('📊 Final statistics:');
    console.log(`   Processed: ${successful + failed}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${Math.round((successful / (successful + failed)) * 100)}%`);
    console.log(`   Time elapsed: ${elapsed.toFixed(1)} minutes`);
    console.log(`   Speed: ${((successful + failed) / elapsed).toFixed(1)} vacancies/min`);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

main();
