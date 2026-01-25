/**
 * Схема таблицы job_categories
 * Система категорий для классификации IT вакансий
 *
 * 35 категорий основаны на:
 * - HH.ru API Professional Roles (26 IT ролей)
 * - LinkedIn Jobs on the Rise 2026
 * - O*NET Occupation Taxonomy
 * - Текущие тренды IT рынка 2026
 */

import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const jobCategories = pgTable('job_categories', {
  id: serial('id').primaryKey(),

  // Идентификаторы
  slug: text('slug').notNull().unique(), // 'frontend-react', 'ai-data-scientist'
  name: text('name').notNull(),          // 'React Frontend Developer'
  displayName: text('display_name'),     // 'React / Next.js Frontend'

  // Поисковые параметры для HH.ru
  searchKeywords: jsonb('search_keywords').$type<string[]>().notNull(), // ['react', 'nextjs', 'redux']
  excludeKeywords: jsonb('exclude_keywords').$type<string[]>().default([]), // ['backend', 'qa']

  // Метаданные категории
  category: text('category').notNull(),  // 'frontend', 'backend', 'data', 'ai', 'devops', 'qa', 'product', 'specialized'
  seniority: text('seniority').default('all'), // 'all', 'junior', 'middle', 'senior' (для будущего фильтра)

  // Интеграция с HH.ru API
  hhRoleId: integer('hh_role_id'),       // ID роли из https://api.hh.ru/professional_roles

  // Управление и приоритизация
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(2).notNull(), // 0 = МАКСИМУМ (AI, DevOps), 3 = LOW (niche)

  // Описание для UI
  description: text('description'),      // Краткое описание категории

  // Timestamps
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export type JobCategory = typeof jobCategories.$inferSelect;
export type NewJobCategory = typeof jobCategories.$inferInsert;
