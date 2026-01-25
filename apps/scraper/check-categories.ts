/**
 * Проверка статистики по категориям
 */
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const stats = await db.execute(sql`
      SELECT category, COUNT(*) as count
      FROM vacancies
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('📊 Вакансии по категориям:\n');
    stats.rows.forEach((r: any, i: number) => {
      console.log(`  ${i + 1}. ${r.category}: ${r.count}`);
    });

    const total = stats.rows.reduce((sum: number, r: any) => sum + Number(r.count), 0);
    console.log(`\nВсего: ${total} вакансий в ${stats.rows.length} категориях`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await closeDatabase();
  }
}

main();
