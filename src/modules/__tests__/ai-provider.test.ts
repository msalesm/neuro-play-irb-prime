import { describe, it, expect } from 'vitest';
import {
  resolveConfig,
  getProviderEndpoint,
  buildLovableRequest,
  getNextFallback,
  isRetryableError,
  FALLBACK_CHAIN,
} from '@/modules/ai-provider';

describe('AI Provider Layer', () => {
  it('resolves default config', () => {
    const config = resolveConfig();
    expect(config.provider).toBe('lovable');
    expect(config.model).toBe('google/gemini-3-flash-preview');
  });

  it('merges user config with defaults', () => {
    const config = resolveConfig({ model: 'openai/gpt-5', temperature: 0.3 });
    expect(config.model).toBe('openai/gpt-5');
    expect(config.temperature).toBe(0.3);
    expect(config.provider).toBe('lovable');
  });

  it('returns correct endpoint for lovable', () => {
    expect(getProviderEndpoint('lovable')).toBe('https://ai.gateway.lovable.dev/v1/chat/completions');
  });

  it('builds correct request body', () => {
    const config = resolveConfig();
    const body = buildLovableRequest({
      messages: [{ role: 'user', content: 'Hello' }],
    }, config);
    
    expect(body.model).toBe('google/gemini-3-flash-preview');
    expect(body.messages).toHaveLength(1);
    expect(body.stream).toBeUndefined();
  });

  it('includes tools when provided', () => {
    const config = resolveConfig();
    const tools = [{ type: 'function', function: { name: 'test' } }];
    const body = buildLovableRequest({
      messages: [{ role: 'user', content: 'Hello' }],
      tools,
    }, config);
    
    expect(body.tools).toEqual(tools);
  });

  it('identifies retryable errors', () => {
    expect(isRetryableError(429)).toBe(true);
    expect(isRetryableError(500)).toBe(true);
    expect(isRetryableError(400)).toBe(false);
    expect(isRetryableError(401)).toBe(false);
  });

  it('returns null when no fallback available', () => {
    const last = FALLBACK_CHAIN[FALLBACK_CHAIN.length - 1];
    expect(getNextFallback(last)).toBeNull();
  });
});
