/**
 * 📊 Reports Module
 * 
 * Domain: Clinical, educational, family reports. PDF export, charts, analytics.
 */

// ── Engine (local) ────────────────────────────────────────
export { 
  type ReportConfig,
  type GeneratedReport,
} from './engine';

// ── Hooks ─────────────────────────────────────────────────
export { useReportEngine } from '@/hooks/useReportEngine';
export { useProfessionalAnalytics } from '@/hooks/useProfessionalAnalytics';
export { useImpactEvidence } from '@/hooks/useImpactEvidence';
export { useContextualAI } from '@/hooks/useContextualAI';

// ── Services (local) ─────────────────────────────────────
export { 
  fetchClinicalReports,
  insertClinicalReport,
} from './service';
