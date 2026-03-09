/**
 * AI Provider Abstraction Layer (Frontend reference)
 * 
 * The actual multi-provider fallback logic lives in:
 * supabase/functions/_shared/ai-provider.ts
 * 
 * This file provides type definitions and constants
 * for frontend code that needs to reference AI providers.
 */

export type AIProvider = 'lovable' | 'openai' | 'anthropic';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionResponse {
  content: string;
  provider: AIProvider;
  model: string;
  toolCalls?: any[];
  fallback?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AIProviderConfig = {
  provider: 'lovable',
  model: 'google/gemini-3-flash-preview',
  maxTokens: 4096,
  temperature: 0.7,
};

/**
 * Provider fallback chain (reference).
 * Actual implementation is server-side in _shared/ai-provider.ts
 * 
 * Chain: Lovable → OpenAI → Anthropic → Static fallback
 */
export const FALLBACK_CHAIN: AIProvider[] = ['lovable', 'openai', 'anthropic'];

export function resolveConfig(
  userConfig?: Partial<AIProviderConfig>
): AIProviderConfig {
  return { ...DEFAULT_CONFIG, ...userConfig };
}
