/**
 * 📊 Reports Module
 * 
 * Domain: Clinical, educational, family reports. PDF export, charts, analytics.
 * 
 * Structure:
 *   modules/reports/
 *     ├── engine/        → report-engine.ts
 *     ├── components/    → report UI components
 *     ├── hooks/         → useReportEngine, useProfessionalAnalytics, etc.
 *     ├── services/      → report-service.ts
 *     └── index.ts       → this file (public API)
 */

// ── Engine ────────────────────────────────────────────────
export { 
  type ReportConfig,
  type GeneratedReport,
} from '@/core/report-engine';

// ── Hooks ─────────────────────────────────────────────────
export { useReportEngine } from '@/hooks/useReportEngine';
export { useProfessionalAnalytics } from '@/hooks/useProfessionalAnalytics';
export { useImpactEvidence } from '@/hooks/useImpactEvidence';
export { useContextualAI } from '@/hooks/useContextualAI';

// ── Services ──────────────────────────────────────────────
export { 
  fetchReportData,
  generateReportPDF,
} from '@/services/report-service';
