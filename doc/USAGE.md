# Usage Guide

Руководство по типичным сценариям работы с проектом HH Auto Respond EDA.

## Ежедневная работа

### Начало рабочего дня

```bash
# 1. Поднять БД
bun run db:up

# 2. Открыть Prisma Studio для просмотра данных
bun run studio
```

Откроется http://localhost:5555 с графическим интерфейсом.

### В течение дня

```bash
# Просмотреть данные
bun run studio

# Сделать бэкап перед экспериментами
bun run backup

# Посмотреть логи PostgreSQL
bun run db:logs
```

### Конец рабочего дня

```bash
# Остановить БД (опционально)
bun run db:down
```

---

## Изменение схемы БД

### Workflow

```bash
# 1. Отредактировать prisma/schema.prisma
# Например, добавить поле:
# model Resume {
#   ...
#   skills Json?
# }

# 2. Создать миграцию
bun run migrate

# 3. Проверить изменения через Prisma Studio
bun run studio
```

### Пример: добавление нового поля

**Файл prisma/schema.prisma:**

```prisma
model Resume {
  id                   String    @id @default(uuid()) @db.Uuid
  hh_resume_id         String    @unique @db.VarChar(50)
  title                String    @db.VarChar(200)
  auto_respond_enabled Boolean   @default(false)
  skills               Json?     // ← Новое поле
  user_id              String    @db.Uuid
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt

  user         User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  applications Application[]
}
```

**Применить изменения:**

```bash
npx prisma migrate dev --name add_skills_to_resume
# Создаст: prisma/migrations/TIMESTAMP_add_skills_to_resume/migration.sql
```

---

## Работа с бэкапами

### Создать бэкап

```bash
# Перед экспериментами всегда делайте бэкап!
bun run backup

# Создастся файл: backups/backup_2025-10-31_143052.sql
```

### Посмотреть список бэкапов

```bash
bun run backup:list

# Вывод:
# -rw-r--r--  1 user  staff   45K Oct 31 14:30 backup_2025-10-31_143052.sql
# -rw-r--r--  1 user  staff   44K Oct 30 09:15 backup_2025-10-30_091544.sql
```

### Восстановить из бэкапа

```bash
bun run restore

# Интерактивный выбор:
# ? Select backup to restore (Use arrow keys)
# ❯ backup_2025-10-31_143052.sql
#   backup_2025-10-30_091544.sql
```

---

## Сброс БД к начальному состоянию

### Быстрый сброс

```bash
bun run db:reset

# Это выполнит:
# 1. Остановит БД
# 2. Удалит Docker volume
# 3. Запустит БД
# 4. Применит миграции
# 5. Загрузит seed данные
```

### Полная переустановка

```bash
# 1. Полная очистка
bun run clean

# 2. Установка с нуля
bun run setup
```

---

## Работа с моковыми данными (Seed)

### Что включено в seed

- **2 пользователя:**
  - Иван Петров (telegram_id: 123456789)
  - Мария Сидорова (telegram_id: 987654321)

- **3 резюме:**
  - Frontend Developer (автоотклик включен)
  - Backend Developer (автоотклик включен)
  - Fullstack Developer (автоотклик выключен)

- **5 откликов:**
  - 3 отклика от Ивана
  - 2 отклика от Марии

### Перезагрузить seed данные

```bash
bun run seed
```

### Изменить seed данные

Отредактируйте файл `prisma/seed.js` и запустите:

```bash
bun run seed
```

---

## Подключение к БД через GUI клиенты

### DBeaver

1. Создать новое подключение PostgreSQL
2. Настройки:
   ```
   Host:     localhost
   Port:     5432
   Database: hh_auto_respond_dev
   User:     postgres
   Password: postgres
   ```
3. Test Connection → OK → Finish

### TablePlus

1. Create → PostgreSQL
2. Настройки:
   ```
   Host:     localhost
   Port:     5432
   Database: hh_auto_respond_dev
   User:     postgres
   Password: postgres
   ```
3. Connect

### Prisma Studio (рекомендуется)

```bash
bun run studio
```

Откроется http://localhost:5555

**Преимущества:**
- Графический интерфейс
- Редактирование данных
- Автоматическая связь между таблицами
- Не требует установки

---

## Troubleshooting

### БД не запускается

**Проблема:** `Cannot connect to database`

**Решение:**

```bash
# 1. Проверить статус контейнера
bun run db:status

# 2. Посмотреть логи
bun run db:logs

# 3. Перезапустить
bun run db:down
bun run db:up
```

### Порт 5432 занят

**Проблема:** `Port 5432 is already allocated`

**Решение:**

```bash
# Найти процесс на порту 5432
lsof -i :5432

# Остановить существующий PostgreSQL
brew services stop postgresql

# Или изменить порт в .env:
# POSTGRES_PORT=5433
```

### Ошибка миграции

**Проблема:** `Migration failed`

**Решение:**

```bash
# 1. Сбросить БД
bun run db:reset

# 2. Если не помогло - полная переустановка
bun run clean
bun run setup
```

### Данные не обновляются в Prisma Studio

**Решение:**

```bash
# Обновить страницу в браузере (F5)
# Или перезапустить Prisma Studio:
# Ctrl+C
bun run studio
```

---

## Best Practices

### Перед экспериментами

```bash
# Всегда делайте бэкап!
bun run backup
```

### После изменения schema.prisma

```bash
# 1. Создать миграцию
bun run migrate

# 2. Проверить в Prisma Studio
bun run studio
```

### Регулярные бэкапы

```bash
# Создавайте бэкапы перед важными изменениями
bun run backup

# Удаляйте старые бэкапы (хранить 3-5 последних)
ls -lt backups/
rm backups/backup_OLD_TIMESTAMP.sql
```

### Работа в команде

```bash
# После git pull с новыми миграциями:
bun run migrate

# Проверить актуальность схемы:
npx prisma validate
```

---

## Полезные SQL запросы

### Статистика по пользователям

```sql
SELECT
  u.full_name,
  COUNT(DISTINCT r.id) as resumes_count,
  COUNT(DISTINCT a.id) as applications_count
FROM users u
LEFT JOIN resumes r ON u.id = r.user_id
LEFT JOIN applications a ON u.id = a.user_id
GROUP BY u.id, u.full_name;
```

### Резюме с автооткликами

```sql
SELECT
  r.title,
  r.auto_respond_enabled,
  u.full_name as owner,
  COUNT(a.id) as applications_count
FROM resumes r
JOIN users u ON r.user_id = u.id
LEFT JOIN applications a ON r.id = a.resume_id
GROUP BY r.id, r.title, r.auto_respond_enabled, u.full_name
ORDER BY applications_count DESC;
```

### Активность по дням

```sql
SELECT
  DATE(applied_at) as date,
  COUNT(*) as applications_count
FROM applications
GROUP BY DATE(applied_at)
ORDER BY date DESC;
```

Запускайте через:
- Prisma Studio (вкладка "Query")
- DBeaver / TablePlus
- `docker exec -it hh-auto-respond-postgres psql -U postgres -d hh_auto_respond_dev`
