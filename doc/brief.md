# WorkWolk — Агрегатор данных IT рынка

## Описание
Система сбора и анализа данных о вакансиях с различных площадок для мониторинга трендов IT рынка.

## Цель
- Агрегация вакансий с разных источников
- Анализ трендов (навыки, зарплаты, форматы работы)
- API для доступа к собранным данным

## Стек

| Компонент | Технологии |
|-----------|------------|
| Runtime | Bun (scraper), Node.js (web) |
| Backend | ElysiaJS, TypeScript |
| Frontend | Next.js (static) |
| Database | PostgreSQL, Drizzle ORM |
| Scraping | Playwright |
| Logging | Pino |
| Deploy | Dokploy |

## Структура монорепо

```
workwolk/
├── apps/
│   ├── scraper/           # ElysiaJS backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── vacancy/   # API + сервис вакансий
│   │       │   └── hh/        # HH.ru скрапер
│   │       ├── shared/
│   │       │   ├── db/        # Drizzle схема
│   │       │   └── utils/     # Logger и утилиты
│   │       └── config/
│   └── web/               # Next.js landing
└── packages/
    └── types/             # Общие TypeScript типы
```

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

## Домены

| Домен | Приложение |
|-------|------------|
| workwolk.ru | Landing (Next.js) |
| api.workwolk.ru | API (планируется) |

## Roadmap

1. HH.ru скрапер (готово)
2. Landing page (готово)
3. Habr Career интеграция
4. SuperJob интеграция
5. Аналитический дашборд
6. Telegram бот для уведомлений
