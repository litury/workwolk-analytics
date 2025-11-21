/**
 * Resume Repository
 *
 * Следует паттерну Repository из ARCHITECTURE.md
 * Абстрагирует доступ к данным (Сток в терминологии EDA)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { resumes, type Resume, type NewResume } from '../../db/schema';
import { createLogger } from '../../utils/logger';

const log = createLogger('ResumeRepository');

export class ResumeRepository {
  /**
   * Найти резюме по ID
   */
  async findByIdAsync(_id: string) {
    log.info('Finding resume by ID', { id: _id });

    return await db.query.resumes.findFirst({
      where: eq(resumes.id, _id),
      with: {
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

    return await db.query.resumes.findFirst({
      where: eq(resumes.hhResumeId, _hhResumeId)
    });
  }

  /**
   * Найти все резюме пользователя
   */
  async findByUserIdAsync(_userId: string) {
    log.info('Finding resumes by user ID', { userId: _userId });

    return await db.query.resumes.findMany({
      where: eq(resumes.userId, _userId),
      with: {
        applications: true
      }
    });
  }

  /**
   * Найти резюме с включенным автооткликом
   */
  async findWithAutoRespondEnabledAsync() {
    log.info('Finding resumes with auto-respond enabled');

    return await db.query.resumes.findMany({
      where: eq(resumes.autoRespondEnabled, true),
      with: {
        user: true
      }
    });
  }

  /**
   * Получить все резюме
   */
  async findAllAsync() {
    log.info('Finding all resumes');

    return await db.query.resumes.findMany({
      with: {
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

    const [resume] = await db.insert(resumes).values(_data).returning();
    return resume;
  }

  /**
   * Обновить резюме
   */
  async updateAsync(_id: string, _data: {
    title?: string;
    autoRespondEnabled?: boolean;
  }) {
    log.info('Updating resume', { id: _id });

    const [resume] = await db
      .update(resumes)
      .set({ ..._data, updatedAt: new Date() })
      .where(eq(resumes.id, _id))
      .returning();

    return resume;
  }

  /**
   * Удалить резюме
   */
  async deleteAsync(_id: string) {
    log.info('Deleting resume', { id: _id });

    const [resume] = await db.delete(resumes).where(eq(resumes.id, _id)).returning();
    return resume;
  }
}

export const resumeRepository = new ResumeRepository();
