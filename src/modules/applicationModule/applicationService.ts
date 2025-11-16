/**
 * Application Service
 *
 * Следует паттерну Service из ARCHITECTURE.md
 * Бизнес-логика работы с откликами на вакансии
 */

import { applicationRepository } from './applicationRepository';
import { createLogger } from '../../utils/logger';

const log = createLogger('ApplicationService');

export class ApplicationService {
  /**
   * Получить отклик по ID
   */
  async getApplicationByIdAsync(_id: string) {
    log.info('Getting application by ID', { id: _id });

    const application = await applicationRepository.findByIdAsync(_id);

    if (!application) {
      log.warn('Application not found', { id: _id });
      throw new Error('Application not found');
    }

    return application;
  }

  /**
   * Получить все отклики пользователя
   */
  async getUserApplicationsAsync(_userId: string) {
    log.info('Getting user applications', { userId: _userId });

    return await applicationRepository.findByUserIdAsync(_userId);
  }

  /**
   * Получить все отклики по резюме
   */
  async getResumeApplicationsAsync(_resumeId: string) {
    log.info('Getting resume applications', { resumeId: _resumeId });

    return await applicationRepository.findByResumeIdAsync(_resumeId);
  }

  /**
   * Получить отклики по статусу
   */
  async getApplicationsByStatusAsync(_status: string) {
    log.info('Getting applications by status', { status: _status });

    return await applicationRepository.findByStatusAsync(_status);
  }

  /**
   * Получить все отклики
   */
  async getAllApplicationsAsync() {
    log.info('Getting all applications');

    return await applicationRepository.findAllAsync();
  }

  /**
   * Создать отклик на вакансию
   */
  async createApplicationAsync(_data: {
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

    // Проверяем не отправляли ли мы уже отклик на эту вакансию
    const exists = await applicationRepository.existsByResumeAndVacancyAsync(
      _data.resumeId,
      _data.vacancyId
    );

    if (exists) {
      log.warn('Application already exists', {
        resumeId: _data.resumeId,
        vacancyId: _data.vacancyId
      });

      throw new Error('Application already sent for this vacancy');
    }

    return await applicationRepository.createAsync(_data);
  }

  /**
   * Обновить статус отклика
   */
  async updateApplicationStatusAsync(_id: string, _status: string) {
    log.info('Updating application status', { id: _id, status: _status });

    // Валидация статуса
    const validStatuses = ['sent', 'viewed', 'invited', 'rejected', 'error'];

    if (!validStatuses.includes(_status)) {
      log.error('Invalid status', { status: _status });
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await applicationRepository.updateStatusAsync(_id, _status);
  }

  /**
   * Удалить отклик
   */
  async deleteApplicationAsync(_id: string) {
    log.info('Deleting application', { id: _id });

    return await applicationRepository.deleteAsync(_id);
  }

  /**
   * Получить статистику откликов пользователя
   */
  async getUserStatsAsync(_userId: string) {
    log.info('Getting user application stats', { userId: _userId });

    return await applicationRepository.getStatsByUserIdAsync(_userId);
  }
}

export const applicationService = new ApplicationService();
