# Installation Guide

Детальное руководство по установке и настройке проекта HH Auto Respond EDA.

## Требования

### Обязательные

- **Docker Desktop** 4.0+ (для PostgreSQL)
- **Bun** 1.0+ ([установка](https://bun.sh/docs/installation))
- **Git** 2.30+

### Опциональные

- **DBeaver** или **TablePlus** (GUI для БД)
- **Postman** (для тестирования API в будущем)

---

## Быстрая установка

### Для опытных пользователей

```bash
# 1. Клонировать репозиторий
git clone https://github.com/litury/hh-auto-respond-eda.git
cd hh-auto-respond-eda

# 2. Скопировать переменные окружения
cp .env.example .env

# 3. Запустить всё
bun run setup

# 4. Открыть Prisma Studio
bun run studio
```

Откроется http://localhost:5555 с GUI для работы с БД.

---

## Детальная установка

### Шаг 1: Клонировать репозиторий

```bash
# HTTPS
git clone https://github.com/litury/hh-auto-respond-eda.git

# или SSH
git clone git@github.com:litury/hh-auto-respond-eda.git

# Перейти в директорию
cd hh-auto-respond-eda
```

### Шаг 2: Установить зависимости

```bash
bun install
```

**Что устанавливается:**
- `@prisma/client` - Prisma ORM клиент
- `prisma` - Prisma CLI (dev dependency)

### Шаг 3: Настроить переменные окружения

```bash
# Скопировать пример
cp .env.example .env

# Отредактировать (опционально)
nano .env
```

**Содержимое .env:**

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hh_auto_respond_dev"

# PostgreSQL settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hh_auto_respond_dev
POSTGRES_PORT=5432
```

**Примечание:** Для разработки можно оставить значения по умолчанию.

### Шаг 4: Запустить PostgreSQL в Docker

```bash
bun run db:up
```

**Что происходит:**
```bash
docker-compose -f docker/docker-compose.yml up -d
```

**Проверка:**
```bash
bun run db:status
# Вывод: hh-auto-respond-postgres  Up
```

### Шаг 5: Применить миграции

```bash
bun run migrate
```

**Что происходит:**
- Prisma создаст таблицы в БД
- Применит миграцию `20251031092934_initial`
- Сгенерирует Prisma Client

**Проверка:**
```bash
docker exec -it hh-auto-respond-postgres psql -U postgres -d hh_auto_respond_dev -c "\dt"
# Должны появиться таблицы: users, resumes, applications
```

### Шаг 6: Загрузить моковые данные

```bash
bun run seed
```

**Что загружается:**
- 2 пользователя (Иван Петров, Мария Сидорова)
- 3 резюме (Frontend, Backend, Fullstack)
- 5 откликов на вакансии

**Проверка:**
```bash
bun run studio
```

Откроется http://localhost:5555 — проверьте, что данные загружены.

---

## Проверка установки

### Проверка 1: Docker контейнер

```bash
docker ps | grep hh-auto-respond-postgres
```

**Ожидаемый вывод:**
```
hh-auto-respond-postgres  postgres:16-alpine  Up 2 minutes  5432->5432/tcp
```

### Проверка 2: База данных

```bash
bun run db:status
```

**Ожидаемый вывод:**
```
CONTAINER ID   NAME                      STATUS
abc123def456   hh-auto-respond-postgres  Up 2 minutes
```

### Проверка 3: Таблицы созданы

```bash
docker exec -it hh-auto-respond-postgres psql -U postgres -d hh_auto_respond_dev -c "\dt"
```

**Ожидаемый вывод:**
```
 Schema |      Name      | Type  |  Owner
--------+----------------+-------+----------
 public | applications   | table | postgres
 public | resumes        | table | postgres
 public | users          | table | postgres
```

### Проверка 4: Seed данные

```bash
docker exec -it hh-auto-respond-postgres psql -U postgres -d hh_auto_respond_dev -c "SELECT COUNT(*) FROM users;"
```

**Ожидаемый вывод:**
```
 count
-------
     2
```

### Проверка 5: Prisma Studio

```bash
bun run studio
```

Откройте http://localhost:5555 и убедитесь, что:
- Видны 3 таблицы (users, resumes, applications)
- В таблице users есть 2 записи
- В таблице resumes есть 3 записи
- В таблице applications есть 5 записей

---

## Что включено

После установки у вас будет:

- ✅ PostgreSQL 16 в Docker контейнере
- ✅ Prisma ORM (схема + миграции)
- ✅ Моковые данные (2 пользователя, 3 резюме, 5 откликов)
- ✅ Prisma Studio (GUI для БД)
- ✅ Скрипты бэкапа/восстановления
- ✅ Команды для управления проектом

---

## Troubleshooting

### Ошибка: Docker не запущен

**Проблема:**
```
Error: Cannot connect to the Docker daemon
```

**Решение:**
```bash
# Запустить Docker Desktop
open -a Docker

# Подождать 30 секунд, затем повторить
bun run db:up
```

### Ошибка: Порт 5432 занят

**Проблема:**
```
Error: Port 5432 is already allocated
```

**Решение:**

```bash
# Найти процесс на порту 5432
lsof -i :5432

# Вариант 1: Остановить локальный PostgreSQL
brew services stop postgresql

# Вариант 2: Изменить порт в .env
# POSTGRES_PORT=5433
# Затем в DATABASE_URL тоже изменить на :5433
```

### Ошибка: bun install fails

**Проблема:**
```
Error: Cannot find module '@prisma/client'
```

**Решение:**
```bash
# Очистить Bun cache
bun pm cache rm

# Удалить node_modules и lockfile
rm -rf node_modules bun.lockb

# Переустановить
bun install
```

### Ошибка: Миграции не применяются

**Проблема:**
```
Error: Can't reach database server
```

**Решение:**
```bash
# 1. Проверить, что БД запущена
bun run db:status

# 2. Проверить .env
cat .env | grep DATABASE_URL

# 3. Перезапустить БД
bun run db:down
bun run db:up
sleep 3
bun run migrate
```

### Ошибка: Seed не загружается

**Проблема:**
```
Error: P2002: Unique constraint failed
```

**Решение:**
```bash
# Данные уже загружены, сбросить БД
bun run db:reset
```

---

## Полная переустановка

Если что-то пошло не так:

```bash
# 1. Остановить и удалить всё
bun run clean

# 2. Установить заново
bun run setup

# 3. Проверить
bun run studio
```

**Внимание:** Это удалит:
- Docker контейнер
- Docker volume с данными
- node_modules и bun.lockb
- Prisma миграции (будут пересозданы)

---

## Следующие шаги

После успешной установки:

1. **Изучите документацию:**
   - [Commands Reference](./COMMANDS.md) - все команды проекта
   - [Database Guide](./DATABASE.md) - работа с БД
   - [Usage Guide](./USAGE.md) - типичные сценарии

2. **Попробуйте основные команды:**
   ```bash
   bun run studio    # Открыть GUI для БД
   bun run backup    # Создать бэкап
   bun run db:logs   # Посмотреть логи
   ```

3. **Изучите схему БД:**
   - Откройте `prisma/schema.prisma`
   - Посмотрите модели User, Resume, Application
   - Изучите связи между таблицами

4. **Прочитайте roadmap:**
   - Откройте [doc/brief.md](./brief.md)
   - Узнайте о планируемых этапах разработки

---

## Альтернативная установка (без bun run setup)

Если предпочитаете ручной контроль:

```bash
# 1. Клонировать
git clone https://github.com/litury/hh-auto-respond-eda.git
cd hh-auto-respond-eda

# 2. Установить зависимости
bun install

# 3. Настроить .env
cp .env.example .env

# 4. Запустить PostgreSQL
bun run db:up

# 5. Подождать 3 секунды
sleep 3

# 6. Применить миграции
bun run migrate

# 7. Загрузить seed данные
bun run seed

# 8. Открыть Prisma Studio
bun run studio
```

---

## Для разработчиков на Windows

### Требования Windows

- **Docker Desktop for Windows** (WSL2 backend)
- **Bun** 1.0+ ([установка для Windows](https://bun.sh/docs/installation#windows))
- **Git for Windows**

### Особенности

1. Используйте PowerShell или Git Bash
2. Замените `cp` на `copy`:
   ```powershell
   copy .env.example .env
   ```
3. Замените `rm -rf` на `Remove-Item`:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   ```

### Быстрая установка (PowerShell)

```powershell
git clone https://github.com/litury/hh-auto-respond-eda.git
cd hh-auto-respond-eda
copy .env.example .env
bun run setup
bun run studio
```

---

## Обновление проекта

После `git pull` с новыми изменениями:

```bash
# 1. Обновить зависимости (если изменился package.json)
bun install

# 2. Применить новые миграции (если изменилась схема)
bun run migrate

# 3. Проверить всё работает
bun run studio
```

---

Если возникли проблемы, не описанные в этом руководстве:
- Создайте issue: https://github.com/litury/hh-auto-respond-eda/issues
- Или напишите в Telegram: [@divatoz](https://t.me/divatoz)
