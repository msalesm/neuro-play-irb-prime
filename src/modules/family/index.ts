/**
 * 👨‍👩‍👧 Family Module
 * 
 * Domain: Parent dashboard, family progress, parent training,
 *         parents club, child relationships.
 */

// ── Hooks ─────────────────────────────────────────────────
export { useFamilyProgress } from '@/hooks/useFamilyProgress';
export { useParentTraining } from '@/hooks/useParentTraining';
export { useParentsClub } from '@/hooks/useParentsClub';
export { useParentDashboard } from '@/hooks/useParentDashboard';
export { 
  useParentChildRelationships, 
  useTherapistPatientRelationships, 
  useTeacherStudentRelationships, 
  useChildAccess 
} from '@/hooks/useRelationships';
