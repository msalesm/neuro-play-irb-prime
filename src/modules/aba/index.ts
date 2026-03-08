/**
 * 🧩 ABA Module
 * 
 * Domain: Applied Behavior Analysis — programs, trials, prompts, reinforcement, analytics.
 */

// ── Engine (local) ────────────────────────────────────────
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
} from './engine';

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

// ── Services (local) ─────────────────────────────────────
export { 
  fetchAbaPrograms, 
  fetchAbaTrials,
  // Sessions
  createAbaSession,
  fetchAbaSessions,
  completeAbaSession,
  // Goals
  fetchAbaGoals,
  createAbaGoal,
  updateAbaGoalStatus,
  // Clinical Notes
  fetchAbaClinicalNotes,
  createAbaClinicalNote,
  // Progress
  fetchAbaProgress,
  // Game Mapping
  fetchAbaGameMapping,
  createAbaGameMapping,
  // Stats
  fetchAbaProgressStats,
} from './service';
