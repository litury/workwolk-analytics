/**
 * Конфигурация переменных окружения
 */

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL!,

  // Scraper settings
  headless: process.env.HEADLESS !== 'false',

  // === AI Providers ===

  // Gemini AI
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,

  // OpenRouter
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'deepseek-v3', // deepseek-v3 | mistral-small | llama-3.3

  // === AI Configuration ===
  AI_PRIMARY_PROVIDER: process.env.AI_PRIMARY_PROVIDER || 'openrouter', // gemini | openrouter
  AI_FALLBACK_PROVIDER: process.env.AI_FALLBACK_PROVIDER || 'gemini', // gemini | openrouter | none

  // Legacy (kept for backward compatibility)
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
};
