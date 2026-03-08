/**
 * 📅 Routines Module
 * 
 * Domain: Executive routines, task tracking, organization index.
 * 
 * Structure:
 *   modules/routines/
 *     ├── components/    → routine UI
 *     ├── hooks/         → useRoutines, useExecutiveRoutine, useRoutineData
 *     └── index.ts       → this file (public API)
 */

// ── Hooks ─────────────────────────────────────────────────
export { useRoutines } from '@/hooks/useRoutines';
export { useRoutineData } from '@/hooks/useRoutineData';
export { useExecutiveRoutine, type ExecutiveMetrics } from '@/hooks/useExecutiveRoutine';
