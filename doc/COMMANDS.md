# Commands Reference

Справочник команд для проекта WorkWolk (монорепозиторий).

## Структура проекта

```
workwolk/
├── apps/
│   ├── scraper/     # ElysiaJS backend (Bun)
│   └── web/         # Next.js landing (Node.js)
└── packages/
    └── types/       # Общие типы TypeScript
```

## Root команды (из корня)

| Команда | Описание |
|---------|----------|
| `bun run dev:scraper` | Запустить скрапер (порт 3000) |
| `bun run dev:web` | Запустить веб-приложение |
| `bun run build:web` | Собрать Next.js приложение |
| `bun run db:push` | Синхронизировать схему с БД |
| `bun run db:studio` | Открыть Drizzle Studio |
| `bun run test` | Запустить тесты |
| `bun run typecheck` | Проверка типов |

## Scraper команды (apps/scraper)

```bash
cd apps/scraper

# Разработка
bun run dev                # Запустить сервер

# База данных
bun run db:generate        # Сгенерировать миграции
bun run db:push            # Синхронизировать схему
bun run db:studio          # Drizzle Studio
bun run seed               # Загрузить seed данные

# Тестирование
bun test                   # Запустить тесты
bun run typecheck          # Проверка типов
```

## Web команды (apps/web)

```bash
cd apps/web

npm run dev     # Запустить dev сервер
npm run build   # Собрать для продакшена
npm run start   # Запустить продакшен сервер
```

## Drizzle Kit CLI

```bash
cd apps/scraper

bunx drizzle-kit generate   # Сгенерировать миграции
bunx drizzle-kit push       # Синхронизировать схему
bunx drizzle-kit studio     # Открыть Drizzle Studio
```

## Типичный workflow

### Разработка скрапера

```bash
# Из корня проекта
bun run dev:scraper
```

### Изменение схемы БД

```bash
# 1. Изменить файлы в apps/scraper/src/shared/db/schema/
# 2. Синхронизировать с БД
bun run db:push
# 3. Проверить в Drizzle Studio
bun run db:studio
```

### Деплой

```bash
# Web деплоится через Dokploy (GitHub + Dockerfile)
# Scraper пока локально
```
