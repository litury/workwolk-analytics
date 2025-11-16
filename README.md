# HH Auto Respond EDA

Образовательный проект автоматизации откликов на вакансии HH.ru на основе событийно-управляемой архитектуры

## О проекте

HH Auto Respond EDA — образовательный проект, демонстрирующий событийно-управляемую архитектуру (Event-Driven Architecture) для автоматизации откликов на вакансии HH.ru. Построен на Vue.js 3, NestJS, PostgreSQL и Bull/а. Может быть адаптирован под Telegram Mini App.

**Стек технологий:** Bun • ElysiaJS • TypeScript • PostgreSQL • Prisma ORM • Pino Logger • Docker

## Возможности

- Событийно-управляемая архитектура с очередями сообщений
- База данных PostgreSQL с Prisma ORM
- Моковые данные для разработки (пользователи, резюме, отклики)
- Система миграций базы данных
- Утилиты бэкапа и восстановления
- Готовность к адаптации под Telegram Mini App

## Быстрый старт

```bash
# Установить зависимости и запустить всё
bun run setup

# Открыть Prisma Studio для просмотра БД
bun run studio
```

Это выполнит:
1. Установку зависимостей
2. Запуск PostgreSQL в Docker
3. Применение миграций
4. Загрузку моковых данных
5. Открытие GUI для БД на http://localhost:5555

## Требования

- Docker Desktop
- Bun 1.0+ ([установка](https://bun.sh/docs/installation))

## Документация

### Основные руководства
- [Руководство по установке](./doc/INSTALLATION.md) - Детальная инструкция по настройке
- [Справочник команд](./doc/COMMANDS.md) - Все команды и скрипты
- [Руководство по БД](./doc/DATABASE.md) - Схема, миграции и примеры
- [Руководство по использованию](./doc/USAGE.md) - Типичные сценарии работы

### Технические детали
- [TypeScript Setup](./doc/TYPESCRIPT.md) - TypeScript конфигурация и strict mode
- [Logger (Pino)](./doc/LOGGER.md) - Настройка и использование логирования
- [Тестирование](./tests/README.md) - E2E тесты на Bun
- [Архитектура](./doc/ARCHITECTURE.md) - Структура проекта и паттерны
- [Технический бриф](./doc/brief.md) - Полная спецификация проекта

## Статус разработки

**Текущий этап:** Слой базы данных завершён (PostgreSQL + Prisma)

**Следующие шаги:**
1. Backend API (NestJS + OAuth + интеграция с HH.ru)
2. Frontend (Vue.js 3 + Pinia + Tailwind)
3. Адаптация под Telegram Mini App

Подробный roadmap см. в [doc/brief.md](./doc/brief.md)

## Участие в разработке

Мы приветствуем любой вклад в проект! Ознакомьтесь с документацией:

- [Руководство по участию](./doc/CONTRIBUTING.md)
- [Стандарты кодирования](./doc/CODING_STYLE.md)
- [Git Workflow](./doc/GIT_WORKFLOW.md)

**Контакт:** [@divatoz](https://t.me/divatoz)

## Архитектура

Проект демонстрирует:
- Событийно-управляемую архитектуру (Event-Driven Architecture)
- Repository Pattern + Dependency Injection
- Обработку через очереди (Bull/BullMQ)
- Database-first подход с Prisma

Детальная документация по архитектуре: [doc/ARCHITECTURE.md](./doc/ARCHITECTURE.md)

## Лицензия

MIT License — см. [LICENSE](./LICENSE)

---

Разработано [@divatoz](https://t.me/divatoz) для образовательных целей
