import { relations } from 'drizzle-orm';
import { users } from './users';
import { resumes } from './resumes';
import { applications } from './applications';

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  applications: many(applications)
}));

// Resume relations
export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id]
  }),
  applications: many(applications)
}));

// Application relations
export const applicationsRelations = relations(applications, ({ one }) => ({
  resume: one(resumes, {
    fields: [applications.resumeId],
    references: [resumes.id]
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id]
  })
}));
