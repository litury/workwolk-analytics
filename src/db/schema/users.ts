import { pgTable, text, timestamp, uuid, bigint } from 'drizzle-orm/pg-core';

// Пользователь с OAuth токенами HH.ru
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  hhUserId: text('hh_user_id').notNull().unique(),
  email: text('email').unique(),
  fullName: text('full_name'),

  // OAuth токены HH.ru
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiry: timestamp('token_expiry', { mode: 'date' }),

  // Telegram опционально для будущей интеграции
  telegramId: bigint('telegram_id', { mode: 'bigint' }).unique(),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
});

// Type exports для использования в коде
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
