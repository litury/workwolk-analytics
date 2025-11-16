/**
 * Application Repository
 *
 * Следует паттерну Repository из ARCHITECTURE.md
 * Абстрагирует доступ к данным (Сток в терминологии EDA)
 */

import { prisma } from '../../config/database';
import { createLogger } from '../../utils/logger';

const log = createLogger('ApplicationRepository');

export class ApplicationRepository {
  /**
   * Найти отклик по ID
   */
  async findByIdAsync(_id: string) {
    log.info('Finding application by ID', { id: _id });

    return await prisma.application.findUnique({
      where: { id: _id },
      include: {
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

    return await prisma.application.findMany({
      where: { userId: _userId },
      include: {
        resume: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }

  /**
   * Найти все отклики по резюме
   */
  async findByResumeIdAsync(_resumeId: string) {
    log.info('Finding applications by resume ID', { resumeId: _resumeId });

    return await prisma.application.findMany({
      where: { resumeId: _resumeId },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }

  /**
   * Найти отклики по статусу
   */
  async findByStatusAsync(_status: string) {
    log.info('Finding applications by status', { status: _status });

    return await prisma.application.findMany({
      where: { status: _status },
      include: {
        resume: true,
        user: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });
  }

  /**
   * Проверить существует ли отклик на вакансию
   */
  async existsByResumeAndVacancyAsync(_resumeId: string, _vacancyId: string) {
    log.info('Checking if application exists', { resumeId: _resumeId, vacancyId: _vacancyId });

    const application = await prisma.application.findUnique({
      where: {
        resumeId_vacancyId: {
          resumeId: _resumeId,
          vacancyId: _vacancyId
        }
      }
    });

    return application !== null;
  }

  /**
   * Получить все отклики
   */
  async findAllAsync() {
    log.info('Finding all applications');

    return await prisma.application.findMany({
      include: {
        resume: true,
        user: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
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

    return await prisma.application.create({
      data: _data
    });
  }

  /**
   * Обновить статус отклика
   */
  async updateStatusAsync(_id: string, _status: string) {
    log.info('Updating application status', { id: _id, status: _status });

    return await prisma.application.update({
      where: { id: _id },
      data: { status: _status }
    });
  }

  /**
   * Удалить отклик
   */
  async deleteAsync(_id: string) {
    log.info('Deleting application', { id: _id });

    return await prisma.application.delete({
      where: { id: _id }
    });
  }

  /**
   * Получить статистику откликов пользователя
   */
  async getStatsByUserIdAsync(_userId: string) {
    log.info('Getting application stats by user ID', { userId: _userId });

    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: { userId: _userId },
      _count: {
        status: true
      }
    });

    return stats.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const applicationRepository = new ApplicationRepository();
