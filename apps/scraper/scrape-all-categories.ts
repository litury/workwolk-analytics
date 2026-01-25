/**
 * Автоматический сбор по ВСЕМ 35 категориям (ETL Phase 1: Extract)
 *
 * Запускает скрапинг для всех IT категорий по приоритету:
 * - Priority 0 (МАКСИМУМ): AI, DevOps, React - скрапит первыми
 * - Priority 1 (Высокий): Backend, Cloud, Security
 * - Priority 2 (Средний): остальные Frontend/Backend/QA/Product
 * - Priority 3 (Низкий): niche категории (GameDev, Blockchain)
 *
 * Собирает ТОЛЬКО базовые данные (title, company, salary, URL) из ленты.
 * Для деталей и AI используйте: fetch-details.ts и enrich-ai.ts
 *
 * Использование:
 * - bun run scrape-all-categories.ts          # Все категории, 20 страниц каждая
 * - bun run scrape-all-categories.ts 40       # Все категории, 40 страниц каждая
 * - bun run scrape-all-categories.ts 20 0     # Только Priority 0, 20 страниц
 */

import { scrapeAndSaveAsync } from './src/modules/vacancy/vacancyService';
import { closeBrowserAsync } from './src/modules/hh/hhScraper';
import { buildSearchQueryAsync, getActiveCategoriesAsync, getCategoriesByPriorityAsync } from './src/modules/hh/queryBuilder';
import { closeDatabase } from './src/shared/db/client';

async function main() {
  // Параметры из аргументов
  const pagesPerCategory = parseInt(process.argv[2] || '20', 10);
  const specificPriority = process.argv[3] ? parseInt(process.argv[3], 10) : null;

  console.log('🚀 Автоматический сбор по всем категориям (ETL Phase 1: Extract)\n');
  console.log('=' .repeat(80));
  console.log(`📄 Страниц на категорию: ${pagesPerCategory} (макс 40)`);
  console.log(`⚡ Режим: Быстрый сбор ТОЛЬКО из ленты (title, company, salary, URL)`);
  console.log(`🌍 Фильтр: Только УДАЛЁННЫЕ вакансии (work_format=REMOTE)`);
  if (specificPriority !== null) {
    console.log(`🎯 Priority фильтр: ${specificPriority} (0=топ, 1=высокий, 2=средний, 3=низкий)`);
  }
  console.log('=' .repeat(80) + '\n');

  try {
    // Получить категории для скрапинга
    const categories = specificPriority !== null
      ? await getCategoriesByPriorityAsync(specificPriority)
      : await getActiveCategoriesAsync();

    console.log(`📋 Найдено категорий: ${categories.length}\n`);

    // Статистика
    const stats = {
      total: 0,
      saved: 0,
      updated: 0,
      errors: [] as string[],
      byCategory: {} as Record<string, { total: number; saved: number; updated: number }>,
    };

    // Скрапинг каждой категории
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const progress = `[${i + 1}/${categories.length}]`;

      console.log(`\n${progress} 🔍 ${category.displayName || category.name}`);
      console.log(`   Slug: ${category.slug} | Priority: ${category.priority} | Category: ${category.category}`);

      try {
        // Построить запрос
        const searchQuery = await buildSearchQueryAsync(category.slug);
        console.log(`   Query: ${searchQuery.text.substring(0, 100)}${searchQuery.text.length > 100 ? '...' : ''}`);

        // Запустить скрапинг (ETL Phase 1: только базовые данные)
        const result = await scrapeAndSaveAsync({
          query: searchQuery.text,
          pages: pagesPerCategory,
        });

        // Обновить статистику
        stats.total += result.total;
        stats.saved += result.saved;
        stats.updated += result.updated;
        stats.byCategory[category.slug] = {
          total: result.total,
          saved: result.saved,
          updated: result.updated,
        };

        console.log(`   ✅ Найдено: ${result.total}, Сохранено: ${result.saved}, Обновлено: ${result.updated}`);

        // Ошибки
        if (result.errors.length > 0) {
          stats.errors.push(...result.errors.map(e => `[${category.slug}] ${e}`));
          console.log(`   ⚠️  Ошибки: ${result.errors.length}`);
        }

        // Задержка между категориями (чтобы не нагружать HH.ru)
        if (i < categories.length - 1) {
          console.log('   ⏳ Задержка 3 секунды...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Ошибка: ${errorMsg}`);
        stats.errors.push(`[${category.slug}] ${errorMsg}`);
      }
    }

    // Финальная статистика
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ МАССОВЫЙ СКРАПИНГ ЗАВЕРШЕН!\n');
    console.log('📊 Общая статистика:');
    console.log(`   Категорий обработано: ${categories.length}`);
    console.log(`   Всего вакансий найдено: ${stats.total}`);
    console.log(`   Сохранено новых: ${stats.saved}`);
    console.log(`   Обновлено существующих: ${stats.updated}`);
    console.log(`   Ошибок: ${stats.errors.length}`);

    // Топ-5 категорий по количеству вакансий
    const top5 = Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5);

    console.log('\n🏆 Топ-5 категорий по количеству вакансий:');
    top5.forEach(([slug, data], i) => {
      const category = categories.find(c => c.slug === slug);
      console.log(`   ${i + 1}. ${category?.displayName || slug}: ${data.total} вакансий`);
    });

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Ошибки (${stats.errors.length}):`);
      stats.errors.slice(0, 10).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... и еще ${stats.errors.length - 10} ошибок`);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error);
    throw error;
  } finally {
    // Закрываем ресурсы
    await closeBrowserAsync();
    await closeDatabase();
    console.log('🔒 Браузер и БД закрыты\n');
  }
}

main();
