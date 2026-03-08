/**
 * NeuroPlay Modules
 * 
 * Layer 3 of the 7-layer architecture: Domain Engines.
 * Each module encapsulates its engine, hooks, services, types, and components.
 * 
 * 10 domain engines that form the competitive moat:
 * 
 *   Games          → Sessions, trials, cognitive metrics
 *   ABA            → Programs, sessions, prompt fading
 *   Behavioral     → Cross-domain behavioral profiles
 *   Assessment     → Cognitive scores (0-100)
 *   Recommendations→ Role-based suggestions
 *   Copilot        → Continuous intelligence & alerts
 *   Adaptive       → Difficulty & intervention control
 *   Dataset        → Aggregation & correlation
 *   Routines       → Executive routine tracking
 *   Stories        → Interactive story decisions
 */

export * as Games from './games';
export * as ABA from './aba';
export * as Behavioral from './behavioral';
export * as Assessment from './assessment';
export * as Recommendations from './recommendations';
export * as Copilot from './copilot';
export * as Adaptive from './adaptive';
export * as Dataset from './dataset';
export * as Routines from './routines';
export * as Stories from './stories';

// ── Supporting modules ──────────────────────────────────
export * as School from './school';
export * as Clinic from './clinic';
export * as Family from './family';
export * as Institution from './institution';

// ── Cross-cutting ───────────────────────────────────────
export { type AIProvider, type AICompletionRequest } from './ai-provider';
export { type ClassifiedMetric, type DataSource, clinicalOnly, isClinicalSafe } from './data-classification';
