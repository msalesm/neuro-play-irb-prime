/**
 * Services Layer - Barrel Export
 * 
 * Layer 4 of the 7-layer architecture.
 * Interface between frontend and data layer.
 * 
 * Rule: Frontend never talks directly to the database.
 */

// ── Cross-cutting services ──────────────────────────────
export * as userService from './user-service';
export * as analyticsService from './analytics-service';
export * as securityService from './security-service';

// ── Domain services ─────────────────────────────────────
// @deprecated Use '@/modules/games' directly
export * as gameService from './game-service';
// @deprecated Use '@/modules/aba' directly
export * as abaService from './aba-service';
// @deprecated Use '@/modules/reports' directly
export * as reportService from './report-service';
// @deprecated Use '@/modules/games/cognitive-engine' directly
export * as cognitiveEngine from './cognitive-engine';
