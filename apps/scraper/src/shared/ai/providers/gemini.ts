import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base';
import { env } from '../../../config/env';

/**
 * Gemini AI Provider
 * Использует Google Generative AI (текущая реализация из enrich-ai.ts)
 */
export class GeminiProvider extends BaseAIProvider {
  readonly name = 'Gemini';
  readonly model = 'gemini-3-flash-preview';
  readonly rateLimit = {
    requestsPerMinute: 1000, // Pay-as-you-go tier
    maxBatchSize: 5,
  };

  private client: GoogleGenerativeAI | null = null;

  isAvailable(): boolean {
    return !!env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment');
      }
      this.client = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
      this.log.info('Gemini client initialized');
    }
    return this.client;
  }

  protected async callAPI(prompt: string): Promise<string> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: this.model });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
