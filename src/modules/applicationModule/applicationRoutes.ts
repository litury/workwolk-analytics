/**
 * Application Routes
 *
 * REST API endpoints для работы с откликами
 * Следует паттерну Routes из ARCHITECTURE.md
 */

import { Elysia, t } from 'elysia';
import { applicationService } from './applicationService';
import { createLogger } from '../../utils/logger';

const log = createLogger('ApplicationRoutes');

export const applicationRoutes = new Elysia({ prefix: '/api/applications' })
  /**
   * GET /api/applications
   * Получить все отклики
   */
  .get('/', async () => {
    log.info('GET /api/applications');

    const applications = await applicationService.getAllApplicationsAsync();

    return {
      success: true,
      data: applications
    };
  })

  /**
   * GET /api/applications/:id
   * Получить отклик по ID
   */
  .get('/:id', async ({ params, set }) => {
    log.info('GET /api/applications/:id', { id: params.id });

    try {
      const application = await applicationService.getApplicationByIdAsync(params.id);

      return {
        success: true,
        data: application
      };
    } catch (error) {
      set.status = 404;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Application not found'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  /**
   * GET /api/applications/user/:userId
   * Получить все отклики пользователя
   */
  .get('/user/:userId', async ({ params }) => {
    log.info('GET /api/applications/user/:userId', { userId: params.userId });

    const applications = await applicationService.getUserApplicationsAsync(params.userId);

    return {
      success: true,
      data: applications
    };
  }, {
    params: t.Object({
      userId: t.String()
    })
  })

  /**
   * GET /api/applications/resume/:resumeId
   * Получить все отклики по резюме
   */
  .get('/resume/:resumeId', async ({ params }) => {
    log.info('GET /api/applications/resume/:resumeId', { resumeId: params.resumeId });

    const applications = await applicationService.getResumeApplicationsAsync(params.resumeId);

    return {
      success: true,
      data: applications
    };
  }, {
    params: t.Object({
      resumeId: t.String()
    })
  })

  /**
   * GET /api/applications/status/:status
   * Получить отклики по статусу
   */
  .get('/status/:status', async ({ params }) => {
    log.info('GET /api/applications/status/:status', { status: params.status });

    const applications = await applicationService.getApplicationsByStatusAsync(params.status);

    return {
      success: true,
      data: applications
    };
  }, {
    params: t.Object({
      status: t.String()
    })
  })

  /**
   * GET /api/applications/user/:userId/stats
   * Получить статистику откликов пользователя
   */
  .get('/user/:userId/stats', async ({ params }) => {
    log.info('GET /api/applications/user/:userId/stats', { userId: params.userId });

    const stats = await applicationService.getUserStatsAsync(params.userId);

    return {
      success: true,
      data: stats
    };
  }, {
    params: t.Object({
      userId: t.String()
    })
  })

  /**
   * POST /api/applications
   * Создать отклик на вакансию
   */
  .post('/', async ({ body, set }) => {
    log.info('POST /api/applications', { body });

    try {
      const application = await applicationService.createApplicationAsync({
        resumeId: body.resumeId,
        vacancyId: body.vacancyId,
        vacancyTitle: body.vacancyTitle,
        userId: body.userId,
        status: body.status
      });

      set.status = 201;

      return {
        success: true,
        data: application
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create application'
      };
    }
  }, {
    body: t.Object({
      resumeId: t.String(),
      vacancyId: t.String(),
      vacancyTitle: t.String(),
      userId: t.String(),
      status: t.Optional(t.String())
    })
  })

  /**
   * PATCH /api/applications/:id/status
   * Обновить статус отклика
   */
  .patch('/:id/status', async ({ params, body, set }) => {
    log.info('PATCH /api/applications/:id/status', { id: params.id, status: body.status });

    try {
      const application = await applicationService.updateApplicationStatusAsync(params.id, body.status);

      return {
        success: true,
        data: application
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      status: t.String()
    })
  })

  /**
   * DELETE /api/applications/:id
   * Удалить отклик
   */
  .delete('/:id', async ({ params, set }) => {
    log.info('DELETE /api/applications/:id', { id: params.id });

    try {
      await applicationService.deleteApplicationAsync(params.id);

      return {
        success: true,
        message: 'Application deleted'
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete application'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  });
