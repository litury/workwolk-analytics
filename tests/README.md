# Testing Guide

Этот проект использует встроенный тестовый раннер Bun для быстрого и эффективного тестирования.

## Структура тестов

```
tests/
├── api.health.test.ts       # Health check endpoints
├── api.users.test.ts        # Users API endpoints
├── api.resumes.test.ts      # Resumes API endpoints
├── api.applications.test.ts # Applications API endpoints
├── utils.logger.test.ts     # Logger utility tests
└── README.md                # Эта документация
```

**Best Practice:** Тесты разделены по доменам/функциональности для лучшей организации и масштабируемости.

## Типы тестов

### E2E Tests (End-to-End тесты)
- **Файлы**: `tests/api.test.ts`
- **Цель**: Тестируют полные сценарии работы API
- **Моки**: Нет моков, тестируем реальное приложение
- **Скорость**: Быстрые (Bun очень быстрый)

## Запуск тестов

```bash
# Запустить все тесты
bun test

# Запустить тесты в watch режиме
bun test --watch
```

## Примеры тестов

### E2E тест API endpoint (api.users.test.ts)

```typescript
import { describe, test, expect } from 'bun:test';

const API_URL = 'http://localhost:3000';

describe('Users API', () => {
  test('GET /api/users должен вернуть список пользователей', async () => {
    const response = await fetch(`${API_URL}/api/users`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

### E2E тест logger (utils.logger.test.ts)

```typescript
import { describe, test, expect } from 'bun:test';
import { createLogger } from '../src/utils/logger';

describe('Logger', () => {
  test('createLogger работает без ошибок', () => {
    const log = createLogger('TestLogger');

    expect(() => log.info('Test message')).not.toThrow();
    expect(() => log.error('Test error', new Error('Test'))).not.toThrow();
  });
});
```

## Текущее состояние

✅ **Работает:**
- E2E тесты API endpoints (Users, Resumes, Applications)
- E2E тесты logger
- Health check тесты
- Bun test runner настроен
- TypeScript типы настроены

## Полезные ссылки

- [Bun Test Runner Documentation](https://bun.sh/docs/cli/test)
- [Bun Test Matchers](https://bun.sh/docs/test/writing#matchers)

## FAQ

### Почему Bun вместо Jest?

- **Скорость**: Bun в 10-100 раз быстрее Jest
- **TypeScript**: Нативная поддержка без транспиляции
- **Простота**: Меньше зависимостей и конфигурации
- **Совместимость**: Jest-совместимый API

### Как писать новые тесты?

1. **Создайте новый файл** в `tests/` следуя паттерну именования:
   - API тесты: `api.<resource>.test.ts` (например, `api.users.test.ts`)
   - Utility тесты: `utils.<name>.test.ts` (например, `utils.logger.test.ts`)

2. **Используйте** `describe`, `test`, `expect` из `bun:test`

3. **Для API тестов** используйте `fetch()` к запущенному серверу (`http://localhost:3000`)

4. **Запустите** `bun test` для проверки всех тестов

**Пример создания нового теста:**

```bash
# Создать файл tests/api.vacancies.test.ts
cat > tests/api.vacancies.test.ts << 'EOF'
import { describe, test, expect } from 'bun:test';

const API_URL = 'http://localhost:3000';

describe('Vacancies API', () => {
  test('GET /api/vacancies должен работать', async () => {
    const response = await fetch(`${API_URL}/api/vacancies`);
    expect(response.status).toBe(200);
  });
});
EOF

# Запустить тесты
bun test
```

### Нужно ли коммитить тесты?

Да! Тесты - это часть кодовой базы. Они документируют поведение и защищают от регрессий.

---

**Статус**: ✅ Работает
**Последнее обновление**: 2025-11-15
