/**
 * User Repository
 *
 * Следует паттерну Repository из ARCHITECTURE.md
 * Абстрагирует доступ к данным (Сток в терминологии EDA)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { users, type User, type NewUser } from '../../db/schema';
import { createLogger } from '../../utils/logger';

const log = createLogger('UserRepository');

export class UserRepository {
  /**
   * Найти пользователя по ID
   */
  async findByIdAsync(_id: string) {
    log.info('Finding user by ID', { id: _id });

    return await db.query.users.findFirst({
      where: eq(users.id, _id),
      with: {
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

    const result = await db.query.users.findFirst({
      where: eq(users.telegramId, _telegramId)
    });

    return result ?? null;
  }

  /**
   * Найти пользователя по HH User ID
   */
  async findByHhUserIdAsync(_hhUserId: string): Promise<User | null> {
    log.info('Finding user by HH User ID', { hhUserId: _hhUserId });

    const result = await db.query.users.findFirst({
      where: eq(users.hhUserId, _hhUserId)
    });

    return result ?? null;
  }

  /**
   * Получить всех пользователей
   */
  async findAllAsync() {
    log.info('Finding all users');

    return await db.query.users.findMany({
      with: {
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

    const [user] = await db.insert(users).values(_data).returning();
    return user;
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

    const [user] = await db
      .update(users)
      .set({ ..._data, updatedAt: new Date() })
      .where(eq(users.id, _id))
      .returning();

    return user;
  }

  /**
   * Удалить пользователя
   */
  async deleteAsync(_id: string) {
    log.info('Deleting user', { id: _id });

    const [user] = await db.delete(users).where(eq(users.id, _id)).returning();
    return user;
  }
}

export const userRepository = new UserRepository();
