# Architecture

Архитектура проекта HH Auto Respond EDA - образовательный проект на основе событийно-управляемой архитектуры.

## Структура проекта

```
hh-auto-respond-eda/
├── doc/
│   ├── brief.md                 # Технический бриф проекта (по образцу лекции)
│   ├── ARCHITECTURE.md          # Этот файл
│   ├── COMMANDS.md              # Справочник команд
│   ├── DATABASE.md              # Руководство по работе с БД
│   ├── INSTALLATION.md          # Детальная установка
│   ├── USAGE.md                 # Частые сценарии использования
│   ├── CONTRIBUTING.md          # Как участвовать в разработке
│   ├── CODING_STYLE.md          # Стандарты кодирования
│   └── GIT_WORKFLOW.md          # Правила работы с Git
│
├── docker/
│   └── docker-compose.yml       # PostgreSQL контейнер
│
├── src/
│   ├── config/
│   │   └── env.ts               # Конфигурация окружения
│   │
│   ├── db/
│   │   ├── schema/              # TypeScript схемы БД
│   │   │   ├── users.ts         # User table schema
│   │   │   ├── resumes.ts       # Resume table schema
│   │   │   ├── applications.ts  # Application table schema
│   │   │   ├── relations.ts     # Relations between tables
│   │   │   └── index.ts         # Schema exports
│   │   ├── migrations/          # SQL миграции (генерируются автоматически)
│   │   ├── client.ts            # Drizzle client singleton
│   │   └── seed.ts              # Моковые данные
│   │
│   ├── modules/
│   │   ├── authModule/          # HH.ru OAuth и API клиент
│   │   │   ├── authRoutes.ts    # OAuth endpoints
│   │   │   ├── hhClient.ts      # HH.ru API клиент
│   │   │   ├── parts/
│   │   │   │   └── hhTypes.ts   # Типы HH.ru API
│   │   │   └── index.ts
│   │   ├── userModule/          # Пользователи
│   │   ├── resumeModule/        # Резюме
│   │   └── applicationModule/   # Отклики
│   │
│   ├── utils/
│   │   └── logger.ts            # Pino logger
│   │
│   └── index.ts                 # Entry point (ElysiaJS server)
│
├── backups/                     # SQL бэкапы
│   ├── .gitkeep
│   └── README.md
│
├── scripts/
│   ├── backup.js                # Скрипт создания бэкапа
│   └── restore.js               # Скрипт восстановления
│
├── package.json                 # команды
├── .gitignore
├── .env.example                 # Пример переменных окружения
├── LICENSE                      # MIT License
└── README.md                    # Главная документация
```

---

## Архитектурные паттерны

### Event-Driven Architecture (EDA)

Проект построен на основе **событийно-управляемой архитектуры (EDA)** - паттерна, где компоненты взаимодействуют через события, а не прямые вызовы.

**Основные концепции (из лекции):**

- **Источники (Sources)** - поставляют данные:
  - HH.ru API (вакансии)
  - Vue.js Frontend (действия пользователя)

- **Стоки (Sinks)** - получают и сливают данные:
  - PostgreSQL (журналирование)
  - Vue.js UI (отображение)

- **Трансформеры (Transformers)** - получают, обрабатывают, передают:
  - Фильтрация вакансий по критериям
  - Формирование откликов

- **Активности (Activities)** - что-то делают, но не сохраняют:
  - Проверка новых вакансий
  - Отправка откликов

- **Службы (Services)** - абстрагируют БД:
  - AuthService (OAuth HH.ru)
  - HHApiService (интеграция с API)
  - ApplicationService (управление откликами)

- **Очереди (Queues)** - структура данных для задач:
  - `vacancy.check` - очередь проверки вакансий
  - `application.send` - очередь отправки откликов

- **Каналы обслуживания (Service Channels)** - обработчики:
  - REST API endpoints
  - WebSocket каналы (планируется)

- **Отказы (Failures)**:
  - Отказ обслуживания: rate limit HH.ru API (60 req/min)
  - Отказ очереди: переполнение очереди

---

## Технологический стек

### Текущий статус (Этап 1: HH.ru API интеграция)

**Backend:**
- Bun + ElysiaJS - HTTP сервер
- PostgreSQL 16 - основная БД
- Drizzle ORM - Schema-as-Code (TypeScript)
- Pino - структурированное логирование
- Native OAuth 2.0 - авторизация через HH.ru (без Passport.js)
- Docker Compose - инфраструктура

