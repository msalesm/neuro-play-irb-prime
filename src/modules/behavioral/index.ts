/**
 * 🧠 Behavioral Module
 * 
 * Domain: Unified behavioral profiling, cognitive models, socioemotional models,
 *         executive function models. Integrates data from games, ABA, routines, stories.
 */

// ── Engine (local) ────────────────────────────────────────
export { 
  generateUnifiedProfile, 
  type UnifiedProfile, 
  type DomainScore, 
  type ProfileDataSources,
} from './engine';

// ── Service (local) ───────────────────────────────────────
export {
  fetchBehavioralInsights,
  fetchScreenings,
  fetchEmotionalCheckins,
} from './service';

// ── Hooks ─────────────────────────────────────────────────
export { useBehavioralProfile } from '@/hooks/useBehavioralProfile';
export { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
export { useBehavioralReport } from '@/hooks/useBehavioralReport';
export { useCognitiveAnalysis } from '@/hooks/useCognitiveAnalysis';
export { useIntegratedProfile } from '@/hooks/useIntegratedProfile';
export { usePredictiveAnalysis } from '@/hooks/usePredictiveAnalysis';
