/**
 * AI Provider Abstraction Layer
 * 
 * Abstracts the AI gateway behind a provider interface,
 * enabling future multi-provider support with fallback.
 * 
 * Current implementation: Lovable AI Gateway (primary)
 * Future: OpenAI direct, Anthropic, Google, local model fallback
 */

export type AIProvider = 'lovable' | 'openai' | 'anthropic' | 'google' | 'local';

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

export interface AICompletionRequest {
  messages: AIMessage[];
  config?: Partial<AIProviderConfig>;
  tools?: any[];
  tool_choice?: any;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  provider: AIProvider;
  model: string;
  toolCalls?: any[];
}

// Default configuration
const DEFAULT_CONFIG: AIProviderConfig = {
  provider: 'lovable',
  model: 'google/gemini-3-flash-preview',
  maxTokens: 4096,
  temperature: 0.7,
};

/**
 * Provider registry with endpoint configurations.
 * Currently only Lovable gateway is active.
 * Others are stubs for future implementation.
 */
const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
  lovable: 'https://ai.gateway.lovable.dev/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  local: 'http://localhost:11434/v1/chat/completions',
};

/**
 * Resolve the AI provider configuration.
 * Merges user config with defaults.
 */
export function resolveConfig(
  userConfig?: Partial<AIProviderConfig>
): AIProviderConfig {
  return { ...DEFAULT_CONFIG, ...userConfig };
}

/**
 * Get the endpoint URL for a provider.
 */
export function getProviderEndpoint(provider: AIProvider): string {
  return PROVIDER_ENDPOINTS[provider];
}

/**
 * Build the request body for the Lovable AI gateway.
 * This is the primary implementation.
 */
export function buildLovableRequest(
  request: AICompletionRequest,
  config: AIProviderConfig
): Record<string, any> {
  const body: Record<string, any> = {
    model: config.model,
    messages: request.messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  };

  if (request.tools) body.tools = request.tools;
  if (request.tool_choice) body.tool_choice = request.tool_choice;
  if (request.stream) body.stream = true;

  return body;
}

/**
 * Provider fallback chain.
 * If primary provider fails, try the next in chain.
 */
export const FALLBACK_CHAIN: AIProvider[] = [
  'lovable',
  // Future: 'openai', 'anthropic', 'google', 'local'
];

/**
 * Determine if an error is retryable with a different provider.
 */
export function isRetryableError(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503;
}

/**
 * Get the next fallback provider in the chain.
 * Returns null if no more fallbacks available.
 */
export function getNextFallback(
  currentProvider: AIProvider
): AIProvider | null {
  const currentIndex = FALLBACK_CHAIN.indexOf(currentProvider);
  if (currentIndex < 0 || currentIndex >= FALLBACK_CHAIN.length - 1) {
    return null;
  }
  return FALLBACK_CHAIN[currentIndex + 1];
}
