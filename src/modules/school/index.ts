/**
 * 🏫 School Module
 * 
 * Domain: School Mode — quick sessions, educational dashboards,
 *         class management, behavioral indicators (non-clinical).
 */

// ── Components ────────────────────────────────────────────
export { QuickActivities } from './components/QuickActivities';
export { StudentBehavioralCard } from './components/StudentBehavioralCard';
export { ClassProgressChart } from './components/ClassProgressChart';
export { SchoolWeeklyEngagement } from './components/SchoolWeeklyEngagement';

// ── Constants ─────────────────────────────────────────────
export { EDUCATIONAL_LABELS, QUICK_ACTIVITY_DURATION_MS } from './constants';

// ── Hooks ─────────────────────────────────────────────────
export { useEducationalSystem } from '@/hooks/useEducationalSystem';
export { useClassProgress } from '@/hooks/useClassProgress';
export { useTeacherStudentProgress } from '@/hooks/useTeacherStudentProgress';
export { useTeacherTraining } from '@/hooks/useTeacherTraining';
