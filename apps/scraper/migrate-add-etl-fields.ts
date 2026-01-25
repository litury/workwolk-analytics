/**
 * Добавление полей для ETL tracking в таблицу vacancies
 */
import { db, closeDatabase } from './src/shared/db/client';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🔄 Applying migration: add ETL tracking fields...\n');

  try {
    await db.execute(sql`
      ALTER TABLE vacancies
      ADD COLUMN IF NOT EXISTS details_fetched_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS ai_enriched_at TIMESTAMP;
    `);

    console.log('✅ Migration applied successfully!');
    console.log('   - Added: details_fetched_at');
    console.log('   - Added: ai_enriched_at');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

migrate();
