import { pgTable, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Резюме пользователя из HH.ru
export const resumes = pgTable('resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  hhResumeId: text('hh_resume_id').notNull().unique(),
  title: text('title').notNull(),
  autoRespondEnabled: boolean('auto_respond_enabled').notNull().default(false),

  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
}, (table) => ({
  userIdIdx: index('resumes_user_id_idx').on(table.userId),
  autoRespondEnabledIdx: index('resumes_auto_respond_enabled_idx').on(table.autoRespondEnabled)
}));

// Type exports
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
