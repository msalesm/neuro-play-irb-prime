/**
 * 📅 Routines Module
 * 
 * Domain: Executive routines, task tracking, organization index.
 */

// ── Hooks ─────────────────────────────────────────────────
export { useRoutines } from '@/hooks/useRoutines';
export { useRoutineData } from '@/hooks/useRoutineData';
export { useExecutiveRoutine, type ExecutiveMetrics } from '@/hooks/useExecutiveRoutine';

// ── Service ───────────────────────────────────────────────
export { fetchRoutines, fetchRoutineExecutions, saveRoutineExecution } from './service';
