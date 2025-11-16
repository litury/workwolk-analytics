/**
 * Resume Routes
 *
 * REST API endpoints для работы с резюме
 * Следует паттерну Routes из ARCHITECTURE.md
 */

import { Elysia, t } from 'elysia';
import { resumeService } from './resumeService';
import { createLogger } from '../../utils/logger';

const log = createLogger('ResumeRoutes');

export const resumeRoutes = new Elysia({ prefix: '/api/resumes' })
  /**
   * GET /api/resumes
   * Получить все резюме
   */
  .get('/', async () => {
    log.info('GET /api/resumes');

    const resumes = await resumeService.getAllResumesAsync();

    return {
      success: true,
      data: resumes
    };
  })

  /**
   * GET /api/resumes/:id
   * Получить резюме по ID
   */
  .get('/:id', async ({ params, set }) => {
    log.info('GET /api/resumes/:id', { id: params.id });

    try {
      const resume = await resumeService.getResumeByIdAsync(params.id);

      return {
        success: true,
        data: resume
      };
    } catch (error) {
      set.status = 404;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resume not found'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  /**
   * GET /api/resumes/user/:userId
   * Получить все резюме пользователя
   */
  .get('/user/:userId', async ({ params }) => {
    log.info('GET /api/resumes/user/:userId', { userId: params.userId });

    const resumes = await resumeService.getUserResumesAsync(params.userId);

    return {
      success: true,
      data: resumes
    };
  }, {
    params: t.Object({
      userId: t.String()
    })
  })

  /**
   * GET /api/resumes/auto-respond/enabled
   * Получить резюме с включенным автооткликом
   */
  .get('/auto-respond/enabled', async () => {
    log.info('GET /api/resumes/auto-respond/enabled');

    const resumes = await resumeService.getAutoRespondResumesAsync();

    return {
      success: true,
      data: resumes
    };
  })

  /**
   * POST /api/resumes
   * Создать или обновить резюме
   */
  .post('/', async ({ body, set }) => {
    log.info('POST /api/resumes', { body });

    try {
      const resume = await resumeService.upsertResumeAsync({
        hhResumeId: body.hhResumeId,
        title: body.title,
        userId: body.userId,
        autoRespondEnabled: body.autoRespondEnabled
      });

      set.status = 201;

      return {
        success: true,
        data: resume
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create resume'
      };
    }
  }, {
    body: t.Object({
      hhResumeId: t.String(),
      title: t.String(),
      userId: t.String(),
      autoRespondEnabled: t.Optional(t.Boolean())
    })
  })

  /**
   * PATCH /api/resumes/:id/auto-respond
   * Включить/отключить автоотклик
   */
  .patch('/:id/auto-respond', async ({ params, body, set }) => {
    log.info('PATCH /api/resumes/:id/auto-respond', { id: params.id, enabled: body.enabled });

    try {
      const resume = await resumeService.toggleAutoRespondAsync(params.id, body.enabled);

      return {
        success: true,
        data: resume
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle auto-respond'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      enabled: t.Boolean()
    })
  })

  /**
   * DELETE /api/resumes/:id
   * Удалить резюме
   */
  .delete('/:id', async ({ params, set }) => {
    log.info('DELETE /api/resumes/:id', { id: params.id });

    try {
      await resumeService.deleteResumeAsync(params.id);

      return {
        success: true,
        message: 'Resume deleted'
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete resume'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  });
