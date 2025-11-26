# Brief: HH Auto Respond EDA — Веб-приложение для автооткликов на вакансии

## Описание
Веб-приложение для автооткликов на вакансии HH.ru.

## Терминология
Система построена на базе сети систем массового обслуживания.

Термины:
- **Источники** — HH.ru API (вакансии), Vue.js Frontend (действия пользователя)
- **Стоки** — PostgreSQL (журналирование), Vue.js UI (отображение)
- **Трансформеры** — фильтрация вакансий, формирование откликов
- **Активности** — проверка вакансий, отправка откликов
- **Службы** — AuthService, HHApiService, ApplicationService
- **Очереди** — vacancy.check, application.send
- **Каналы обслуживания** — REST API
- **Отказы** — отказ обслуживания (rate limit), отказ очереди (переполнение)

## Стек
Backend: Bun, ElysiaJS, TypeScript, Drizzle ORM, PostgreSQL, Pino
Frontend: Vue.js 3, TypeScript, Pinia, Tailwind CSS (планируется)
Infra: Docker, Bun scripts
Testing: Bun test (Jest-совместимый)
OAuth: Native fetch (без Passport.js)

## Источники данных
- HH.ru API: резюме, вакансии, отклики (OAuth scopes: write_negotiations, read_resumes)
- Rate Limits: 60 req/min, ~200 applications/day

## Модель разработки
Этап 0: ✅ Слой базы данных (PostgreSQL + Drizzle ORM)
Этап 1: ✅ HH.ru API интеграция (OAuth 2.0, публичные endpoints, интеграционные тесты)
Этап 2: Frontend Vue.js 3 + очереди Bull/BullMQ
Этап 3: Telegram Mini App
Этап 4: Микросервисы (Kafka, распределенная обработка)
