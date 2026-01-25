/**
 * Скрипт для прямого применения миграции job_categories
 */

import { db } from './src/shared/db/client';
import { sql } from 'drizzle-orm';

async function applyMigration() {
  console.log('🔄 Применение миграции job_categories...\n');

  try {
    // Создаем таблицу job_categories
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "job_categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "slug" text NOT NULL,
        "name" text NOT NULL,
        "display_name" text,
        "search_keywords" jsonb NOT NULL,
        "exclude_keywords" jsonb DEFAULT '[]'::jsonb,
        "category" text NOT NULL,
        "seniority" text DEFAULT 'all',
        "hh_role_id" integer,
        "is_active" boolean DEFAULT true NOT NULL,
        "priority" integer DEFAULT 2 NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "job_categories_slug_unique" UNIQUE("slug")
      );
    `);

    console.log('✅ Таблица job_categories создана успешно\n');

    // Проверим что таблица создалась
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'job_categories';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Верификация: таблица существует в БД');
    } else {
      console.error('❌ Таблица не найдена после создания');
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('ℹ️  Таблица job_categories уже существует');
    } else {
      console.error('❌ Ошибка при применении миграции:', error);
      throw error;
    }
  } finally {
    process.exit(0);
  }
}

applyMigration();