**Тестирование:**
- Bun test - встроенный тестовый раннер
- Интеграционные тесты HH.ru API (10 тестов)

**DevOps:**
- bun scripts - автоматизация
- Бэкапы/восстановление через pg_dump

### Планируемый стек (Этап 2: Frontend)

**Frontend:**
- Vue.js 3 + Composition API
- TypeScript
- Pinia (state management)
- Tailwind CSS

**Backend (расширение):**
- Bull/BullMQ (очереди на Redis)

**Deployment:**
- Frontend: Vercel/Netlify
- Backend: Railway/Render
- Database: Railway PostgreSQL

### Будущее масштабирование (Этап 3)

- Kafka (замена Bull/BullMQ)
- Микросервисная архитектура
- Redis (кэширование)
- Prometheus + Grafana (мониторинг)

---

## Database Schema

### Модель данных (Entity-Relationship)

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────┐
│    User     │────────<│    Resume    │────────<│   Application    │
└─────────────┘         └──────────────┘         └──────────────────┘
```

**Связи:**
- User 1:N Resume (один пользователь → много резюме)
- Resume 1:N Application (одно резюме → много откликов)
- User 1:N Application (один пользователь → много откликов)

### Ключевые решения

**1. UUID вместо SERIAL:**
```typescript
id: uuid('id').primaryKey().defaultRandom()
```
- Распределенная система (будущее)
- Безопасность (нельзя угадать ID)
- Возможность генерации ID на клиенте

**2. Cascading deletes:**
```typescript
userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
```
- При удалении пользователя → автоматическое удаление резюме и откликов
- Целостность данных

**3. Timestamps:**
```typescript
createdAt: timestamp('created_at').defaultNow().notNull(),
updatedAt: timestamp('updated_at').defaultNow().notNull()
```
- Аудит изменений
- Аналитика активности

---

## Design Patterns

### Repository Pattern (реализовано)

```typescript
// src/modules/userModule/userRepository.ts
export class UserRepository {
  async findByIdAsync(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  }

  async findByHhUserIdAsync(hhUserId: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.hhUserId, hhUserId));
    return result[0] ?? null;
  }
}
```

### Service Layer (реализовано)

```typescript
// src/modules/authModule/hhClient.ts
export const hhClient = {
  // Публичные методы (без авторизации)
  searchVacancies: async (params: HHVacancySearchParams): Promise<HHVacanciesResponse> => {
    const res = await fetch(`${HH_API}/vacancies?${searchParams}`);
    return res.json();
  },

  // OAuth методы
  getAuthUrl: (state?: string): string => { ... },
  exchangeCode: async (code: string): Promise<HHTokens | HHTokenError> => { ... },
  refreshToken: async (refreshToken: string): Promise<HHTokens | HHTokenError> => { ... },

  // Приватные методы (требуют access_token)
  getMyResumes: async (accessToken: string): Promise<HHResumesResponse> => { ... },
  getMe: async (accessToken: string): Promise<HHUser> => { ... },
};
```

### Event-Driven Processing (планируется: Bull/BullMQ)

```typescript
// Producer
await queue.add('send-application', { resumeId, vacancyId });

// Consumer
queue.process('send-application', async (job) => {
  // Обработка отклика
});
```

---

## Data Flow (Планируемый)

### Сценарий: автоотклик на вакансию

```
1. [Scheduler] → Проверка новых вакансий (каждые 10 мин)
   ↓
2. [HHApiService] → Запрос похожих вакансий с HH.ru API
   ↓
3. [Transformer] → Фильтрация вакансий по критериям
   ↓
4. [Queue: vacancy.check] → Добавление в очередь проверки
   ↓
5. [Worker] → Проверка, не откликались ли ранее
   ↓
6. [Queue: application.send] → Добавление в очередь отправки
   ↓
7. [Worker] → Отправка отклика через HH.ru API
   ↓
8. [Sink: PostgreSQL] → Сохранение отклика в БД
   ↓
