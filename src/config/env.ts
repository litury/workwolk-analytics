/**
 * Конфигурация переменных окружения
 */

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL!,

  hh: {
    clientId: process.env.HH_CLIENT_ID!,
    clientSecret: process.env.HH_CLIENT_SECRET!,
    redirectUri: process.env.HH_REDIRECT_URI!,
    authUrl: 'https://hh.ru/oauth/authorize',
    tokenUrl: 'https://hh.ru/oauth/token',
    apiUrl: 'https://api.hh.ru'
  }
};
