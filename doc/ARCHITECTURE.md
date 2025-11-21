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
│   ├── db/
│   │   ├── schema/              # TypeScript схемы БД
│   │   │   ├── users.ts         # User table schema
│   │   │   ├── resumes.ts       # Resume table schema
│   │   │   ├── applications.ts  # Application table schema
│   │   │   ├── relations.ts     # Relations between tables
│   │   │   └── index.ts         # Schema exports
│   │   ├── migrations/          # SQL миграции (генерируются автоматически)
│   │   ├── client.ts            # Drizzle client singleton
│   │   └── seed.ts              # Моковые данные (3 пользователя, 3 резюме, 5 откликов)
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

### Текущий статус (Этап 0: Database Layer)

**Backend:**
- PostgreSQL 16 - основная БД
- Drizzle ORM - Schema-as-Code (TypeScript)
- Docker Compose - инфраструктура

**DevOps:**
- bun scripts - автоматизация
- Бэкапы/восстановление через pg_dump

### Планируемый стек (Этап 1: MVP)

**Frontend:**
- Vue.js 3 + Composition API
- TypeScript
- Pinia (state management)
- Tailwind CSS

**Backend:**
- ElysiaJS + Bun + TypeScript
- Drizzle ORM
- Passport.js (OAuth HH.ru)
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

### Repository Pattern (планируется)

```typescript
// Абстракция доступа к данным
interface UserRepository {
  findById(id: string): Promise<User>
  findByTelegramId(telegramId: number): Promise<User>
  create(data: CreateUserDto): Promise<User>
  update(id: string, data: UpdateUserDto): Promise<User>
}
```

### Dependency Injection (NestJS)

```typescript
@Injectable()
export class ApplicationService {
  constructor(
    private db: DrizzleDatabase,
    private hhApi: HHApiService,
    @InjectQueue('application.send') private queue: Queue,
  ) {}
}
```

### Event-Driven Processing (Bull/BullMQ)

```typescript
// Producer
await this.queue.add('send-application', {
  resumeId,
  vacancyId,
})

// Consumer
@Process('send-application')
async handleApplication(job: Job) {
  // Обработка отклика
}
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

## API Design (Планируемое)

### REST Endpoints

```
POST   /api/auth/hh/callback     # OAuth callback HH.ru
GET    /api/resumes               # Список резюме пользователя
PATCH  /api/resumes/:id           # Включить/выключить автоотклик
GET    /api/applications          # История откликов
GET    /api/stats                 # Статистика пользователя
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

## Testing Strategy (Планируется)

### Unit Tests (Vitest)

- Services: бизнес-логика
- Transformers: фильтрация вакансий
- Utilities: вспомогательные функции

### Integration Tests

- API endpoints (Supertest)
- Database queries (Drizzle ORM)
- Queue processing (Bull/BullMQ)

### E2E Tests

- User flows: auth → настройка → автоотклик
- OAuth flow с HH.ru

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
