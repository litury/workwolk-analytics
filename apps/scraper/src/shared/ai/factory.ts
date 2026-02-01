import { createLogger } from '../utils/logger';
import { GeminiProvider } from './providers/gemini';
import { OpenRouterProvider } from './providers/openrouter';
import type { IAIProvider, AIConfig } from './types';
import { env } from '../../config/env';

const log = createLogger('AIFactory');

/**
 * Фабрика AI провайдеров с поддержкой fallback
 */
export class AIProviderFactory {
  private providers = new Map<string, IAIProvider>();

  constructor() {
    this.registerProviders();
  }

  private registerProviders() {
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('openrouter', new OpenRouterProvider());
  }

  /**
   * Получить активного провайдера с автоматическим fallback
   */
  getProvider(): IAIProvider {
    const config = this.getConfig();

    // 1. Попытка использовать primary провайдер
    const primary = this.providers.get(config.primaryProvider);
    if (primary?.isAvailable()) {
      log.info(`Using primary provider: ${primary.name}`, {
        model: primary.model,
        rateLimit: primary.rateLimit,
      });
      return primary;
    }

    log.warn(`Primary provider "${config.primaryProvider}" unavailable`);

    // 2. Fallback на резервного провайдера
    if (config.fallbackProvider !== 'none') {
      const fallback = this.providers.get(config.fallbackProvider);
      if (fallback?.isAvailable()) {
        log.warn(`Using fallback provider: ${fallback.name}`, {
          model: fallback.model,
        });
        return fallback;
      }
    }

    // 3. Ошибка: ни один провайдер не доступен
    throw new Error(
      `No AI providers available. Primary: ${config.primaryProvider}, Fallback: ${config.fallbackProvider}. ` +
      `Check that API keys are set in .env file.`
    );
  }

  /**
   * Получить конкретного провайдера по имени (для тестирования)
   */
  getProviderByName(name: 'gemini' | 'openrouter'): IAIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider not found: ${name}`);
    }
    if (!provider.isAvailable()) {
      throw new Error(`Provider not available: ${name} (check API key in .env)`);
    }
    return provider;
  }

  private getConfig(): AIConfig {
    return {
      primaryProvider: (env.AI_PRIMARY_PROVIDER as 'gemini' | 'openrouter') || 'openrouter',
      fallbackProvider: (env.AI_FALLBACK_PROVIDER as 'gemini' | 'openrouter' | 'none') || 'gemini',
      openRouterModel: env.OPENROUTER_MODEL || 'deepseek-v3',
    };
  }
}

// Singleton
export const aiFactory = new AIProviderFactory();
