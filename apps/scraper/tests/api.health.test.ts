/**
 * E2E тесты Health Check endpoints
 */

import { describe, test, expect } from 'bun:test';
import type { IHealthCheckResponse, IDbHealthResponse } from '../src/types/api';

const API_URL = 'http://localhost:3000';

describe('API Health Checks', () => {
  test('GET / должен вернуть статус ok', async () => {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json() as IHealthCheckResponse;

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('Vacancy Aggregator');
  });

  test('GET /health/db должен вернуть connected', async () => {
    const response = await fetch(`${API_URL}/health/db`);
    const data = await response.json() as IDbHealthResponse;

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.database).toBe('connected');
  });
});
