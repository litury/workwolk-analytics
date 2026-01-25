/**
 * Seed данных для Vacancy Aggregator
 */

import { db, closeDatabase } from './client';
import { sources, jobCategories } from './schema';
import { count } from 'drizzle-orm';
import { jobCategoriesSeed } from './seedData/jobCategoriesData';

async function main() {
  console.log('Начало загрузки seed данных...');

  // Источники вакансий
  await db.insert(sources).values([
    { name: 'hh', displayName: 'HeadHunter', baseUrl: 'https://hh.ru' },
  ]).onConflictDoNothing({ target: sources.name });

  console.log('✅ Источники созданы');

  // Категории вакансий (35 IT категорий)
  await db.insert(jobCategories).values(jobCategoriesSeed)
    .onConflictDoNothing({ target: jobCategories.slug });

  console.log('✅ Категории вакансий загружены (35 IT категорий)');

  // Статистика
  const [{ count: sourcesCount }] = await db.select({ count: count() }).from(sources);
  const [{ count: categoriesCount }] = await db.select({ count: count() }).from(jobCategories);

  console.log('\n📊 Статистика БД:');
  console.log(`   Источников: ${sourcesCount}`);
  console.log(`   Категорий: ${categoriesCount}`);
  console.log('\n✅ Seed данные загружены!\n');
}

main()
  .catch((e) => {
    console.error('Ошибка при загрузке seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDatabase();
  });
