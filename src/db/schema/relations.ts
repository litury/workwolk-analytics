/**
 * Связи между таблицами
 */

import { relations } from 'drizzle-orm';
import { sources } from './sources';
import { vacancies } from './vacancies';

export const sourcesRelations = relations(sources, ({ many }) => ({
  vacancies: many(vacancies),
}));

export const vacanciesRelations = relations(vacancies, ({ one }) => ({
  source: one(sources, {
    fields: [vacancies.sourceId],
    references: [sources.id],
  }),
}));
