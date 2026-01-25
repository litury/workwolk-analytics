/**
 * Проверка общей статистики БД
 */
import { db, closeDatabase } from './src/shared/db/client';
import { vacancies } from './src/shared/db/schema';
import { eq, isNotNull, isNull, sql } from 'drizzle-orm';

async function main() {
  try {
    const all = await db.select().from(vacancies);
    const remote = await db.select().from(vacancies).where(eq(vacancies.remote, true));
    const withDetails = await db.select().from(vacancies).where(isNotNull(vacancies.detailsFetchedAt));
    const withAI = await db.select().from(vacancies).where(isNotNull(vacancies.aiEnrichedAt));

    console.log('📊 СТАТИСТИКА БД:\n');
    console.log('Общая статистика:');
    console.log(`  - Всего вакансий: ${all.length}`);
    console.log(`  - Удалённых: ${remote.length} (${Math.round((remote.length / all.length) * 100)}%)`);
    console.log(`  - С детальными данными: ${withDetails.length}`);
    console.log(`  - С AI анализом: ${withAI.length}`);

    // Последние 5 вакансий
    const recent = await db.select()
      .from(vacancies)
      .orderBy(sql`${vacancies.collectedAt} DESC`)
      .limit(5);

    console.log('\n📝 Последние 5 вакансий:');
    recent.forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.title}`);
      console.log(`   Компания: ${v.company}`);
      console.log(`   Локация: ${v.location || 'не указана'}`);
      console.log(`   Удалённо: ${v.remote ? 'ДА ✅' : 'НЕТ ❌'}`);
      console.log(`   Собрано: ${v.collectedAt?.toLocaleString('ru-RU')}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await closeDatabase();
  }
}

main();
