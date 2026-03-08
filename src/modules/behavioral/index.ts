/**
 * 🧠 Behavioral Module
 * 
 * Domain: Unified behavioral profiling, cognitive models, socioemotional models,
 *         executive function models. Integrates data from games, ABA, routines, stories.
 * 
 * Structure:
 *   modules/behavioral/
 *     ├── engine/        → behavioral-profile-engine.ts, cognitive-model, etc.
 *     ├── hooks/         → useBehavioralProfile, useBehavioralAnalysis, etc.
 *     └── index.ts       → this file (public API)
 */

// ── Engine ────────────────────────────────────────────────
export { 
  generateUnifiedProfile, 
  type UnifiedProfile, 
  type DomainScore, 
  type ProfileDataSources,
} from '@/core/behavioral-profile-engine';

// ── Hooks ─────────────────────────────────────────────────
export { useBehavioralProfile } from '@/hooks/useBehavioralProfile';
export { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
export { useBehavioralReport } from '@/hooks/useBehavioralReport';
export { useCognitiveAnalysis } from '@/hooks/useCognitiveAnalysis';
export { useIntegratedProfile } from '@/hooks/useIntegratedProfile';
export { usePredictiveAnalysis } from '@/hooks/usePredictiveAnalysis';
