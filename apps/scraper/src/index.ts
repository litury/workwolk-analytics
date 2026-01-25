/**
 * Vacancy Aggregator - Main Application
 *
 * Скрапинг вакансий с HH.ru через Playwright
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { createLogger } from './shared/utils/logger';
import { db, closeDatabase } from './shared/db/client';
import { sql } from 'drizzle-orm';
import { vacancyRoutes } from './modules/vacancy';
import { initSourcesAsync } from './modules/vacancy/vacancyService';
import { closeBrowserAsync } from './modules/hh';

// BigInt сериализация для JSON
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

const log = createLogger('MainApp');

// Инициализация приложения
async function initAsync(): Promise<void> {
  log.info('Инициализация источников...');
  await initSourcesAsync();
  log.info('Источники инициализированы');
}

const app = new Elysia()
  .use(cors())

  // Логирование запросов
  .onRequest(({ request }) => {
    log.info('Incoming request', {
      method: request.method,
      url: request.url
    });
  })

  // Обработка ошибок
  .onError(({ error }) => {
    const message = error instanceof Error ? error.message : String(error);

    log.error('Error occurred', error instanceof Error ? error : undefined, { message });

    return {
      error: true,
      message
    };
  })

  // Health check
  .get('/', () => ({
    status: 'ok',
    service: 'Vacancy Aggregator',
    timestamp: new Date().toISOString()
  }))

  // Database health
  .get('/health/db', async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      log.error('Database health check failed', error instanceof Error ? error : undefined);
      return { status: 'error', database: 'disconnected' };
    }
  })

  // API роуты
  .use(vacancyRoutes)

  .listen(process.env.PORT || 3000);

// Запуск инициализации
initAsync().catch(err => {
  log.error('Init failed', err instanceof Error ? err : undefined);
});

log.info('Server started', {
  port: app.server?.port,
  url: `http://${app.server?.hostname}:${app.server?.port}`
});

log.info('Available endpoints', {
  endpoints: [
    'GET /',
    'GET /health/db',
    '',
    '--- Vacancies ---',
    'GET /api/vacancies',
    'GET /api/vacancies/scrape?q=TypeScript&pages=3',
    'GET /api/vacancies/export?format=json|csv',
  ]
});

// Graceful shutdown
async function shutdownAsync(): Promise<void> {
  log.info('Shutting down...');
  await closeBrowserAsync();
  await closeDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdownAsync);
process.on('SIGTERM', shutdownAsync);
