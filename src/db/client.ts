import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '../config/env';

/**
 * PostgreSQL connection singleton
 */
const queryClient = postgres(env.databaseUrl);

/**
 * Drizzle ORM database instance
 *
 * Использование:
 * - Query Builder API: db.select().from(users)
 * - Relational API: db.query.users.findFirst({ with: { resumes: true } })
 */
export const db = drizzle(queryClient, { schema });

/**
 * Close database connection
 * Используется при graceful shutdown
 */
export async function closeDatabase() {
  await queryClient.end();
}
