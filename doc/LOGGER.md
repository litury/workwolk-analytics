# Logger (Pino)

Проект использует **Pino** - быстрый structured logger для Node.js/Bun.

## Зачем нужен логер?

- Отслеживание работы приложения в production
- Диагностика проблем и ошибок
- Мониторинг производительности операций
- Structured logging для удобного парсинга

## Установка

Pino уже установлен в проекте:

```json
{
  "dependencies": {
    "pino": "^9.x.x"
  },
  "devDependencies": {
    "pino-pretty": "^11.x.x"
  }
}
```

- **pino** - сам логер
- **pino-pretty** - красивый вывод для development

## Использование

### Базовое использование

```typescript
import { createLogger } from './utils/logger';

const log = createLogger('UserService');

log.info('User created', { userId: '123', email: 'user@example.com' });
// Вывод: [UserService] | +0ms | User created {"userId":"123","email":"user@example.com"}

log.error('Failed to create user', new Error('Database error'));
// Вывод с полным stack trace ошибки

log.warn('Slow query detected', { queryTime: 5000 });
```

### Уровни логирования

```typescript
log.trace('Very detailed debug info');  // Только в dev
log.debug('Debug information');
log.info('Normal operation');
log.warn('Warning message');
log.error('Error message', error);
log.fatal('Fatal error', error);        // Критическая ошибка
```

### Operation Tracking

Для отслеживания длительности операций:

```typescript
const startTime = Date.now();

log.operationStart('ProcessVacancy', {
  vacancyId: 'vacancy-123'
});

// ... выполнение операции ...

log.operationEnd('ProcessVacancy', startTime, {
  vacancyId: 'vacancy-123',
  result: 'success'
});
```

Вывод:
```
[UserService] | +100ms | ProcessVacancy started {"operation":"ProcessVacancy","status":"IN_PROGRESS","vacancyId":"vacancy-123"}
[UserService] | +250ms | ProcessVacancy completed {"operation":"ProcessVacancy","status":"COMPLETED","duration":"150ms","vacancyId":"vacancy-123","result":"success"}
```

## Примеры из проекта

### Repository (userRepository.ts)

```typescript
import { createLogger } from '../../utils/logger';

const log = createLogger('UserRepository');

async findById(id: string) {
  log.info('Finding user by ID', { id });

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    log.warn('User not found', { id });
  }

  return user;
}
```

### Service (userService.ts)

```typescript
import { createLogger } from '../../utils/logger';

const log = createLogger('UserService');

async createUser(data) {
  const startTime = Date.now();

  log.operationStart('CreateUser', { email: data.email });

  try {
    const user = await userRepository.create(data);

    log.operationEnd('CreateUser', startTime, {
      userId: user.id,
      result: 'success'
    });

    return user;
  } catch (error) {
    log.error('Failed to create user', error as Error, {
      email: data.email
    });
    throw error;
  }
}
```

### Routes (userRoutes.ts)

```typescript
import { createLogger } from '../../utils/logger';

const log = createLogger('UserRoutes');

.get('/api/users/:id', async ({ params, set }) => {
  log.info('GET /api/users/:id', { id: params.id });

  try {
    const user = await userService.getUserById(params.id);
    return { success: true, data: user };
  } catch (error) {
    log.error('Route error', error as Error, { route: '/api/users/:id' });
    set.status = 500;
    return { success: false, error: 'Internal server error' };
  }
});
```

## Конфигурация

### Development Mode

В `NODE_ENV=development` логи выводятся с красивым форматированием через `pino-pretty`:

```
[UserService] | +123ms | User created {"userId":"abc-123"}
```

### Production Mode

В `NODE_ENV=production` логи выводятся как JSON для парсинга:

```json
{"level":30,"time":1699999999999,"name":"UserService","msg":"User created","userId":"abc-123"}
```

## Настройка в logger.ts

```typescript
export function createLogger(scope: string) {
  const isDev = process.env.NODE_ENV !== 'production';

  const logger = pino({
    level: isDev ? 'trace' : 'info',
    transport: isDev ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname'
      }
    } : undefined
  });

  // ... operation tracking methods ...
}
```

## Best Practices

### ✅ Хорошо

```typescript
// Structured logging с контекстом
log.info('User logged in', {
  userId: user.id,
  method: 'OAuth'
});

// Логирование ошибок с объектом Error
log.error('Database query failed', error, {
  query: 'SELECT * FROM users'
});

// Operation tracking для slow операций
const startTime = Date.now();
await slowOperation();
log.operationEnd('SlowOperation', startTime);
```

### ❌ Плохо

```typescript
// Просто строка без контекста
log.info('User logged in');

// Логирование error.message вместо объекта
log.error('Error: ' + error.message);

// Логирование sensitive данных
log.info('User password', { password: user.password }); // НЕ ДЕЛАЙТЕ ТАК!
```

## Тестирование

См. [tests/utils.logger.test.ts](../tests/utils.logger.test.ts) для примеров тестов.

## Полезные ссылки

- [Pino Documentation](https://github.com/pinojs/pino)
- [Pino Pretty](https://github.com/pinojs/pino-pretty)
- [Best Practices for Logging](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/)
