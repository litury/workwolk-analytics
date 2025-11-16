/**
 * Database configuration
 * Prisma Client singleton
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger';

const log = createLogger('Database');

// Prisma Client singleton
const prismaClientSingleton = () => {
  log.info('Initializing Prisma Client');

  return new PrismaClient({
    log: [
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' }
    ]
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
