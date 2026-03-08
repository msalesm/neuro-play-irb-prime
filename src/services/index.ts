/**
 * Services Layer - Barrel Export
 * 
 * Domain services have moved to src/modules/*.
 * Re-exports kept for backward compatibility.
 * Only user-service remains here (cross-cutting concern).
 */

// ── Cross-cutting (stays here) ──────────────────────────
export * as userService from './user-service';

// ── Module re-exports (backward compatibility) ──────────
// @deprecated Use '@/modules/games' directly
export * as gameService from './game-service';
// @deprecated Use '@/modules/aba' directly
export * as abaService from './aba-service';
// @deprecated Use '@/modules/reports' directly
export * as reportService from './report-service';
// @deprecated Use '@/modules/games/cognitive-engine' directly
export * as cognitiveEngine from './cognitive-engine';
