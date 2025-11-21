# Commands Reference

Полный справочник npm команд для проекта HH Auto Respond EDA.

## База данных

| Команда | Описание |
|---------|----------|
| `bun run db:up` | Поднять PostgreSQL в Docker |
| `bun run db:down` | Остановить PostgreSQL |
| `bun run db:logs` | Показать логи PostgreSQL |
| `bun run db:status` | Статус контейнера |
| `bun run db:reset` | Полный сброс БД (удалить → создать → миграции → seed) |

### Примеры использования

```bash
# Запустить БД
bun run db:up

# Проверить статус
bun run db:status

# Посмотреть логи в реальном времени
bun run db:logs

# Остановить БД
bun run db:down
```

---

## Drizzle ORM

| Команда | Описание |
|---------|----------|
| `bun run db:generate` | Сгенерировать SQL миграции из TypeScript схемы |
| `bun run db:migrate` | Применить миграции к базе данных |
| `bun run db:push` | Синхронизировать схему с БД (для разработки) |
| `bun run db:studio` | Открыть Drizzle Studio (GUI для БД) |
| `bun run seed` | Загрузить моковые данные |

### Примеры использования

```bash
# Сгенерировать миграции после изменения схемы в src/db/schema/
bun run db:generate

# Применить миграции к БД
bun run db:migrate

# Быстрая синхронизация схемы (для разработки)
bun run db:push

# Открыть графический интерфейс БД
bun run db:studio

# Перезагрузить seed данные
bun run seed
```

---

## Бэкапы

| Команда | Описание |
|---------|----------|
| `bun run backup` | Создать бэкап БД → `backups/backup_TIMESTAMP.sql` |
| `bun run restore` | Восстановить БД из бэкапа (интерактивный выбор) |
| `bun run backup:list` | Список всех бэкапов |

### Примеры использования

```bash
# Создать бэкап перед экспериментами
bun run backup

# Посмотреть все доступные бэкапы
bun run backup:list

# Восстановить из бэкапа (выберете файл из списка)
bun run restore
```

---

## Утилиты

| Команда | Описание |
|---------|----------|
| `bun run setup` | Полная установка (зависимости + БД + миграции + seed) |
| `bun run clean` | Полная очистка (удалить БД, volumes, node_modules, миграции) |

### Примеры использования

```bash
# Первый запуск проекта после клонирования
bun run setup

# Полная очистка проекта (для переустановки с нуля)
bun run clean
```

---

## Типичные команды для разработки

### Ежедневная работа

```bash
# 1. Поднять БД
bun run db:up

# 2. Открыть Drizzle Studio
bun run db:studio

# 3. (Работа с кодом...)

# 4. Остановить БД в конце дня
bun run db:down
```

### Изменение схемы БД

```bash
# 1. Отредактировать файлы в src/db/schema/

# 2. Сгенерировать SQL миграцию
bun run db:generate

# 3. Применить миграцию
bun run db:migrate

# 4. Проверить в Drizzle Studio
bun run db:studio
```

### Работа с бэкапами

```bash
# Перед экспериментами
bun run backup

# Если что-то пошло не так
bun run restore
```

### Полный сброс

```bash
# Сбросить БД к начальному состоянию
bun run db:reset

# Или полная очистка + переустановка
bun run clean
bun run setup
```

---

## Docker команды (прямые)

Если нужно работать напрямую с Docker:

```bash
# Логи PostgreSQL
docker logs -f hh-auto-respond-postgres

# Статус контейнера
docker ps --filter name=hh-auto-respond-postgres

# Подключиться к PostgreSQL CLI
docker exec -it hh-auto-respond-postgres psql -U postgres -d hh_auto_respond_dev

# Остановить и удалить всё
docker-compose -f docker/docker-compose.yml down -v
```

---

## Drizzle Kit CLI (прямые команды)

Если нужно работать напрямую с Drizzle Kit CLI:

```bash
# Сгенерировать миграции
bunx drizzle-kit generate

# Применить миграции
bunx drizzle-kit migrate

# Синхронизировать схему (для разработки)
bunx drizzle-kit push

# Открыть Drizzle Studio
bunx drizzle-kit studio

# Проверить схему
bunx drizzle-kit check

# Удалить таблицы (осторожно!)
bunx drizzle-kit drop
```

---

## Переменные окружения

Команды используют переменные из `.env` файла:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hh_auto_respond_dev"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hh_auto_respond_dev
POSTGRES_PORT=5432
```

Перед первым запуском:

```bash
cp .env.example .env
```
