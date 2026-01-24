/**
 * E2E тесты Logger utility
 */

import { describe, test, expect } from 'bun:test';
import { createLogger } from '../src/utils/logger';

describe('Logger', () => {
  test('createLogger работает без ошибок', () => {
    const log = createLogger('TestLogger');

    expect(() => log.info('Test message')).not.toThrow();
    expect(() => log.error('Test error', new Error('Test'))).not.toThrow();
    expect(() => log.warn('Test warning')).not.toThrow();
  });

  test('operationStart и operationEnd работают', () => {
    const log = createLogger('TestLogger');
    const startTime = Date.now();

    expect(() => log.operationStart('TestOp', { test: true })).not.toThrow();
    expect(() => log.operationEnd('TestOp', startTime, { result: 'ok' })).not.toThrow();
  });
});
