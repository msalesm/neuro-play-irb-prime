import { describe, it, expect } from 'vitest';
import {
  resolveConfig,
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

  it('has correct fallback chain order', () => {
    expect(FALLBACK_CHAIN).toEqual(['lovable', 'openai', 'anthropic']);
  });

  it('fallback chain has lovable as primary', () => {
    expect(FALLBACK_CHAIN[0]).toBe('lovable');
  });
});
