/**
 * User Repository
 *
 * Следует паттерну Repository из ARCHITECTURE.md
 * Абстрагирует доступ к данным (Сток в терминологии EDA)
 */

import { User } from '@prisma/client';
import { prisma } from '../../config/database';
import { createLogger } from '../../utils/logger';

const log = createLogger('UserRepository');

export class UserRepository {
  /**
   * Найти пользователя по ID
   */
  async findByIdAsync(_id: string) {
    log.info('Finding user by ID', { id: _id });

    return await prisma.user.findUnique({
      where: { id: _id },
      include: {
        resumes: true,
        applications: true
      }
    });
  }

  /**
   * Найти пользователя по Telegram ID
   */
  async findByTelegramIdAsync(_telegramId: bigint): Promise<User | null> {
    log.info('Finding user by Telegram ID', { telegramId: _telegramId.toString() });

    return await prisma.user.findUnique({
      where: { telegramId: _telegramId }
    });
  }

  /**
   * Найти пользователя по HH User ID
   */
  async findByHhUserIdAsync(_hhUserId: string): Promise<User | null> {
    log.info('Finding user by HH User ID', { hhUserId: _hhUserId });

    return await prisma.user.findUnique({
      where: { hhUserId: _hhUserId }
    });
  }

  /**
   * Получить всех пользователей
   */
  async findAllAsync() {
    log.info('Finding all users');

    return await prisma.user.findMany({
      include: {
        resumes: true,
        applications: true
      }
    });
  }

  /**
   * Создать пользователя
   */
  async createAsync(_data: {
    hhUserId: string;
    email?: string;
    fullName?: string;
    telegramId?: bigint;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
  }) {
    log.info('Creating user', {
      hhUserId: _data.hhUserId,
      email: _data.email,
      telegramId: _data.telegramId?.toString()
    });

    return await prisma.user.create({
      data: _data
    });
  }

  /**
   * Обновить пользователя
   */
  async updateAsync(_id: string, _data: {
    email?: string;
    fullName?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
  }) {
    log.info('Updating user', { id: _id });

    return await prisma.user.update({
      where: { id: _id },
      data: _data
    });
  }

  /**
   * Удалить пользователя
   */
  async deleteAsync(_id: string) {
    log.info('Deleting user', { id: _id });

    return await prisma.user.delete({
      where: { id: _id }
    });
  }
}

export const userRepository = new UserRepository();
