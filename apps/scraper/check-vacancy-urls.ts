import { db } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { sql } from 'drizzle-orm';

// Получить 10 случайных вакансий
const randomVacancies = await db.select({
  id: vacancies.id,
  title: vacancies.title,
  company: vacancies.company,
  url: vacancies.url,
  externalId: vacancies.externalId,
  collectedAt: vacancies.collectedAt,
})
.from(vacancies)
.orderBy(sql`RANDOM()`)
.limit(10);

console.log('🔍 Проверка URL вакансий (10 случайных):\n');

randomVacancies.forEach((v, i) => {
  const time = v.collectedAt ? new Date(v.collectedAt).toLocaleString('ru-RU') : 'N/A';
  console.log(`${i+1}. ${v.title}`);
  console.log(`   Компания: ${v.company}`);
  console.log(`   URL: ${v.url}`);
  console.log(`   External ID: ${v.externalId}`);
  console.log(`   Собрано: ${time}`);

  // Проверка формата URL
  const isValidUrl = v.url.startsWith('https://hh.ru/vacancy/');
  const hasValidId = /vacancy\/\d+/.test(v.url);

  const urlStatus = isValidUrl ? 'OK' : 'ОШИБКА';
  const idStatus = hasValidId ? 'OK' : 'ОШИБКА';

  console.log(`   ✅ Формат URL: ${urlStatus}`);
  console.log(`   ✅ Есть ID вакансии: ${idStatus}`);
  console.log('');
});

// Статистика по URL
const total = await db.select({ count: sql<number>`count(*)` }).from(vacancies);
console.log(`📊 Всего вакансий в БД: ${total[0].count}`);

process.exit(0);
