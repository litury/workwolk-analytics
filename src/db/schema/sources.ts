/**
 * Таблица источников вакансий
 * hh.ru, habr career, superjob и др.
 */

import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),       // 'hh', 'habr', 'superjob'
  displayName: text('display_name').notNull(), // 'HeadHunter', 'Хабр Карьера'
  baseUrl: text('base_url').notNull(),         // 'https://hh.ru'
  enabled: boolean('enabled').default(true),
  rateLimit: integer('rate_limit').default(10), // запросов в минуту
  lastScrapedAt: timestamp('last_scraped_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
