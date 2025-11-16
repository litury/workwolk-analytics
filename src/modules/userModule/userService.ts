/**
 * User Service
 *
 * Следует паттерну Service из ARCHITECTURE.md
 * Бизнес-логика работы с пользователями
 */

import { User } from '@prisma/client';
import { userRepository } from './userRepository';
import { createLogger } from '../../utils/logger';

const log = createLogger('UserService');

export class UserService {
  /**
   * Получить пользователя по ID
   */
  async getUserByIdAsync(_id: string) {
    log.info('Getting user by ID', { id: _id });

    const user = await userRepository.findByIdAsync(_id);

    if (!user) {
      log.warn('User not found', { id: _id });
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Получить пользователя по Telegram ID
   */
  async getUserByTelegramIdAsync(_telegramId: bigint): Promise<User | null> {
    log.info('Getting user by Telegram ID', { telegramId: _telegramId.toString() });

    return await userRepository.findByTelegramIdAsync(_telegramId);
  }

  /**
   * Получить пользователя по HH User ID
   */
  async getUserByHhUserIdAsync(_hhUserId: string): Promise<User | null> {
    log.info('Getting user by HH User ID', { hhUserId: _hhUserId });

    return await userRepository.findByHhUserIdAsync(_hhUserId);
  }

  /**
   * Получить всех пользователей
   */
  async getAllUsersAsync() {
    log.info('Getting all users');

    return await userRepository.findAllAsync();
  }

  /**
   * Создать или обновить пользователя (upsert)
   */
  async upsertUserAsync(_data: {
    hhUserId: string;
    email?: string;
    fullName?: string;
    telegramId?: bigint;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
  }) {
    log.info('Upserting user', {
      hhUserId: _data.hhUserId,
      email: _data.email,
      telegramId: _data.telegramId?.toString()
    });

    const existingUser = await userRepository.findByHhUserIdAsync(_data.hhUserId);

    if (existingUser) {
      log.info('User exists, updating', { id: existingUser.id });

      return await userRepository.updateAsync(existingUser.id, {
        email: _data.email,
        fullName: _data.fullName,
        accessToken: _data.accessToken,
        refreshToken: _data.refreshToken,
        tokenExpiry: _data.tokenExpiry
      });
    }

    log.info('User does not exist, creating');

    return await userRepository.createAsync(_data);
  }

  /**
   * Обновить OAuth токены пользователя
   */
  async updateTokensAsync(_userId: string, _tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // в секундах
  }) {
    log.info('Updating user tokens', { userId: _userId });

    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + _tokens.expiresIn);

    return await userRepository.updateAsync(_userId, {
      accessToken: _tokens.accessToken,
      refreshToken: _tokens.refreshToken,
      tokenExpiry
    });
  }

  /**
   * Удалить пользователя
   */
  async deleteUserAsync(_id: string) {
    log.info('Deleting user', { id: _id });

    return await userRepository.deleteAsync(_id);
  }
}

export const userService = new UserService();
