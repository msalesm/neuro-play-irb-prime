/**
 * 📦 Behavioral Dataset Module
 * 
 * Structured dataset aggregation from all platform data sources.
 */

export {
  type BehavioralDataPoint,
  type DatasetFilter,
  type DatasetSummary,
  createDataPoint,
  filterDataset,
  summarizeDataset,
} from './behavioral-dataset';

export {
  type AggregatedChildData,
  type DataSourceContribution,
  aggregateChildData,
  calculateDataCompleteness,
} from './dataset-aggregator';

export {
  type AnalyticsInsight,
  type CorrelationResult,
  generateInsights,
  calculateCorrelation,
} from './analytics-engine';
