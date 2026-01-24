/**
 * Конфигурация переменных окружения
 */

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL!,
};
