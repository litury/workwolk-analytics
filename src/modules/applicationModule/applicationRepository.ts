/**
 * Application Repository
 *
 * Следует паттерну Repository из ARCHITECTURE.md
 * Абстрагирует доступ к данным (Сток в терминологии EDA)
 */

import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../../db/client';
import { applications } from '../../db/schema';
import { createLogger } from '../../utils/logger';

const log = createLogger('ApplicationRepository');

export class ApplicationRepository {
  /**
   * Найти отклик по ID
   */
  async findByIdAsync(_id: string) {
    log.info('Finding application by ID', { id: _id });

    return await db.query.applications.findFirst({
      where: eq(applications.id, _id),
      with: {
        resume: true,
        user: true
      }
    });
  }

  /**
   * Найти все отклики пользователя
   */
  async findByUserIdAsync(_userId: string) {
    log.info('Finding applications by user ID', { userId: _userId });

    return await db.query.applications.findMany({
      where: eq(applications.userId, _userId),
      with: {
        resume: true
      },
      orderBy: desc(applications.appliedAt)
    });
  }

  /**
   * Найти все отклики по резюме
   */
  async findByResumeIdAsync(_resumeId: string) {
    log.info('Finding applications by resume ID', { resumeId: _resumeId });

    return await db.query.applications.findMany({
      where: eq(applications.resumeId, _resumeId),
      orderBy: desc(applications.appliedAt)
    });
  }

  /**
   * Найти отклики по статусу
   */
  async findByStatusAsync(_status: string) {
    log.info('Finding applications by status', { status: _status });

    return await db.query.applications.findMany({
      where: eq(applications.status, _status),
      with: {
        resume: true,
        user: true
      },
      orderBy: desc(applications.appliedAt)
    });
  }

  /**
   * Проверить существует ли отклик на вакансию
   */
  async existsByResumeAndVacancyAsync(_resumeId: string, _vacancyId: string) {
    log.info('Checking if application exists', { resumeId: _resumeId, vacancyId: _vacancyId });

    const application = await db.query.applications.findFirst({
      where: and(
        eq(applications.resumeId, _resumeId),
        eq(applications.vacancyId, _vacancyId)
      )
    });

    return application !== null;
  }

  /**
   * Получить все отклики
   */
  async findAllAsync() {
    log.info('Finding all applications');

    return await db.query.applications.findMany({
      with: {
        resume: true,
        user: true
      },
      orderBy: desc(applications.appliedAt)
    });
  }

  /**
   * Создать отклик
   */
  async createAsync(_data: {
    resumeId: string;
    vacancyId: string;
    vacancyTitle: string;
    userId: string;
    status?: string;
  }) {
    log.info('Creating application', {
      resumeId: _data.resumeId,
      vacancyId: _data.vacancyId,
      userId: _data.userId
    });

    const [application] = await db.insert(applications).values(_data).returning();
    return application;
  }

  /**
   * Обновить статус отклика
   */
  async updateStatusAsync(_id: string, _status: string) {
    log.info('Updating application status', { id: _id, status: _status });

    const [application] = await db
      .update(applications)
      .set({ status: _status })
      .where(eq(applications.id, _id))
      .returning();

    return application;
  }

  /**
   * Удалить отклик
   */
  async deleteAsync(_id: string) {
    log.info('Deleting application', { id: _id });

    const [application] = await db.delete(applications).where(eq(applications.id, _id)).returning();
    return application;
  }

  /**
   * Получить статистику откликов пользователя
   */
  async getStatsByUserIdAsync(_userId: string) {
    log.info('Getting application stats by user ID', { userId: _userId });

    // Drizzle groupBy with aggregation
    const stats = await db
      .select({
        status: applications.status,
        count: count(applications.status)
      })
      .from(applications)
      .where(eq(applications.userId, _userId))
      .groupBy(applications.status);

    // Transform to Record<string, number>
    return stats.reduce((acc: Record<string, number>, item: { status: string; count: number }) => {
      acc[item.status] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const applicationRepository = new ApplicationRepository();
