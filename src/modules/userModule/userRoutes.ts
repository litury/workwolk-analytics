/**
 * User Routes
 *
 * REST API endpoints для работы с пользователями
 * Следует паттерну Routes из ARCHITECTURE.md
 */

import { Elysia, t } from 'elysia';
import { userService } from './userService';
import { createLogger } from '../../utils/logger';

const log = createLogger('UserRoutes');

export const userRoutes = new Elysia({ prefix: '/api/users' })
  /**
   * GET /api/users
   * Получить всех пользователей
   */
  .get('/', async () => {
    log.info('GET /api/users');

    const users = await userService.getAllUsersAsync();

    return {
      success: true,
      data: users
    };
  })

  /**
   * GET /api/users/:id
   * Получить пользователя по ID
   */
  .get('/:id', async ({ params, set }) => {
    log.info('GET /api/users/:id', { id: params.id });

    try {
      const user = await userService.getUserByIdAsync(params.id);

      return {
        success: true,
        data: user
      };
    } catch (error) {
      set.status = 404;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'User not found'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })

  /**
   * GET /api/users/telegram/:telegramId
   * Получить пользователя по Telegram ID
   */
  .get('/telegram/:telegramId', async ({ params, set }) => {
    log.info('GET /api/users/telegram/:telegramId', { telegramId: params.telegramId });

    try {
      const telegramId = BigInt(params.telegramId);
      const user = await userService.getUserByTelegramIdAsync(telegramId);

      if (!user) {
        set.status = 404;

        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: 'Invalid Telegram ID'
      };
    }
  }, {
    params: t.Object({
      telegramId: t.String()
    })
  })

  /**
   * GET /api/users/hh/:hhUserId
   * Получить пользователя по HH User ID
   */
  .get('/hh/:hhUserId', async ({ params, set }) => {
    log.info('GET /api/users/hh/:hhUserId', { hhUserId: params.hhUserId });

    const user = await userService.getUserByHhUserIdAsync(params.hhUserId);

    if (!user) {
      set.status = 404;

      return {
        success: false,
        error: 'User not found'
      };
    }

    return {
      success: true,
      data: user
    };
  }, {
    params: t.Object({
      hhUserId: t.String()
    })
  })

  /**
   * POST /api/users
   * Создать или обновить пользователя
   */
  .post('/', async ({ body, set }) => {
    log.info('POST /api/users', { body });

    try {
      const user = await userService.upsertUserAsync({
        hhUserId: body.hhUserId,
        email: body.email,
        fullName: body.fullName,
        telegramId: body.telegramId ? BigInt(body.telegramId) : undefined,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken
      });

      set.status = 201;

      return {
        success: true,
        data: user
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  }, {
    body: t.Object({
      hhUserId: t.String(),
      email: t.Optional(t.String()),
      fullName: t.Optional(t.String()),
      telegramId: t.Optional(t.String()),
      accessToken: t.Optional(t.String()),
      refreshToken: t.Optional(t.String())
    })
  })

  /**
   * PATCH /api/users/:id/tokens
   * Обновить OAuth токены пользователя
   */
  .patch('/:id/tokens', async ({ params, body, set }) => {
    log.info('PATCH /api/users/:id/tokens', { id: params.id });

    try {
      const user = await userService.updateTokensAsync(params.id, {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        expiresIn: body.expiresIn
      });

      return {
        success: true,
        data: user
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tokens'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      accessToken: t.String(),
      refreshToken: t.String(),
      expiresIn: t.Number()
    })
  })

  /**
   * DELETE /api/users/:id
   * Удалить пользователя
   */
  .delete('/:id', async ({ params, set }) => {
    log.info('DELETE /api/users/:id', { id: params.id });

    try {
      await userService.deleteUserAsync(params.id);

      return {
        success: true,
        message: 'User deleted'
      };
    } catch (error) {
      set.status = 400;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  });
