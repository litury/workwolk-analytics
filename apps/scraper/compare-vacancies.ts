import { db } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { isNull, isNotNull, sql } from 'drizzle-orm';

console.log('🔍 Сравнение вакансий: до и после парсинга деталей\n');

// Статистика
const stats = await db.select({
  total: sql<number>`count(*)`,
  withDetails: sql<number>`count(*) filter (where ${vacancies.detailsFetchedAt} is not null)`,
  withAI: sql<number>`count(*) filter (where ${vacancies.aiEnrichedAt} is not null)`,
  withoutDetails: sql<number>`count(*) filter (where ${vacancies.detailsFetchedAt} is null)`,
}).from(vacancies);

console.log('📊 Общая статистика:');
console.log(`   Всего вакансий: ${stats[0].total}`);
console.log(`   С деталями (description, skills): ${stats[0].withDetails}`);
console.log(`   С AI-обогащением: ${stats[0].withAI}`);
console.log(`   Без деталей: ${stats[0].withoutDetails}`);
console.log('');

// Вакансия БЕЗ деталей (только базовые поля)
const withoutDetails = await db.select({
  title: vacancies.title,
  company: vacancies.company,
  salaryFrom: vacancies.salaryFrom,
  salaryTo: vacancies.salaryTo,
  location: vacancies.location,
  description: vacancies.description,
  skills: vacancies.skills,
  detailsFetchedAt: vacancies.detailsFetchedAt,
  aiEnrichedAt: vacancies.aiEnrichedAt,
})
.from(vacancies)
.where(isNull(vacancies.detailsFetchedAt))
.limit(1);

// Вакансия С деталями
const withDetails = await db.select({
  title: vacancies.title,
  company: vacancies.company,
  salaryFrom: vacancies.salaryFrom,
  salaryTo: vacancies.salaryTo,
  location: vacancies.location,
  description: vacancies.description,
  skills: vacancies.skills,
  experience: vacancies.experience,
  employment: vacancies.employment,
  schedule: vacancies.schedule,
  detailsFetchedAt: vacancies.detailsFetchedAt,
  aiEnrichedAt: vacancies.aiEnrichedAt,
})
.from(vacancies)
.where(isNotNull(vacancies.detailsFetchedAt))
.limit(1);

console.log('🔴 Вакансия БЕЗ деталей (Phase 1: Extract):');
if (withoutDetails[0]) {
  const v = withoutDetails[0];
  const salFrom = v.salaryFrom || 'N/A';
  const salTo = v.salaryTo || 'N/A';
  const loc = v.location || 'N/A';
  const desc = v.description ? v.description.substring(0, 50) + '...' : 'NULL ❌';
  const sk = v.skills ? JSON.stringify(v.skills) : 'NULL ❌';
  const det = v.detailsFetchedAt || 'NULL ❌';

  console.log(`   Название: ${v.title}`);
  console.log(`   Компания: ${v.company}`);
  console.log(`   Зарплата: ${salFrom} - ${salTo}`);
  console.log(`   Локация: ${loc}`);
  console.log(`   Description: ${desc}`);
  console.log(`   Skills: ${sk}`);
  console.log(`   detailsFetchedAt: ${det}`);
  console.log('');
}

console.log('🟢 Вакансия С деталями (Phase 2: Transform):');
if (withDetails[0]) {
  const v = withDetails[0];
  const salFrom = v.salaryFrom || 'N/A';
  const salTo = v.salaryTo || 'N/A';
  const loc = v.location || 'N/A';
  const desc = v.description ? v.description.substring(0, 100) + '...' : 'NULL';
  const sk = v.skills ? JSON.stringify(v.skills).substring(0, 100) + '...' : 'NULL';
  const exp = v.experience || 'NULL';
  const emp = v.employment || 'NULL';
  const sch = v.schedule || 'NULL';
  const det = v.detailsFetchedAt ? new Date(v.detailsFetchedAt).toLocaleString('ru-RU') : 'NULL';

  console.log(`   Название: ${v.title}`);
  console.log(`   Компания: ${v.company}`);
  console.log(`   Зарплата: ${salFrom} - ${salTo}`);
  console.log(`   Локация: ${loc}`);
  console.log(`   Description: ${desc}`);
  console.log(`   Skills: ${sk}`);
  console.log(`   Experience: ${exp}`);
  console.log(`   Employment: ${emp}`);
  console.log(`   Schedule: ${sch}`);
  console.log(`   detailsFetchedAt: ${det} ✅`);
  console.log('');
}

console.log('💡 Можно ли запускать AI обогащение?');
if (stats[0].withDetails > 0) {
  console.log(`   ✅ ДА! Есть ${stats[0].withDetails} вакансий с деталями`);
  console.log(`   Команда: bun run enrich-ai.ts --limit=50`);
} else {
  console.log(`   ❌ НЕТ! Сначала соберите детали через:`);
  console.log(`   bun run fetch-details.ts --limit=100`);
}

process.exit(0);
