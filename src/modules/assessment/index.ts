/**
 * 📊 Cognitive Assessment Module
 * 
 * Evaluates cognitive abilities based on structured task data.
 * Wraps the deterministic cognitive engine with assessment-specific API.
 */

export {
  type AssessmentResult,
  type DomainAssessment,
  type AssessmentSummary,
  runCognitiveAssessment,
  generateAssessmentSummary,
  getAssessmentCompleteness,
} from './assessment-engine';

export {
  type AssessmentMetric,
  type MetricTrend,
  calculateMetricTrends,
  aggregateMetrics,
} from './assessment-metrics';

export {
  type AssessmentReportData,
  generateAssessmentReport,
} from './assessment-report';
