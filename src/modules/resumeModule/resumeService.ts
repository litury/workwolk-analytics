/**
 * Resume Service
 *
 * Следует паттерну Service из ARCHITECTURE.md
 * Бизнес-логика работы с резюме
 */

import { resumeRepository } from './resumeRepository';
import { createLogger } from '../../utils/logger';

const log = createLogger('ResumeService');

export class ResumeService {
  /**
   * Получить резюме по ID
   */
  async getResumeByIdAsync(_id: string) {
    log.info('Getting resume by ID', { id: _id });

    const resume = await resumeRepository.findByIdAsync(_id);

    if (!resume) {
      log.warn('Resume not found', { id: _id });
      throw new Error('Resume not found');
    }

    return resume;
  }

  /**
   * Получить все резюме пользователя
   */
  async getUserResumesAsync(_userId: string) {
    log.info('Getting user resumes', { userId: _userId });

    return await resumeRepository.findByUserIdAsync(_userId);
  }

  /**
   * Получить резюме с включенным автооткликом
   */
  async getAutoRespondResumesAsync() {
    log.info('Getting auto-respond resumes');

    return await resumeRepository.findWithAutoRespondEnabledAsync();
  }

  /**
   * Получить все резюме
   */
  async getAllResumesAsync() {
    log.info('Getting all resumes');

    return await resumeRepository.findAllAsync();
  }

  /**
   * Создать или обновить резюме (upsert)
   */
  async upsertResumeAsync(_data: {
    hhResumeId: string;
    title: string;
    userId: string;
    autoRespondEnabled?: boolean;
  }) {
    log.info('Upserting resume', {
      hhResumeId: _data.hhResumeId,
      userId: _data.userId
    });

    // Проверяем существует ли резюме
    const existingResume = await resumeRepository.findByHhResumeIdAsync(_data.hhResumeId);

    if (existingResume) {
      log.info('Resume exists, updating', { id: existingResume.id });

      return await resumeRepository.updateAsync(existingResume.id, {
        title: _data.title,
        autoRespondEnabled: _data.autoRespondEnabled
      });
    }

    log.info('Resume does not exist, creating');

    return await resumeRepository.createAsync(_data);
  }

  /**
   * Включить/отключить автоотклик для резюме
   */
  async toggleAutoRespondAsync(_id: string, _enabled: boolean) {
    log.info('Toggling auto-respond', { id: _id, enabled: _enabled });

    return await resumeRepository.updateAsync(_id, {
      autoRespondEnabled: _enabled
    });
  }

  /**
   * Удалить резюме
   */
  async deleteResumeAsync(_id: string) {
    log.info('Deleting resume', { id: _id });

    return await resumeRepository.deleteAsync(_id);
  }
}

export const resumeService = new ResumeService();
