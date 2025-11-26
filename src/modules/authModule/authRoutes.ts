import { Elysia, t } from 'elysia';
import { hhClient } from './hhClient';
import { userService } from '../userModule';
import { createLogger } from '../../utils/logger';

const log = createLogger('AuthRoutes');

/**
 * OAuth routes для авторизации через HH.ru
 */
export const authRoutes = new Elysia({ prefix: '/api/auth/hh' })
  /**
   * Редирект на страницу авторизации HH.ru
   * GET /api/auth/hh/login
   */
  .get('/login', ({ redirect, query }) => {
    const state = query.state || crypto.randomUUID();
    const authUrl = hhClient.getAuthUrl(state);
    log.info('Redirecting to HH.ru OAuth', { state });
    return redirect(authUrl);
  }, {
    query: t.Object({
      state: t.Optional(t.String())
    })
  })

  /**
   * Callback от HH.ru после авторизации
   * GET /api/auth/hh/callback?code=xxx&state=xxx
   */
  .get('/callback', async ({ query, set }) => {
    const { code, state, error } = query;

    // Проверка на ошибку от HH.ru
    if (error) {
      log.error('OAuth error from HH.ru', { error });
      set.status = 400;
      return { success: false, error };
    }

    if (!code) {
      log.error('No code in callback');
      set.status = 400;
      return { success: false, error: 'No authorization code provided' };
    }

    try {
      // Обмениваем code на токены
      log.info('Exchanging code for tokens', { state });
      const tokens = await hhClient.exchangeCode(code);

      if ('error' in tokens) {
        log.error('Token exchange failed', { error: tokens });
        set.status = 400;
        return { success: false, error: tokens };
      }

      // Получаем информацию о пользователе
      const hhUser = await hhClient.getMe(tokens.access_token);
      log.info('Got user info from HH.ru', { hhUserId: hhUser.id, email: hhUser.email });

      // Сохраняем или обновляем пользователя в БД
      const user = await userService.upsertUserAsync({
        hhUserId: hhUser.id,
        email: hhUser.email,
        fullName: `${hhUser.first_name} ${hhUser.last_name}`.trim() || undefined,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      });

      log.info('User saved to DB', { userId: user.id, hhUserId: user.hhUserId });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        // Не возвращаем токены клиенту напрямую в проде!
        // Здесь для отладки
        tokens: {
          expires_in: tokens.expires_in,
        }
      };
    } catch (error) {
      log.error('OAuth callback error', { error });
      set.status = 500;
      return { success: false, error: 'Internal server error' };
    }
  }, {
    query: t.Object({
      code: t.Optional(t.String()),
      state: t.Optional(t.String()),
      error: t.Optional(t.String()),
    })
  })

  /**
   * Обновить токен пользователя
   * POST /api/auth/hh/refresh
   */
  .post('/refresh', async ({ body, set }) => {
    const { userId } = body;

    try {
      // Получаем пользователя из БД
      const user = await userService.getUserByIdAsync(userId);
      if (!user || !user.refreshToken) {
        set.status = 404;
        return { success: false, error: 'User not found or no refresh token' };
      }

      // Обновляем токен через HH.ru
      log.info('Refreshing token for user', { userId });
      const tokens = await hhClient.refreshToken(user.refreshToken);

      if ('error' in tokens) {
        log.error('Token refresh failed', { error: tokens });
        set.status = 400;
        return { success: false, error: tokens };
      }

      // Обновляем токены в БД
      await userService.updateTokensAsync(userId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      });

      log.info('Token refreshed successfully', { userId });

      return {
        success: true,
        expires_in: tokens.expires_in,
      };
    } catch (error) {
      log.error('Token refresh error', { error });
      set.status = 500;
      return { success: false, error: 'Internal server error' };
    }
  }, {
    body: t.Object({
      userId: t.String()
    })
  });
