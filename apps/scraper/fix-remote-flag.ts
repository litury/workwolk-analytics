/**
 * Исправление флага remote для всех вакансий
 *
 * Все вакансии были собраны с фильтром work_format=REMOTE,
 * но из-за бага в логике определения remote они помечены как remote=false.
 * Этот скрипт исправляет это.
 */
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🔧 Исправление флага remote для всех вакансий...\n');

  try {
    // Обновить все вакансии, установив remote = true
    const result = await db.update(vacancies)
      .set({ remote: true })
      .where(eq(vacancies.remote, false));

    console.log('✅ Исправление завершено!');
    console.log(`   Обновлено вакансий: ${result.rowCount || 0}`);

    // Проверить результат
    const totalRemote = await db.select()
      .from(vacancies)
      .where(eq(vacancies.remote, true));

    const totalVacancies = await db.select().from(vacancies);

    console.log('\n📊 Статистика после исправления:');
    console.log(`   Всего вакансий: ${totalVacancies.length}`);
    console.log(`   Удалённых: ${totalRemote.length} (${Math.round((totalRemote.length / totalVacancies.length) * 100)}%)`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
    throw error;
  } finally {
    await closeDatabase();
    console.log('\n🔒 БД закрыта');
  }
}

main();
