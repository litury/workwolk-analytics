# TypeScript Configuration

Проект использует TypeScript с strict mode для максимальной type safety.

## Зачем TypeScript?

- **Type Safety**: Ловим ошибки на этапе разработки, а не в production
- **Автодополнение**: IDE подсказывает методы и свойства
- **Рефакторинг**: Безопасное переименование и изменение кода
- **Документация**: Типы служат живой документацией API

## Конфигурация

Проект использует `tsconfig.json` с настройками для Bun:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "types": ["bun-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules"]
}
```

### Ключевые настройки

#### `"target": "ESNext"`
- Компилируем в самый современный JavaScript
- Bun поддерживает все современные возможности

#### `"moduleResolution": "bundler"`
- Используем разрешение модулей для bundler'ов (Bun, Vite, esbuild)
- Поддержка расширений `.ts` без явного указания

#### `"types": ["bun-types"]`
- Типы для Bun runtime API
- Поддержка `bun:test`, `Bun.file()`, и других Bun API

#### `"strict": true"`
- **Включает все strict checks:**
  - `strictNullChecks` - null и undefined проверяются строго
  - `strictFunctionTypes` - строгая проверка типов функций
  - `strictBindCallApply` - строгая проверка bind/call/apply
  - `noImplicitAny` - нельзя использовать `any` неявно
  - `noImplicitThis` - `this` должен иметь явный тип

## Strict Mode в действии

### ✅ Хорошо

```typescript
// Явные типы
function getUserById(id: string): Promise<User | null> {
  return userRepository.findById(id);
}

// Проверка на null
const user = await getUserById('123');
if (!user) {
  throw new Error('User not found');
}
console.log(user.name); // OK, проверили на null

// Типизированные параметры
async function createUser(data: {
  hhUserId: string;
  email?: string;
  fullName?: string;
}) {
  return await userRepository.create(data);
}
```

### ❌ Плохо

```typescript
// Implicit any (ошибка при strict: true)
function processData(data) { // Error: Parameter 'data' implicitly has an 'any' type
  return data.value;
}

// Нет проверки на null
const user = await getUserById('123');
console.log(user.name); // Error: Object is possibly 'null'

// Неявный any в catch
try {
  await doSomething();
} catch (error) { // Error: Catch clause variable type annotation must be 'any' or 'unknown'
  console.log(error.message);
}
```

## Примеры из проекта

### Repository с типами

```typescript
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        resumes: true,
        applications: true
      }
    });
  }

  async create(data: {
    hhUserId: string;
    email?: string;
    fullName?: string;
    telegramId?: bigint;
  }): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }
}
```

### Service с обработкой null

```typescript
export class UserService {
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error('User not found'); // Обязательная проверка
    }

    return user; // Теперь TypeScript знает что user не null
  }

  async getUserByHhUserId(hhUserId: string): Promise<User | null> {
    return await userRepository.findByHhUserId(hhUserId);
  }
}
```

### Routes с типизированными параметрами

```typescript
import { Elysia, t } from 'elysia';

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .post('/', async ({ body }) => {
    const user = await userService.upsertUser({
      hhUserId: body.hhUserId,  // TypeScript проверит типы
      email: body.email,
      fullName: body.fullName
    });

    return { success: true, data: user };
  }, {
    body: t.Object({
      hhUserId: t.String(),
      email: t.Optional(t.String()),
      fullName: t.Optional(t.String())
    })
  });
```

## Работа с Drizzle ORM

Drizzle генерирует типы автоматически из TypeScript схемы:

```typescript
import { User, Resume, Application } from '../db/schema';

// Типы выводятся из схемы через $inferSelect
const user: User = await db.query.users.findFirst(...);

// Типы для relations (with)
type UserWithResumes = User & {
  resumes: Resume[];
};

const user: UserWithResumes = await db.query.users.findFirst({
  where: eq(users.id, id),
  with: { resumes: true }
});
```

## Типы для Bun Test

```typescript
import { describe, test, expect } from 'bun:test';

describe('Users API', () => {
  test('should return users', async () => {
    const response = await fetch('http://localhost:3000/api/users');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## IDE Setup

### VS Code

Расширения:
- **TypeScript and JavaScript Language Features** (встроено)
- **Bun for Visual Studio Code** - поддержка Bun
- **ESLint** - линтинг кода

Настройки (`.vscode/settings.json`):

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Проверка типов

```bash
# Проверить типы без компиляции
bun run tsc --noEmit

# Проверить с watch mode
bun run tsc --noEmit --watch
```

Проект использует **Bun**, поэтому TypeScript компиляция не нужна - Bun выполняет `.ts` файлы напрямую!

## Common Issues

### Error: "Cannot find module 'bun:test'"

**Решение:** Убедитесь что `@types/bun` установлен и tsconfig.json включает `"types": ["bun-types"]`

```bash
bun add -d @types/bun
```

### Error: "Object is possibly 'null'"

**Решение:** Добавьте проверку на null

```typescript
// До
const user = await getUser();
console.log(user.name); // Error

// После
const user = await getUser();
if (!user) throw new Error('Not found');
console.log(user.name); // OK
```

### Error: "Parameter implicitly has an 'any' type"

**Решение:** Добавьте явный тип

```typescript
// До
function process(data) { ... } // Error

// После
function process(data: UserData) { ... } // OK
```

## Best Practices

1. **Всегда указывайте типы возврата** для public функций
2. **Проверяйте на null** перед использованием
3. **Используйте `unknown` вместо `any`** в catch блоках
4. **Не используйте `@ts-ignore`** - исправляйте проблему
5. **Используйте $inferSelect** для вывода типов из Drizzle схемы

## Полезные ссылки

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Bun TypeScript Support](https://bun.sh/docs/runtime/typescript)
- [Drizzle ORM TypeScript](https://orm.drizzle.team/docs/goodies#type-api)
