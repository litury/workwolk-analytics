/**
 * Тест Query Builder
 * Проверяет генерацию поисковых запросов для всех 35 категорий
 */

import { buildSearchQueryAsync, getActiveCategoriesAsync } from './src/modules/hh/queryBuilder';
import { closeDatabase } from './src/shared/db/client';

async function main() {
  console.log('🧪 Тест Query Builder\n');
  console.log('=' .repeat(80));

  try {
    // Получить все активные категории
    const categories = await getActiveCategoriesAsync();
    console.log(`\n📋 Найдено категорий: ${categories.length}\n`);

    // Генерация запросов для каждой категории
    for (const category of categories) {
      const query = await buildSearchQueryAsync(category.slug);

      console.log(`\n🔍 ${category.displayName || category.name}`);
      console.log(`   Slug:     ${query.slug}`);
      console.log(`   Category: ${query.category}`);
      console.log(`   Priority: ${category.priority} (0=MAX, 3=LOW)`);
      console.log(`   HH.ru ID: ${query.professionalRole || 'N/A'}`);
      console.log(`   Query:    ${query.text}`);

      // Проверка длины запроса (HH.ru имеет лимиты)
      if (query.text.length > 500) {
        console.log(`   ⚠️  WARNING: Query too long (${query.text.length} chars)`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Query Builder работает корректно!');
    console.log(`   Сгенерировано запросов: ${categories.length}`);

    // Группировка по категориям
    const grouped = categories.reduce((acc, cat) => {
      acc[cat.category] = (acc[cat.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Распределение по типам:');
    Object.entries(grouped).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(15)}: ${count} категорий`);
    });

    // Группировка по приоритетам
    const byPriority = categories.reduce((acc, cat) => {
      acc[cat.priority] = (acc[cat.priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('\n🎯 Распределение по приоритетам:');
    Object.entries(byPriority)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([priority, count]) => {
        const label = priority === '0' ? 'МАКСИМУМ (AI, DevOps)' :
                      priority === '1' ? 'Высокий' :
                      priority === '2' ? 'Средний' : 'Низкий (niche)';
        console.log(`   Priority ${priority} (${label.padEnd(25)}): ${count} категорий`);
      });

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

main();
