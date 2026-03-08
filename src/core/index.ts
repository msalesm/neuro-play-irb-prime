/**
 * Core module barrel export
 * 
 * Roles & Navigation remain in core.
 * Domain engines have moved to src/modules/*.
 * Re-exports kept for backward compatibility.
 */

// ── Core (stays here) ────────────────────────────────────
export * from './roles';
export * from './navigation';

// ── Module re-exports (backward compatibility) ───────────
// @deprecated Use '@/modules/games' directly
export * from './game-engine';
// @deprecated Use '@/modules/behavioral' directly
export * from './behavioral-profile-engine';
// @deprecated Use '@/modules/reports' directly
export * from './report-engine';
// @deprecated Use '@/modules/aba' directly
export * from './aba-engine';
