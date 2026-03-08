/**
 * NeuroPlay Copilot
 * 
 * The most advanced module of the platform.
 * Integrates all data sources (games, ABA, routines, stories, assessments)
 * into a unified child development intelligence system.
 * 
 * Capabilities:
 * - Continuous behavioral diagnosis
 * - Personalized recommendations for parents, teachers, therapists
 * - Automatic activity adjustments
 * - Early-warning alerts
 * - Cross-domain correlation detection
 * - Class and school-level analytics
 */

export {
  runCopilot,
  getCopilotForParent,
  getCopilotForTherapist,
  getCopilotForTeacher,
  runClassCopilot,
  type CopilotReport,
  type CopilotSummary,
  type CopilotConfig,
  type ParentCopilotView,
  type TherapistCopilotView,
  type TeacherCopilotView,
  type ClassCopilotView,
} from './copilot-engine';

export {
  detectPatterns,
  type DetectedPattern,
  type PatternType,
  type PatternDetectionConfig,
} from './pattern-detector';

export {
  generateInsights,
  type CopilotInsight,
  type InsightType,
} from './insight-generator';

export {
  generateCopilotRecommendations,
  type CopilotRecommendation,
  type ActionStep,
} from './recommendation-generator';

export {
  generateAlerts,
  filterAlertsByRole,
  getActiveAlerts,
  getUrgentAlerts,
  type CopilotAlert,
  type AlertType,
} from './alert-system';
