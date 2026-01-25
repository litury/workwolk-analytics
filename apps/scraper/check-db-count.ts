import { db } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { count } from 'drizzle-orm';

const result = await db.select({ count: count() }).from(vacancies);
console.log('📊 Всего вакансий в БД:', result[0].count);
process.exit(0);
