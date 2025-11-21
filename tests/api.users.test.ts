/**
 * E2E тесты Users API
 */

import { describe, test, expect } from 'bun:test';
import type { ApiResponse } from '../src/types/api';
import type { User } from '../src/db/schema';

const API_URL = 'http://localhost:3000';

describe('Users API', () => {
  test('GET /api/users должен вернуть список пользователей', async () => {
    const response = await fetch(`${API_URL}/api/users`);
    const data = await response.json() as ApiResponse<User[]>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
