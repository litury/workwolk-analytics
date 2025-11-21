# Database Guide

Руководство по работе с базой данных PostgreSQL и Drizzle ORM в проекте HH Auto Respond EDA.

## Схема базы данных

### Таблица `users` — пользователи с OAuth HH.ru

| Поле | Тип | Описание | Обязательность |
|------|-----|----------|----------------|
| id | UUID | Первичный ключ | **Required** |
| hh_user_id | VARCHAR | HH.ru User ID (уникальный) | **Required** ⭐ |
| email | VARCHAR | Email пользователя | Optional |
| full_name | VARCHAR | Полное имя | Optional |
| access_token | TEXT | OAuth access token HH.ru | Optional |
| refresh_token | TEXT | OAuth refresh token | Optional |
| token_expiry | TIMESTAMP | Срок действия токена | Optional |
| telegram_id | BIGINT | Telegram ID для будущей интеграции | Optional 🔜 |
| created_at | TIMESTAMP | Дата создания | **Required** |
| updated_at | TIMESTAMP | Дата обновления | **Required** |

**⭐ Primary Identifier:** `hh_user_id` - основной идентификатор пользователя (HH.ru OAuth)
**🔜 Future Feature:** `telegram_id` - опциональный, для будущей Telegram Mini App интеграции

### Таблица `resumes` — резюме из HH.ru

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| hh_resume_id | VARCHAR | HH.ru Resume ID (уникальный) |
| title | VARCHAR | Название резюме |
| auto_respond_enabled | BOOLEAN | Включены ли автоотклики |
| user_id | UUID | Foreign Key → users.id |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

### Таблица `applications` — отправленные отклики

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| resume_id | UUID | Foreign Key → resumes.id |
| vacancy_id | VARCHAR | HH.ru Vacancy ID |
| vacancy_title | VARCHAR | Название вакансии |
| user_id | UUID | Foreign Key → users.id |
| status | VARCHAR | Статус (sent/viewed/invited/rejected/error) |
| applied_at | TIMESTAMP | Дата отклика |

---

## Подключение к БД

### Через DBeaver/TablePlus

```
Host:     localhost
Port:     5432
Database: hh_auto_respond_dev
User:     postgres
Password: postgres
```

### Через Drizzle Studio

```bash
bun run db:studio
```

Откроется графический интерфейс для просмотра и редактирования данных.

---

## SQL Примеры

### Все пользователи с количеством откликов

```sql
SELECT
  u.id,
  u.full_name,
  u.email,
  COUNT(a.id) as applications_count
FROM users u
LEFT JOIN applications a ON u.id = a.user_id
GROUP BY u.id;
```

### Резюме с включенными автооткликами

```sql
SELECT * FROM resumes WHERE auto_respond_enabled = true;
```

### Отклики за последние 24 часа

```sql
SELECT
  a.*,
  r.title as resume_title,
  u.full_name as user_name
FROM applications a
JOIN resumes r ON a.resume_id = r.id
JOIN users u ON a.user_id = u.id
WHERE a.applied_at > NOW() - INTERVAL '24 hours'
ORDER BY a.applied_at DESC;
```

---

## Работа с миграциями

### Создать новую миграцию

1. Отредактировать схему в `src/db/schema/`
2. Сгенерировать SQL миграцию:

```bash
bun run db:generate
```

Это создаст SQL файл в `src/db/migrations/`

### Применить миграции

```bash
bun run db:migrate
```

### Push схему в БД (для разработки)

Быстрый способ синхронизировать схему с БД без создания миграции:

```bash
bun run db:push
```

⚠️ **Внимание:** `db:push` перезапишет БД! Для production используйте `db:migrate`.

### Пример: добавить поле

```typescript
// src/db/schema/resumes.ts
export const resumes = pgTable('resumes', {
  // ... существующие поля
  skills: text('skills'), // ← добавили новое поле
});
```

```bash
bun run db:generate  # Создаст миграцию
bun run db:migrate   # Применит к БД
```

---

## Моковые данные (Seed)

### Что включено

- 3 пользователя (2 с Telegram ID, 1 без)
- 3 резюме (2 с включенными автооткликами)
- 5 откликов на вакансии

### Загрузить seed данные

```bash
bun run seed
```

### Полный сброс БД с seed

```bash
bun run db:reset
```

Это выполнит:
1. Остановку Docker контейнера
2. Удаление volume
3. Запуск контейнера
4. Применение миграций
5. Загрузку seed данных

---

## Бэкапы

### Создать бэкап

```bash
bun run backup
# Создаст: backups/backup_TIMESTAMP.sql
```

### Восстановить из бэкапа

```bash
bun run restore
# Интерактивный выбор файла
```

### Список бэкапов

```bash
bun run backup:list
```

---

## Drizzle ORM Примеры

### Простые queries

```typescript
import { db } from './db/client';
import { users, resumes } from './db/schema';
import { eq } from 'drizzle-orm';

// SELECT
const allUsers = await db.select().from(users);

// WHERE
const user = await db.select().from(users).where(eq(users.id, userId));

// INSERT
const [newUser] = await db.insert(users).values({
  hhUserId: 'hh_123',
  email: 'user@example.com'
}).returning();

// UPDATE
await db.update(users)
  .set({ fullName: 'New Name' })
  .where(eq(users.id, userId));

// DELETE
await db.delete(users).where(eq(users.id, userId));
```

### Relational Queries (с JOIN)

```typescript
// Пользователь со всеми резюме и откликами
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    resumes: true,
    applications: true
  }
});
```

---

## Troubleshooting

### БД не запускается

```bash
# Проверить статус контейнера
bun run db:status

# Посмотреть логи
bun run db:logs

# Перезапустить
bun run db:down
bun run db:up
```

### Ошибка подключения Drizzle

```bash
# Убедитесь, что БД запущена
docker ps | grep hh-auto-respond-postgres

# Проверьте .env
cat .env | grep DATABASE_URL
```

### Сбросить всё к начальному состоянию

```bash
bun run db:reset
```

---

## Полезные ссылки

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
