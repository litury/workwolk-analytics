/**
 * E2E тесты Applications API
 */

import { describe, test, expect } from 'bun:test';
import type { ApiResponse } from '../src/types/api';
import type { Application } from '@prisma/client';

const API_URL = 'http://localhost:3000';

describe('Applications API', () => {
  test('GET /api/applications должен вернуть список откликов', async () => {
    const response = await fetch(`${API_URL}/api/applications`);
    const data = await response.json() as ApiResponse<Application[]>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
