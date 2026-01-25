import { db } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { count, gte, sql } from 'drizzle-orm';

// Всего вакансий
const total = await db.select({ count: count() }).from(vacancies);
console.log('📊 Всего вакансий в БД:', total[0].count);

// За последний час
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const lastHour = await db.select({ count: count() })
  .from(vacancies)
  .where(gte(vacancies.collectedAt, oneHourAgo));
console.log('🕐 За последний час:', lastHour[0].count);

// За последние 2 часа
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
const lastTwoHours = await db.select({ count: count() })
  .from(vacancies)
  .where(gte(vacancies.collectedAt, twoHoursAgo));
console.log('🕑 За последние 2 часа:', lastTwoHours[0].count);

// Последние 5 вакансий
const recent = await db.select({
  title: vacancies.title,
  company: vacancies.company,
  collectedAt: vacancies.collectedAt,
})
.from(vacancies)
.orderBy(sql`${vacancies.collectedAt} DESC`)
.limit(5);

console.log('\n📝 Последние 5 вакансий:');
recent.forEach((v, i) => {
  const time = v.collectedAt ? new Date(v.collectedAt).toLocaleTimeString('ru-RU') : 'N/A';
  console.log(`${i+1}. [${time}] ${v.title} - ${v.company}`);
});

process.exit(0);
