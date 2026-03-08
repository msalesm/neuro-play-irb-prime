/**
 * 📖 Stories Module
 * 
 * Domain: Social stories engine, interactive decisions, socioemotional tracking.
 */

// ── Hooks ─────────────────────────────────────────────────
export { useStoryEngine, type SocioemotionalMetrics } from '@/hooks/useStoryEngine';
export { useSocialStories } from '@/hooks/useSocialStories';
export { useSocialScenarios } from '@/hooks/useSocialScenarios';

// ── Service ───────────────────────────────────────────────
export { fetchSocialStories, fetchStoryProgress, saveStoryDecision } from './service';
