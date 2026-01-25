/**
 * Тестовый скрипт для запуска скрапинга по категориям
 *
 * Использует Query Builder для генерации HH.ru поисковых запросов
 * на основе категорий из БД (35 IT категорий)
 *
 * Примеры:
 * - Одна категория: bun run test-scrape.ts frontend-react
 * - Без аргументов: скрапит приоритетную категорию (frontend-vue как раньше)
 */

import { scrapeAndSaveAsync } from './src/modules/vacancy/vacancyService';
import { closeBrowserAsync } from './src/modules/hh/hhScraper';
import { buildSearchQueryAsync } from './src/modules/hh/queryBuilder';
import { closeDatabase } from './src/shared/db/client';

async function main() {
  // Парсинг аргументов
  const categorySlug = process.argv[2] || 'frontend-vue';
  const pages = parseInt(process.argv[3] || '3', 10);

  console.log('🚀 Запуск скрапинга по категории (ETL Phase 1: Extract)...\n');
  console.log(`📋 Категория: ${categorySlug}`);
  console.log(`📄 Страниц: ${pages} (макс 40 страниц)`);
  console.log(`⚡ Режим: Быстрый сбор ТОЛЬКО из ленты (title, company, salary, location, URL)`);
  console.log(`🌍 Фильтр: Только УДАЛЁННЫЕ вакансии (work_format=REMOTE)`);
  console.log(`📝 Детали и AI: Используйте fetch-details.ts и enrich-ai.ts отдельно\n`);

  try {
    // Построить поисковый запрос из категории
    const searchQuery = await buildSearchQueryAsync(categorySlug);

    console.log('🔍 Сгенерированный запрос:');
    console.log(`   Query:    ${searchQuery.text}`);
    console.log(`   Category: ${searchQuery.category}`);
    console.log(`   Display:  ${searchQuery.displayName}`);
    if (searchQuery.professionalRole) {
      console.log(`   HH.ru ID: ${searchQuery.professionalRole}`);
    }
    console.log('');

    // Запускаем скрапинг с параметрами (только лента, БЕЗ детальных данных):
    const result = await scrapeAndSaveAsync({
      query: searchQuery.text,
      pages: pages,
    });

    console.log('\n✅ Скрапинг завершен!');
    console.log(`📊 Результаты:`);
    console.log(`   - Категория: ${searchQuery.displayName}`);
    console.log(`   - Всего найдено: ${result.total}`);
    console.log(`   - Сохранено новых: ${result.saved}`);
    console.log(`   - Обновлено существующих: ${result.updated}`);

    if (result.errors.length > 0) {
      console.log(`\n❌ Ошибки (${result.errors.length}):`);
      result.errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }
  } catch (error) {
    console.error('\n❌ Ошибка при скрапинге:', error);
    throw error;
  } finally {
    // Закрываем браузер и БД
    await closeBrowserAsync();
    await closeDatabase();
    console.log('\n🔒 Браузер и БД закрыты');
  }
}

main();
