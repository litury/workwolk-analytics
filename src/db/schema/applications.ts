import { pgTable, text, timestamp, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';
import { resumes } from './resumes';

// Отправленные отклики на вакансии
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),

  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  vacancyId: text('vacancy_id').notNull(),
  vacancyTitle: text('vacancy_title').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  status: text('status').notNull().default('sent'), // sent, viewed, invited, rejected, error
  appliedAt: timestamp('applied_at', { mode: 'date' }).notNull().defaultNow()
}, (table) => ({
  resumeVacancyUnique: uniqueIndex('applications_resume_id_vacancy_id_key').on(table.resumeId, table.vacancyId),
  userIdIdx: index('applications_user_id_idx').on(table.userId),
  appliedAtIdx: index('applications_applied_at_idx').on(table.appliedAt),
  statusIdx: index('applications_status_idx').on(table.status)
}));

// Type exports
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