9. [Sink: Vue.js UI] → Уведомление пользователя
```

---

## API Design (Реализовано)

### REST Endpoints

**Auth (HH.ru OAuth):**
```
GET    /api/auth/hh/login        # Редирект на HH.ru OAuth
GET    /api/auth/hh/callback     # OAuth callback от HH.ru
POST   /api/auth/hh/refresh      # Обновление токенов
```

**Users:**
```
GET    /api/users                # Список пользователей
GET    /api/users/:id            # Пользователь по ID
POST   /api/users                # Создать пользователя
DELETE /api/users/:id            # Удалить пользователя
```

**Resumes:**
```
GET    /api/resumes              # Список резюме
GET    /api/resumes/:id          # Резюме по ID
GET    /api/resumes/user/:userId # Резюме пользователя
POST   /api/resumes              # Создать резюме
PATCH  /api/resumes/:id/auto-respond  # Вкл/выкл автоотклик
DELETE /api/resumes/:id          # Удалить резюме
```

**Applications:**
```
GET    /api/applications         # Список откликов
GET    /api/applications/:id     # Отклик по ID
POST   /api/applications         # Создать отклик
PATCH  /api/applications/:id/status  # Обновить статус
DELETE /api/applications/:id     # Удалить отклик
```

### WebSocket Events

```
vacancy:new        # Новая вакансия найдена
application:sent   # Отклик отправлен
application:viewed # Работодатель посмотрел отклик
```

---

## Security Considerations

### OAuth 2.0 (HH.ru)

- Authorization Code Flow
- Scopes: `write_negotiations`, `read_resumes`
- Refresh токены (хранятся зашифрованными)

### Rate Limiting

- HH.ru API: 60 requests/minute
- Собственный API: 100 requests/minute
- Queue throttling для защиты от переполнения

### Data Protection

- `.env` файлы не в Git
- OAuth токены зашифрованы
- Пароли через bcrypt (если добавится локальная auth)

---

## Scalability Strategy

### Этап 1: Монолит (MVP)

- 1 NestJS сервер
- 1 PostgreSQL инстанс
- Bull/BullMQ на одном Redis
- Деплой на Render/Railway

**Поддерживает:** ~100 пользователей, ~1000 откликов/день

### Этап 2: Horizontal Scaling

- N NestJS серверов за load balancer
- PostgreSQL replicas (read/write split)
- Redis Cluster
- Деплой на AWS/GCP

**Поддерживает:** ~10K пользователей, ~100K откликов/день

### Этап 3: Microservices

```
├── auth-service       # Аутентификация
├── resume-service     # Управление резюме
├── vacancy-service    # Работа с вакансиями
├── application-service # Отклики
├── notification-service # Уведомления
└── analytics-service  # Аналитика
```

**Поддерживает:** ~100K+ пользователей, миллионы откликов

---

## Testing Strategy (Реализовано)

### Bun Test Runner

- Встроенный в Bun, Jest-совместимый API
- В 10-100 раз быстрее Jest
- Нативная поддержка TypeScript

### Интеграционные тесты (10 тестов)

**Файл:** `tests/hh.api.test.ts`

| Группа | Тесты |
|--------|-------|
| Доступность | API HH.ru отвечает 200 |
| Структура вакансии | Обязательные поля, зарплата, работодатель |
| Поиск | Базовый поиск, фильтрация, пагинация |
| Детали вакансии | Получение по ID, description, key_skills |
| Справочники | Dictionaries (experience, employment) |

### E2E тесты (API endpoints)

**Файлы:** `tests/api.*.test.ts`

- Health check endpoints
- Users API
- Resumes API
- Applications API

### Запуск тестов

```bash
bun test                    # Все тесты
bun test tests/hh.api.test.ts  # Только HH.ru API
bun test --watch            # Watch режим
```

---

## Monitoring & Observability (Будущее)

### Metrics

- Prometheus + Grafana
- Custom metrics: откликов/час, rate limit usage, queue length

### Logging

- Winston/Pino structured logging
- Levels: error, warn, info, debug
- Correlation IDs для трейсинга

### Tracing

- OpenTelemetry
- Distributed tracing в микросервисах

---

## Development Principles

1. **Spec-First Development** - brief.md пишется перед кодом
2. **Schema-as-Code** - TypeScript схема Drizzle как source of truth
3. **Event-Driven** - слабая связанность через очереди
4. **12-Factor App** - конфигурация через environment
5. **Minimal Viable Product** - только необходимый функционал

---

Для детального плана разработки см. [brief.md](./brief.md)
