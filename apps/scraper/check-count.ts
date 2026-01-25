import { db } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { count, sql } from 'drizzle-orm';

const result = await db.select({ count: count() }).from(vacancies);
console.log('📊 ВСЕГО вакансий:', result[0].count);

// Последние 5
const latest = await db.select().from(vacancies).orderBy(sql`${vacancies.collected_at} DESC`).limit(5);
console.log('\n🆕 Последние 5 вакансий:');
latest.forEach(v => {
  console.log(`  ${v.externalId} | ${v.title} | ${v.company}`);
});

process.exit(0);
