/**
 * NeuroPlay Architecture Registry
 * 
 * Central manifest of the 7-layer architecture.
 * Import this to understand the system structure and verify layer boundaries.
 * 
 * ┌─────────────────────────────────────────────┐
 * │  7. AI LAYER          → src/modules/copilot, ai-provider
 * │  6. ANALYTICS LAYER   → src/modules/dataset, data-classification
 * │  5. DATA LAYER        → Supabase (Postgres + RLS + Audit)
 * │  4. SERVICE LAYER     → src/services, supabase/functions
 * │  3. DOMAIN ENGINES    → src/modules/*
 * │  2. APPLICATION LAYER → src/hooks, src/core
 * │  1. CLIENT LAYER      → src/components, src/pages
 * └─────────────────────────────────────────────┘
 */

// ─── Layer 7: AI Layer ────────────────────────────────────
export { type AIProvider, type AICompletionResponse } from '@/modules/ai-provider';
export { runCopilot, getCopilotForParent, getCopilotForTherapist, getCopilotForTeacher } from '@/modules/copilot';

// ─── Layer 6: Analytics Layer ─────────────────────────────
export { type BehavioralDataPoint, type DatasetSummary } from '@/modules/dataset';
export { type ClassifiedMetric, type DataSource, clinicalOnly, isClinicalSafe } from '@/modules/data-classification';

// ─── Layer 3: Domain Engines ──────────────────────────────
export { type GameMetrics, type GameSessionConfig } from '@/modules/games/engine';
export { type UnifiedProfile } from '@/modules/behavioral/engine';
export { type AssessmentResult } from '@/modules/assessment';

// ─── Architecture Constants ──────────────────────────────

export const ARCHITECTURE_LAYERS = [
  { id: 'client',      name: 'Client Layer',      path: 'src/components, src/pages' },
  { id: 'application', name: 'Application Layer',  path: 'src/hooks, src/core' },
  { id: 'engines',     name: 'Domain Engines',     path: 'src/modules/*' },
  { id: 'services',    name: 'Service Layer',      path: 'src/services, supabase/functions' },
  { id: 'data',        name: 'Data Layer',         path: 'Supabase (Postgres + RLS)' },
  { id: 'analytics',   name: 'Analytics Layer',    path: 'src/modules/dataset' },
  { id: 'ai',          name: 'AI Layer',           path: 'src/modules/copilot, ai-provider' },
] as const;

export const DOMAIN_ENGINES = [
  { id: 'games',           path: 'src/modules/games',           desc: 'Sessions, trials, cognitive metrics' },
  { id: 'aba',             path: 'src/modules/aba',             desc: 'Programs, sessions, prompt fading' },
  { id: 'behavioral',      path: 'src/modules/behavioral',      desc: 'Cross-domain behavioral profiles' },
  { id: 'assessment',      path: 'src/modules/assessment',      desc: 'Cognitive scores (0-100)' },
  { id: 'recommendations', path: 'src/modules/recommendations', desc: 'Role-based suggestions' },
  { id: 'copilot',         path: 'src/modules/copilot',         desc: 'Continuous intelligence & alerts' },
  { id: 'adaptive',        path: 'src/modules/adaptive',        desc: 'Difficulty & intervention control' },
  { id: 'dataset',         path: 'src/modules/dataset',         desc: 'Aggregation & correlation' },
  { id: 'routines',        path: 'src/modules/routines',        desc: 'Executive routine tracking' },
  { id: 'stories',         path: 'src/modules/stories',         desc: 'Interactive story decisions' },
] as const;

export const COMPETITIVE_MOATS = [
  { id: 'dataset',  name: 'Behavioral Dataset',     desc: 'Longitudinal child behavioral data from 5 sources' },
  { id: 'engine',   name: 'Cognitive Engine',        desc: 'Real behavioral metrics most apps do not collect' },
  { id: 'copilot',  name: 'Development Copilot',     desc: 'Cross-domain intelligence for personalized guidance' },
] as const;
