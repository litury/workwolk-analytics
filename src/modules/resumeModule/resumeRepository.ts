/**
 * Resume Repository
 *
 * Следует паттерну Repository из ARCHITECTURE.md
 * Абстрагирует доступ к данным (Сток в терминологии EDA)
 */

import { prisma } from '../../config/database';
import { createLogger } from '../../utils/logger';

const log = createLogger('ResumeRepository');

export class ResumeRepository {
  /**
   * Найти резюме по ID
   */
  async findByIdAsync(_id: string) {
    log.info('Finding resume by ID', { id: _id });

    return await prisma.resume.findUnique({
      where: { id: _id },
      include: {
        user: true,
        applications: true
      }
    });
  }

  /**
   * Найти резюме по HH ID
   */
  async findByHhResumeIdAsync(_hhResumeId: string) {
    log.info('Finding resume by HH Resume ID', { hhResumeId: _hhResumeId });

    return await prisma.resume.findUnique({
      where: { hhResumeId: _hhResumeId }
    });
  }

  /**
   * Найти все резюме пользователя
   */
  async findByUserIdAsync(_userId: string) {
    log.info('Finding resumes by user ID', { userId: _userId });

    return await prisma.resume.findMany({
      where: { userId: _userId },
      include: {
        applications: true
      }
    });
  }

  /**
   * Найти резюме с включенным автооткликом
   */
  async findWithAutoRespondEnabledAsync() {
    log.info('Finding resumes with auto-respond enabled');

    return await prisma.resume.findMany({
      where: {
        autoRespondEnabled: true
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Получить все резюме
   */
  async findAllAsync() {
    log.info('Finding all resumes');

    return await prisma.resume.findMany({
      include: {
        user: true,
        applications: true
      }
    });
  }

  /**
   * Создать резюме
   */
  async createAsync(_data: {
    hhResumeId: string;
    title: string;
    userId: string;
    autoRespondEnabled?: boolean;
  }) {
    log.info('Creating resume', {
      hhResumeId: _data.hhResumeId,
      userId: _data.userId
    });

    return await prisma.resume.create({
      data: _data
    });
  }

  /**
   * Обновить резюме
   */
  async updateAsync(_id: string, _data: {
    title?: string;
    autoRespondEnabled?: boolean;
  }) {
    log.info('Updating resume', { id: _id });

    return await prisma.resume.update({
      where: { id: _id },
      data: _data
    });
  }

  /**
   * Удалить резюме
   */
  async deleteAsync(_id: string) {
    log.info('Deleting resume', { id: _id });

    return await prisma.resume.delete({
      where: { id: _id }
    });
  }
}

export const resumeRepository = new ResumeRepository();
