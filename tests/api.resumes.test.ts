/**
 * E2E тесты Resumes API
 */

import { describe, test, expect } from 'bun:test';
import type { ApiResponse } from '../src/types/api';
import type { Resume } from '../src/db/schema';

const API_URL = 'http://localhost:3000';

describe('Resumes API', () => {
  test('GET /api/resumes должен вернуть список резюме', async () => {
    const response = await fetch(`${API_URL}/api/resumes`);
    const data = await response.json() as ApiResponse<Resume[]>;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
