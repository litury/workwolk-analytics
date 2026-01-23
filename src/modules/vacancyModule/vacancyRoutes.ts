/**
 * API роуты для вакансий
 */

import { Elysia, t } from 'elysia';
import {
  getVacanciesAsync,
  countVacanciesAsync,
  scrapeAndSaveAsync,
  exportVacanciesJsonAsync,
  exportVacanciesCsvAsync,
} from '../../services';
import { closeBrowserAsync } from '../../scraper';

export const vacancyRoutes = new Elysia({ prefix: '/api/vacancies' })

  // GET /api/vacancies - список вакансий из БД
  .get('/', async ({ query }) => {
    const filters = {
      sourceId: query.sourceId,
      remote: query.remote === 'true' ? true : query.remote === 'false' ? false : undefined,
      skills: query.skills?.split(',').filter(Boolean),
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    };

    const [data, total] = await Promise.all([
      getVacanciesAsync(filters),
      countVacanciesAsync(filters),
    ]);

    return {
      data,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
      },
    };
  }, {
    query: t.Object({
      sourceId: t.Optional(t.String()),
      remote: t.Optional(t.String()),
      skills: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
  })

  // GET /api/vacancies/scrape - запустить скрапинг
  .get('/scrape', async ({ query }) => {
    const params = {
      query: query.q || 'TypeScript',
      area: query.area ? Number(query.area) : 1, // 1 = Москва
      pages: query.pages ? Number(query.pages) : 3,
    };

    const result = await scrapeAndSaveAsync(params);

    return {
      success: result.errors.length === 0,
      ...result,
    };
  }, {
    query: t.Object({
      q: t.Optional(t.String()),
      area: t.Optional(t.String()),
      pages: t.Optional(t.String()),
    }),
  })

  // GET /api/vacancies/export - экспорт
  .get('/export', async ({ query, set }) => {
    const format = query.format || 'json';
    const filters = {
      sourceId: query.sourceId,
      remote: query.remote === 'true' ? true : query.remote === 'false' ? false : undefined,
    };

    if (format === 'csv') {
      set.headers['Content-Type'] = 'text/csv; charset=utf-8';
      set.headers['Content-Disposition'] = 'attachment; filename=vacancies.csv';
      return exportVacanciesCsvAsync(filters);
    }

    set.headers['Content-Type'] = 'application/json';
    return exportVacanciesJsonAsync(filters);
  }, {
    query: t.Object({
      format: t.Optional(t.String()),
      sourceId: t.Optional(t.String()),
      remote: t.Optional(t.String()),
    }),
  })

  // Закрытие браузера при завершении
  .onStop(async () => {
    await closeBrowserAsync();
  });
