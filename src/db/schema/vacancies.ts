/**
 * Таблица вакансий
 * Хранит собранные вакансии со всех источников
 */

import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { sources } from './sources';

export const vacancies = pgTable('vacancies', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Связь с источником
  sourceId: uuid('source_id').references(() => sources.id).notNull(),

  // Идентификация
  externalId: text('external_id').notNull(),   // ID на площадке (hh: "123456")
  url: text('url').notNull(),                  // Полная ссылка на вакансию

  // Основные данные
  title: text('title').notNull(),
  company: text('company').notNull(),
  companyUrl: text('company_url'),

  // Зарплата
  salaryFrom: integer('salary_from'),
  salaryTo: integer('salary_to'),
  currency: text('currency'),                   // 'RUB', 'USD', 'EUR'
  salaryGross: boolean('salary_gross'),         // true = до налогов

  // Детали
  description: text('description'),
  skills: jsonb('skills').$type<string[]>(),    // ['TypeScript', 'React', 'Node.js']
  experience: text('experience'),               // 'noExperience', '1-3', '3-6', '6+'
  employment: text('employment'),               // 'full', 'part', 'project', 'intern'
  schedule: text('schedule'),                   // 'fullDay', 'shift', 'flexible', 'remote'

  // Локация
  location: text('location'),                   // 'Москва', 'Удалённо'
  remote: boolean('remote').default(false),

  // Мета
  publishedAt: timestamp('published_at', { mode: 'date' }),
  collectedAt: timestamp('collected_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
}, (_table) => ({
  // Уникальность: один external_id на источник
  uniqueSourceExternal: unique().on(_table.sourceId, _table.externalId),
  // Индексы для поиска
  idxSource: index('idx_vacancies_source').on(_table.sourceId),
  idxCollected: index('idx_vacancies_collected').on(_table.collectedAt),
  idxSkills: index('idx_vacancies_skills').using('gin', _table.skills),
}));

export type Vacancy = typeof vacancies.$inferSelect;
export type NewVacancy = typeof vacancies.$inferInsert;
