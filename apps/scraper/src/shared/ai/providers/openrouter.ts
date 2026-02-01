import OpenAI from 'openai';
import { BaseAIProvider } from './base';
import { env } from '../../../config/env';

/**
 * OpenRouter AI Provider
 * Поддержка моделей: DeepSeek V3, Mistral Small, Llama 3.3
 * Использует OpenAI SDK для совместимости с OpenRouter API
 */
export class OpenRouterProvider extends BaseAIProvider {
  readonly name = 'OpenRouter';

  get model(): string {
    return this.getModelId(env.OPENROUTER_MODEL || 'deepseek-v3');
  }

  readonly rateLimit = {
    requestsPerMinute: 200, // Зависит от модели, 200 - консервативная оценка
    maxBatchSize: 5,
  };

  private client: OpenAI | null = null;

  isAvailable(): boolean {
    return !!env.OPENROUTER_API_KEY;
  }

  private getModelId(model: string): string {
    const models: Record<string, string> = {
      'deepseek-v3': 'deepseek/deepseek-chat',
      'mistral-small': 'mistralai/mistral-small',
      'llama-3.3': 'meta-llama/llama-3.3-70b-instruct',
    };
    return models[model] || models['deepseek-v3'];
  }

  private getClient(): OpenAI {
    if (!this.client) {
      if (!env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not found in environment');
      }

      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: env.OPENROUTER_API_KEY,
        defaultHeaders: {
          'HTTP-Referer': 'https://workwolk.com',
          'X-Title': 'WorkWolk Vacancy Analyzer',
        },
      });

      this.log.info('OpenRouter client initialized', { model: this.model });
    }
    return this.client;
  }

  protected async callAPI(prompt: string): Promise<string> {
    const client = this.getClient();

    const completion = await client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Детерминированный анализ
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned empty response');
    }

    return content;
  }
}
