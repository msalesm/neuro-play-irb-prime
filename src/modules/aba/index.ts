/**
 * 🧩 ABA Module
 * 
 * Domain: Applied Behavior Analysis — programs, trials, prompts, reinforcement, analytics.
 * 
 * Structure:
 *   modules/aba/
 *     engine.ts        — Core ABA logic (mastery, prompt reduction, trend analysis)
 *     service.ts       — Supabase CRUD operations
 *     hooks/           — React hooks for data fetching
 *     components/      — UI components (dashboard, charts, forms)
 */

// ── Engine ────────────────────────────────────────────────
export { 
  analyzeSession, analyzeTrend, checkMastery,
  suggestPromptReduction, suggestReinforcementSchedule,
  PROMPT_LEVELS, PROMPT_HIERARCHY, ABA_TEACHING_METHODS,
  type PromptLevel, type AbaTeachingMethod,
} from './engine';

// ── Hooks ─────────────────────────────────────────────────
export {
  useAbaSkills, useAbaPrograms, useCreateProgram,
  useAbaInterventions, useCreateIntervention,
  useAbaTrials, useRecordTrial,
  useAbaReinforcements, useAbaProgressStats, useChildAbaSummary,
  useAbaSessions, useCreateSession, useCompleteSession,
  useAbaGoals, useCreateGoal, useUpdateGoalStatus,
  useAbaClinicalNotes, useCreateClinicalNote,
  useAbaNativeData, useAbaIntegration,
} from './hooks';

// ── Services ──────────────────────────────────────────────
export { 
  fetchAbaPrograms, fetchAbaTrials,
  createAbaSession, fetchAbaSessions, completeAbaSession,
  fetchAbaGoals, createAbaGoal, updateAbaGoalStatus,
  fetchAbaClinicalNotes, createAbaClinicalNote,
  fetchAbaProgress,
  fetchAbaGameMapping, createAbaGameMapping,
  fetchAbaProgressStats,
} from './service';

// ── Components ────────────────────────────────────────────
export {
  AbaNeuroPlayDashboard, AbaProgramsList, AbaProgramDetail,
  AbaSkillsLibrary, AbaTrialCollector, AbaProgressChart,
  AbaGameIntegration, AbaReportsPanel, AbaSessionManager,
  AbaGoalsPanel, AbaClinicalNotes, AbaProgramEvolution, AbaReportPDF,
} from '@/components/aba-neuroplay';
