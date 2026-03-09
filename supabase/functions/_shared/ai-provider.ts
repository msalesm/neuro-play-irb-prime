/**
 * Multi-Provider AI Abstraction Layer
 * 
 * Implements fallback chain: Lovable → OpenAI → Anthropic → Static fallback
 * Used by all AI edge functions to ensure resilience.
 */

export type AIProvider = 'lovable' | 'openai' | 'anthropic';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  tool_choice?: any;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  provider: AIProvider;
  model: string;
  toolCalls?: any[];
  fallback?: boolean;
  raw?: any;
}

interface ProviderConfig {
  endpoint: string;
  apiKeyEnv: string;
  defaultModel: string;
  buildRequest: (req: AICompletionRequest, model: string) => Record<string, any>;
  parseResponse: (data: any) => { content: string; toolCalls?: any[] };
}

const FALLBACK_RESPONSE: AICompletionResponse = {
  content: 'Análise temporariamente indisponível. Tente novamente em instantes.',
  provider: 'lovable',
  model: 'fallback',
  fallback: true,
};

const TIMEOUT_MS = 30000; // 30 seconds

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  lovable: {
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    apiKeyEnv: 'LOVABLE_API_KEY',
    defaultModel: 'google/gemini-2.5-flash',
    buildRequest: (req, model) => ({
      model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 4096,
      ...(req.tools && { tools: req.tools }),
      ...(req.tool_choice && { tool_choice: req.tool_choice }),
      ...(req.stream && { stream: true }),
    }),
    parseResponse: (data) => ({
      content: data.choices?.[0]?.message?.content || '',
      toolCalls: data.choices?.[0]?.message?.tool_calls,
    }),
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKeyEnv: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o-mini',
    buildRequest: (req, model) => ({
      model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 4096,
      ...(req.tools && { tools: req.tools }),
      ...(req.tool_choice && { tool_choice: req.tool_choice }),
      ...(req.stream && { stream: true }),
    }),
    parseResponse: (data) => ({
      content: data.choices?.[0]?.message?.content || '',
      toolCalls: data.choices?.[0]?.message?.tool_calls,
    }),
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-haiku-4-5-20251001',
    buildRequest: (req, model) => {
      // Anthropic uses a different format - extract system message
      const systemMessage = req.messages.find(m => m.role === 'system');
      const otherMessages = req.messages.filter(m => m.role !== 'system');
      
      return {
        model,
        max_tokens: req.maxTokens ?? 4096,
        ...(systemMessage && { system: systemMessage.content }),
        messages: otherMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        ...(req.tools && {
          tools: req.tools.map(t => ({
            name: t.function?.name || t.name,
            description: t.function?.description || t.description,
            input_schema: t.function?.parameters || t.parameters,
          })),
        }),
      };
    },
    parseResponse: (data) => {
      // Anthropic returns content as an array
      const textContent = data.content?.find((c: any) => c.type === 'text');
      const toolUseContent = data.content?.filter((c: any) => c.type === 'tool_use');
      
      return {
        content: textContent?.text || '',
        toolCalls: toolUseContent?.length ? toolUseContent.map((t: any) => ({
          id: t.id,
          type: 'function',
          function: {
            name: t.name,
            arguments: JSON.stringify(t.input),
          },
        })) : undefined,
      };
    },
  },
};

const FALLBACK_CHAIN: AIProvider[] = ['lovable', 'openai', 'anthropic'];

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Try a single provider
 */
async function tryProvider(
  provider: AIProvider,
  request: AICompletionRequest
): Promise<{ success: boolean; response?: Response; data?: any; error?: string }> {
  const config = PROVIDERS[provider];
  const apiKey = Deno.env.get(config.apiKeyEnv);
  
  if (!apiKey) {
    return { success: false, error: `${config.apiKeyEnv} not configured` };
  }
  
  const model = request.model || config.defaultModel;
  const body = config.buildRequest(request, model);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Provider-specific auth headers
  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  try {
    const response = await fetchWithTimeout(
      config.endpoint,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      },
      TIMEOUT_MS
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] ${provider} error ${response.status}:`, errorText);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    // If streaming, return the response directly
    if (request.stream) {
      return { success: true, response };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[AI] ${provider} failed:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Call AI with automatic fallback across providers.
 * 
 * @param request - The completion request
 * @returns AICompletionResponse with provider info and fallback flag
 */
export async function callAI(request: AICompletionRequest): Promise<AICompletionResponse> {
  for (const provider of FALLBACK_CHAIN) {
    console.log(`[AI] Trying provider: ${provider}`);
    
    const result = await tryProvider(provider, request);
    
    if (result.success && result.data) {
      const config = PROVIDERS[provider];
      const parsed = config.parseResponse(result.data);
      
      console.log(`[AI] Success with provider: ${provider}`);
      
      return {
        content: parsed.content,
        provider,
        model: request.model || config.defaultModel,
        toolCalls: parsed.toolCalls,
        fallback: false,
        raw: result.data,
      };
    }
    
    console.warn(`[AI] Provider ${provider} failed: ${result.error}`);
  }
  
  // All providers failed
  console.error('[AI] All providers failed, returning static fallback');
  return FALLBACK_RESPONSE;
}

/**
 * Call AI with streaming support and automatic fallback.
 * Returns the raw Response for streaming, or falls back to non-streaming if needed.
 * 
 * @param request - The completion request (stream should be true)
 * @returns Response object for streaming or AICompletionResponse for fallback
 */
export async function callAIStream(
  request: AICompletionRequest
): Promise<{ stream: true; response: Response; provider: AIProvider } | { stream: false; fallback: AICompletionResponse }> {
  const streamRequest = { ...request, stream: true };
  
  for (const provider of FALLBACK_CHAIN) {
    // Only Lovable and OpenAI support compatible streaming
    if (provider === 'anthropic') {
      console.log(`[AI] Skipping ${provider} for streaming (incompatible format)`);
      continue;
    }
    
    console.log(`[AI] Trying streaming provider: ${provider}`);
    
    const result = await tryProvider(provider, streamRequest);
    
    if (result.success && result.response) {
      console.log(`[AI] Streaming success with provider: ${provider}`);
      return { stream: true, response: result.response, provider };
    }
    
    console.warn(`[AI] Streaming provider ${provider} failed: ${result.error}`);
  }
  
  // Try non-streaming as last resort with Anthropic
  console.log('[AI] Trying non-streaming fallback with Anthropic');
  const nonStreamRequest = { ...request, stream: false };
  const anthropicResult = await tryProvider('anthropic', nonStreamRequest);
  
  if (anthropicResult.success && anthropicResult.data) {
    const parsed = PROVIDERS.anthropic.parseResponse(anthropicResult.data);
    console.log('[AI] Non-streaming fallback success with Anthropic');
    return {
      stream: false,
      fallback: {
        content: parsed.content,
        provider: 'anthropic',
        model: PROVIDERS.anthropic.defaultModel,
        toolCalls: parsed.toolCalls,
        fallback: false,
      },
    };
  }
  
  // All providers failed
  console.error('[AI] All streaming providers failed, returning static fallback');
  return { stream: false, fallback: FALLBACK_RESPONSE };
}

/**
 * Check if a provider API key is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  const config = PROVIDERS[provider];
  return !!Deno.env.get(config.apiKeyEnv);
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): AIProvider[] {
  return FALLBACK_CHAIN.filter(isProviderAvailable);
}
