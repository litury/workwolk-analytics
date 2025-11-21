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
Backend: TypeScript, ElysiaJS, Drizzle ORM, PostgreSQL, Bull/BullMQ, Passport.js
Frontend: Vue.js 3, TypeScript, Pinia, Tailwind CSS
Infra: Docker, npm
Testing: Vitest

## Источники данных
- HH.ru API: резюме, вакансии, отклики (OAuth scopes: write_negotiations, read_resumes)
- Rate Limits: 60 req/min, ~200 applications/day

## Модель разработки
Этап 1: Монолит Vue.js + NestJS (OAuth, очереди Bull/BullMQ)
Этап 2: Telegram Mini App (~100 строк кода)
Этап 3: Микросервисы (Kafka, распределенная обработка)
