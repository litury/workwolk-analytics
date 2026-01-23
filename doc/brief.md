# WorkWolk — Агрегатор данных IT рынка

## Описание
Система сбора и анализа данных о вакансиях с различных площадок для мониторинга трендов IT рынка.

## Цель
- Агрегация вакансий с разных источников
- Анализ трендов (навыки, зарплаты, форматы работы)
- API для доступа к собранным данным

## Стек
- **Runtime:** Bun
- **Backend:** ElysiaJS, TypeScript
- **Database:** PostgreSQL, Drizzle ORM
- **Scraping:** Playwright
- **Logging:** Pino

## Источники данных

| Источник | Статус | Метод |
|----------|--------|-------|
| HH.ru | Готов | Playwright scraping |
| Habr Career | Планируется | - |
| SuperJob | Планируется | - |

## API

```
GET  /api/vacancies              - список вакансий
GET  /api/vacancies/scrape       - запустить скрапинг
GET  /api/vacancies/export       - экспорт (json/csv)
GET  /health/db                  - проверка БД
```

## Схема данных

### sources
Источники вакансий (hh.ru, habr, etc.)

### vacancies
- title, company, salary_from/to, currency
- location, experience, employment, schedule
- skills (array), description
- source_id, external_id, url
- published_at, scraped_at

## Roadmap

1. HH.ru скрапер (готово)
2. Habr Career интеграция
3. SuperJob интеграция
4. Аналитический дашборд
5. Telegram бот для уведомлений
