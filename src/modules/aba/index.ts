/**
 * 🧩 ABA Module
 * 
 * Domain: Applied Behavior Analysis — programs, trials, prompts, reinforcement, analytics.
 * 
 * Structure:
 *   modules/aba/
 *     ├── engine/        → aba-engine.ts
 *     ├── components/    → ABA UI components
 *     ├── hooks/         → useAbaNeuroPlay, useAbaNativeData, etc.
 *     ├── services/      → aba-service.ts
 *     └── index.ts       → this file (public API)
 */

// ── Engine ────────────────────────────────────────────────
export { 
  analyzeSession,
  analyzeTrend,
  checkMastery,
  suggestPromptReduction,
  suggestReinforcementSchedule,
  PROMPT_LEVELS,
  PROMPT_HIERARCHY,
  ABA_TEACHING_METHODS,
  type PromptLevel,
  type AbaTeachingMethod,
} from '@/core/aba-engine';

// ── Hooks ─────────────────────────────────────────────────
export { 
  useAbaSkills, 
  useAbaPrograms, 
  useCreateProgram, 
  useAbaInterventions, 
  useCreateIntervention, 
  useAbaTrials, 
  useRecordTrial, 
  useAbaReinforcements, 
  useAbaProgressStats, 
  useChildAbaSummary,
} from '@/hooks/useAbaNeuroPlay';

export { useAbaNativeData } from '@/hooks/useAbaNativeData';
export { useAbaIntegration } from '@/hooks/useAbaIntegration';

// ── Services ──────────────────────────────────────────────
export { 
  fetchAbaPrograms, 
  fetchAbaTrials,
} from '@/services/aba-service';
