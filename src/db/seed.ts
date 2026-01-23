/**
 * Seed данных для Vacancy Aggregator
 */

import { db, closeDatabase } from './client';
import { sources } from './schema';
import { count } from 'drizzle-orm';

async function main() {
  console.log('Начало загрузки seed данных...');

  // Источники вакансий
  await db.insert(sources).values([
    { name: 'hh', displayName: 'HeadHunter', baseUrl: 'https://hh.ru' },
  ]).onConflictDoNothing({ target: sources.name });

  console.log('Источники созданы');

  // Статистика
  const [{ count: sourcesCount }] = await db.select({ count: count() }).from(sources);

  console.log('\nСтатистика БД:');
  console.log(`   Источников: ${sourcesCount}`);
  console.log('\nSeed данные загружены!\n');
}

main()
  .catch((e) => {
    console.error('Ошибка при загрузке seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDatabase();
  });
