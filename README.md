# WorkWolk

Агрегатор данных IT рынка для аналитики

## О проекте

WorkWolk собирает данные о вакансиях с различных площадок для анализа трендов IT рынка.

**Стек:** Bun • ElysiaJS • TypeScript • PostgreSQL • Drizzle ORM • Playwright

## Возможности

- Скрапинг вакансий с HH.ru
- REST API для доступа к данным
- Экспорт в JSON/CSV
- Фильтрация по навыкам, зарплате, удалёнке

## Быстрый старт

```bash
# Установить зависимости
bun install

# Установить браузер для скрапинга
npx playwright install chromium

# Настроить .env (скопировать из .env.example)
cp .env.example .env

# Применить схему БД
bun run db:push

# Запустить
bun run dev
```

## API

```
GET  /api/vacancies              - список вакансий
GET  /api/vacancies/scrape       - запустить скрапинг
GET  /api/vacancies/export       - экспорт (json/csv)
GET  /health/db                  - проверка БД
```

### Примеры

```bash
# Скрапинг вакансий TypeScript (3 страницы)
curl "http://localhost:3000/api/vacancies/scrape?q=TypeScript&pages=3"

# Список вакансий
curl "http://localhost:3000/api/vacancies?limit=10"

# Экспорт в CSV
curl "http://localhost:3000/api/vacancies/export?format=csv"
```

## Roadmap

- [x] HH.ru скрапер
- [ ] Habr Career
- [ ] SuperJob
- [ ] Аналитика и дашборд

## Документация

- [Технический бриф](./doc/brief.md)
- [Стандарты кода](./doc/CODING_STYLE.md)

## Лицензия

MIT
