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

  // === НОВЫЕ ПОЛЯ (Фаза 1: Quick Wins) ===

  // Company insights
  companySize: text('company_size'),            // '1-10', '11-50', '51-200', '201-500', '500+'
  companyIndustry: text('company_industry'),    // 'Fintech', 'E-commerce', 'SaaS', etc.

  // Job classification
  seniorityLevel: text('seniority_level'),      // 'junior', 'middle', 'senior', 'lead', 'principal'
  workFormat: text('work_format'),              // 'remote', 'hybrid', 'office'
  contractType: text('contract_type'),          // 'permanent', 'contract', 'freelance', 'intern'

  // Benefits & perks
  benefits: jsonb('benefits').$type<string[]>(), // ['ДМС', 'Опционы', 'Обучение', 'Гибкий график']

  // AI/ML trend tracking
  requiresAi: boolean('requires_ai').default(false), // Упоминается AI/ML/GPT

  // Tech stack detailed (replacing simple skills with structured data)
  techStack: jsonb('tech_stack').$type<Array<{
    name: string;           // 'React'
    category: string;       // 'framework' | 'language' | 'tool' | 'cloud'
    required: boolean;      // true = must-have, false = nice-to-have
  }>>(),

  // Мета
  publishedAt: timestamp('published_at', { mode: 'date' }),
  collectedAt: timestamp('collected_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),

  // === ETL Pipeline Tracking ===
  detailsFetchedAt: timestamp('details_fetched_at', { mode: 'date' }), // Когда собрали детали (description, skills)
  aiEnrichedAt: timestamp('ai_enriched_at', { mode: 'date' }),         // Когда обогатили через AI
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
