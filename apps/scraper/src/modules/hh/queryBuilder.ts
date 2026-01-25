/**
 * Query Builder для HH.ru
 * Генерирует поисковые запросы на основе категорий вакансий
 *
 * Документация HH.ru:
 * - Операторы поиска: https://hh.ru/article/1175
 * - API Professional Roles: https://api.hh.ru/professional_roles
 */

import { db } from '../../shared/db/client';
import { jobCategories } from '../../shared/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('QueryBuilder');

export interface ISearchQuery {
  text: string;              // HH.ru search query (с операторами OR, AND, NOT)
  professionalRole?: number; // HH.ru role ID (опционально)
  category: string;          // Наша категория ('frontend', 'backend', 'ai', etc)
  slug: string;              // Slug категории ('frontend-react', 'ai-data-scientist')
  displayName: string;       // Отображаемое имя ('React / Next.js')
}

/**
 * Построить поисковый запрос HH.ru из категории
 *
 * Синтаксис HH.ru (https://hh.ru/article/1175):
 * - OR: "react" OR "vue" OR "angular"
 * - AND: "frontend" AND "developer"
 * - NOT: NOT "backend"
 * - Фразы: "full stack developer"
 * - Группировка: (term1 OR term2) AND NOT (term3)
 *
 * @param categorySlug - slug категории (например 'frontend-react')
 * @returns Сгенерированный поисковый запрос
 */
export async function buildSearchQueryAsync(categorySlug: string): Promise<ISearchQuery> {
  log.info(`Building search query for category: ${categorySlug}`);

  // Получить категорию из БД
  const result = await db
    .select()
    .from(jobCategories)
    .where(and(
      eq(jobCategories.slug, categorySlug),
      eq(jobCategories.isActive, true)
    ))
    .limit(1);

  if (result.length === 0) {
    throw new Error(`Category not found or inactive: ${categorySlug}`);
  }

  const category = result[0];
  const { searchKeywords, excludeKeywords, hhRoleId, displayName } = category;

  // Валидация
  if (!searchKeywords || searchKeywords.length === 0) {
    throw new Error(`Category ${categorySlug} has no search keywords`);
  }

  // ========================================
  // Построение запроса по синтаксису HH.ru
  // ========================================

  // 1. Позитивные ключевые слова (OR)
  // Каждое слово в кавычках для точного match
  const positiveTerms = searchKeywords
    .map(kw => `"${kw}"`)
    .join(' OR ');

  // 2. Негативные ключевые слова (NOT)
  let negativeTerms = '';
  if (excludeKeywords && excludeKeywords.length > 0) {
    const excludedTerms = excludeKeywords
      .map(kw => `"${kw}"`)
      .join(' OR ');
    negativeTerms = ` AND NOT (${excludedTerms})`;
  }

  // 3. Финальный запрос
  // Формат: (keyword1 OR keyword2 OR keyword3) AND NOT (excluded1 OR excluded2)
  const searchText = `(${positiveTerms})${negativeTerms}`;

  log.info(`Generated query for ${categorySlug}`, {
    query: searchText,
    hhRoleId,
    category: category.category
  });

  return {
    text: searchText,
    professionalRole: hhRoleId ?? undefined,
    category: category.category,
    slug: categorySlug,
    displayName: displayName ?? category.name,
  };
}

/**
 * Получить все активные категории (отсортированные по приоритету)
 *
 * @returns Массив категорий для скрапинга
 */
export async function getActiveCategoriesAsync() {
  const categories = await db
    .select()
    .from(jobCategories)
    .where(eq(jobCategories.isActive, true))
    .orderBy(asc(jobCategories.priority)); // 0 = МАКСИМУМ (AI, DevOps), 3 = LOW (niche)

  log.info(`Found ${categories.length} active categories`);

  return categories;
}

/**
 * Получить категории по уровню приоритета
 *
 * @param priority - уровень приоритета (0 = МАКСИМУМ, 3 = LOW)
 * @returns Массив категорий с указанным приоритетом
 */
export async function getCategoriesByPriorityAsync(priority: number) {
  const categories = await db
    .select()
    .from(jobCategories)
    .where(and(
      eq(jobCategories.isActive, true),
      eq(jobCategories.priority, priority)
    ))
    .orderBy(asc(jobCategories.slug));

  log.info(`Found ${categories.length} categories with priority ${priority}`);

  return categories;
}

/**
 * Получить категории по типу (frontend, backend, ai, etc)
 *
 * @param category - тип категории
 * @returns Массив категорий указанного типа
 */
export async function getCategoriesByTypeAsync(category: string) {
  const categories = await db
    .select()
    .from(jobCategories)
    .where(and(
      eq(jobCategories.isActive, true),
      eq(jobCategories.category, category)
    ))
    .orderBy(asc(jobCategories.priority));

  log.info(`Found ${categories.length} categories of type ${category}`);

  return categories;
}
