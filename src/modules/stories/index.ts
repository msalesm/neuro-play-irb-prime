/**
 * 📖 Stories Module
 * 
 * Domain: Social stories engine, interactive decisions, socioemotional tracking.
 * 
 * Structure:
 *   modules/stories/
 *     ├── engine/        → story engine logic
 *     ├── components/    → story UI components
 *     ├── hooks/         → useStoryEngine, useSocialStories
 *     └── index.ts       → this file (public API)
 */

// ── Hooks ─────────────────────────────────────────────────
export { useStoryEngine, type SocioemotionalMetrics } from '@/hooks/useStoryEngine';
export { useSocialStories } from '@/hooks/useSocialStories';
export { useSocialScenarios } from '@/hooks/useSocialScenarios';
