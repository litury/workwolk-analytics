/**
 * HH Auto Respond EDA - Main Application
 *
 * Event-Driven Architecture для автооткликов на вакансии HH.ru
 * Следует терминологии из лекции (Sources, Sinks, Transformers, Activities)
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { createLogger } from './utils/logger';
import { db, closeDatabase } from './db/client';
import { sql } from 'drizzle-orm';
import { userRoutes } from './modules/userModule';
import { resumeRoutes } from './modules/resumeModule';
import { applicationRoutes } from './modules/applicationModule';

// Add BigInt serialization support for JSON
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

const log = createLogger('MainApp');

const app = new Elysia()
  // CORS middleware
  .use(cors())

  // Request logging middleware
  .onRequest(({ request }) => {
    log.info('Incoming request', {
      method: request.method,
      url: request.url
    });
  })

  // Error handling middleware
  .onError(({ error }) => {
    log.error('Error occurred', {
      message: error.message,
      stack: error.stack
    });

    return {
      error: true,
      message: error.message
    };
  })

  // Health check endpoint
  .get('/', () => {
    log.info('Health check called');

    return {
      status: 'ok',
      service: 'HH Auto Respond EDA',
      timestamp: new Date().toISOString()
    };
  })

  // Database health check
  .get('/health/db', async () => {
    try {
      await db.execute(sql`SELECT 1`);

      log.info('Database health check: OK');

      return {
        status: 'ok',
        database: 'connected'
      };
    } catch (error) {
      log.error('Database health check: FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        status: 'error',
        database: 'disconnected'
      };
    }
  })

  // Module routes
  .use(userRoutes)
  .use(resumeRoutes)
  .use(applicationRoutes)

  // Start server
  .listen(process.env.PORT || 3000);

log.info('Server started', {
  port: app.server?.port,
  hostname: app.server?.hostname,
  url: `http://${app.server?.hostname}:${app.server?.port}`
});

log.info('Available endpoints', {
  endpoints: [
    'GET /',
    'GET /health/db',
    '',
    '--- Users ---',
    'GET /api/users',
    'GET /api/users/:id',
    'GET /api/users/telegram/:telegramId',
    'POST /api/users',
    'PATCH /api/users/:id/tokens',
    'DELETE /api/users/:id',
    '',
    '--- Resumes ---',
    'GET /api/resumes',
    'GET /api/resumes/:id',
    'GET /api/resumes/user/:userId',
    'GET /api/resumes/auto-respond/enabled',
    'POST /api/resumes',
    'PATCH /api/resumes/:id/auto-respond',
    'DELETE /api/resumes/:id',
    '',
    '--- Applications ---',
    'GET /api/applications',
    'GET /api/applications/:id',
    'GET /api/applications/user/:userId',
    'GET /api/applications/resume/:resumeId',
    'GET /api/applications/status/:status',
    'GET /api/applications/user/:userId/stats',
    'POST /api/applications',
    'PATCH /api/applications/:id/status',
    'DELETE /api/applications/:id'
  ]
});

// Graceful shutdown
process.on('SIGINT', async () => {
  log.info('SIGINT received, shutting down gracefully');

  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.info('SIGTERM received, shutting down gracefully');

  await closeDatabase();
  process.exit(0);
});
