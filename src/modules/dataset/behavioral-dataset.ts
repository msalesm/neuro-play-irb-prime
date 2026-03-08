/**
 * Behavioral Dataset
 * 
 * Structured behavioral data points from all platform sources.
 */

// ─── Types ────────────────────────────────────────────────

export interface BehavioralDataPoint {
  id: string;
  childId: string;
  timestamp: string;
  activityType: 'game' | 'aba' | 'routine' | 'story' | 'screening';
  activityId: string;
  metricType: MetricType;
  metricValue: number;
  context: DataPointContext;
}

export type MetricType = 
  | 'reaction_time'
  | 'accuracy'
  | 'persistence'
  | 'impulsivity'
  | 'decision_latency'
  | 'emotional_response'
  | 'completion_rate'
  | 'error_rate'
  | 'span_length'
  | 'flexibility_score'
  | 'independence_level'
  | 'prompt_level';

export interface DataPointContext {
  difficulty?: number;
  sessionNumber?: number;
  domain?: string;
  ageGroup?: string;
  frustrationDetected?: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export interface DatasetFilter {
  childId?: string;
  activityTypes?: BehavioralDataPoint['activityType'][];
  metricTypes?: MetricType[];
  dateFrom?: string;
  dateTo?: string;
  domain?: string;
}

export interface DatasetSummary {
  totalDataPoints: number;
  uniqueChildren: number;
  dateRange: { from: string; to: string };
  byActivityType: Record<string, number>;
  byMetricType: Record<string, number>;
  avgMetricValues: Record<string, number>;
}

// ─── Factory ──────────────────────────────────────────────

let counter = 0;

export function createDataPoint(
  childId: string,
  activityType: BehavioralDataPoint['activityType'],
  activityId: string,
  metricType: MetricType,
  metricValue: number,
  context: DataPointContext = {}
): BehavioralDataPoint {
  return {
    id: `dp_${Date.now()}_${++counter}`,
    childId,
    timestamp: new Date().toISOString(),
    activityType,
    activityId,
    metricType,
    metricValue,
    context: {
      ...context,
      timeOfDay: getTimeOfDay(),
    },
  };
}

function getTimeOfDay(): DataPointContext['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// ─── Filter ───────────────────────────────────────────────

export function filterDataset(
  data: BehavioralDataPoint[],
  filter: DatasetFilter
): BehavioralDataPoint[] {
  return data.filter(dp => {
    if (filter.childId && dp.childId !== filter.childId) return false;
    if (filter.activityTypes && !filter.activityTypes.includes(dp.activityType)) return false;
    if (filter.metricTypes && !filter.metricTypes.includes(dp.metricType)) return false;
    if (filter.dateFrom && dp.timestamp < filter.dateFrom) return false;
    if (filter.dateTo && dp.timestamp > filter.dateTo) return false;
    if (filter.domain && dp.context.domain !== filter.domain) return false;
    return true;
  });
}

// ─── Summary ──────────────────────────────────────────────

export function summarizeDataset(data: BehavioralDataPoint[]): DatasetSummary {
  if (data.length === 0) {
    return {
      totalDataPoints: 0,
      uniqueChildren: 0,
      dateRange: { from: '', to: '' },
      byActivityType: {},
      byMetricType: {},
      avgMetricValues: {},
    };
  }

  const children = new Set(data.map(d => d.childId));
  const sorted = [...data].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const byActivityType: Record<string, number> = {};
  const byMetricType: Record<string, number> = {};
  const metricSums: Record<string, { sum: number; count: number }> = {};

  for (const dp of data) {
    byActivityType[dp.activityType] = (byActivityType[dp.activityType] || 0) + 1;
    byMetricType[dp.metricType] = (byMetricType[dp.metricType] || 0) + 1;
    
    if (!metricSums[dp.metricType]) metricSums[dp.metricType] = { sum: 0, count: 0 };
    metricSums[dp.metricType].sum += dp.metricValue;
    metricSums[dp.metricType].count++;
  }

  const avgMetricValues: Record<string, number> = {};
  for (const [key, { sum, count }] of Object.entries(metricSums)) {
    avgMetricValues[key] = Math.round((sum / count) * 100) / 100;
  }

  return {
    totalDataPoints: data.length,
    uniqueChildren: children.size,
    dateRange: { from: sorted[0].timestamp, to: sorted[sorted.length - 1].timestamp },
    byActivityType,
    byMetricType,
    avgMetricValues,
  };
}
