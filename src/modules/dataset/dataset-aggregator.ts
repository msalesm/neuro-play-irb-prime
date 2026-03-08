/**
 * Dataset Aggregator
 * 
 * Aggregates data from multiple platform sources into unified child profiles.
 */

import type { BehavioralDataPoint, MetricType } from './behavioral-dataset';

// ─── Types ────────────────────────────────────────────────

export interface AggregatedChildData {
  childId: string;
  aggregatedAt: string;
  totalDataPoints: number;
  sources: DataSourceContribution[];
  metrics: AggregatedMetric[];
  temporalPattern: TemporalPattern;
}

export interface DataSourceContribution {
  source: 'game' | 'aba' | 'routine' | 'story' | 'screening';
  dataPoints: number;
  percentage: number;
  lastActivity: string;
}

export interface AggregatedMetric {
  metricType: MetricType;
  latestValue: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  sampleSize: number;
}

export interface TemporalPattern {
  mostActiveTime: 'morning' | 'afternoon' | 'evening';
  avgSessionsPerWeek: number;
  consistencyScore: number; // 0-100
  longestStreak: number; // days
}

// ─── Aggregator ───────────────────────────────────────────

export function aggregateChildData(
  childId: string,
  dataPoints: BehavioralDataPoint[]
): AggregatedChildData {
  const childData = dataPoints.filter(dp => dp.childId === childId);
  
  if (childData.length === 0) {
    return {
      childId,
      aggregatedAt: new Date().toISOString(),
      totalDataPoints: 0,
      sources: [],
      metrics: [],
      temporalPattern: {
        mostActiveTime: 'afternoon',
        avgSessionsPerWeek: 0,
        consistencyScore: 0,
        longestStreak: 0,
      },
    };
  }

  return {
    childId,
    aggregatedAt: new Date().toISOString(),
    totalDataPoints: childData.length,
    sources: calculateSourceContributions(childData),
    metrics: calculateAggregatedMetrics(childData),
    temporalPattern: calculateTemporalPattern(childData),
  };
}

// ─── Source Contributions ─────────────────────────────────

function calculateSourceContributions(data: BehavioralDataPoint[]): DataSourceContribution[] {
  const bySource = new Map<string, BehavioralDataPoint[]>();
  for (const dp of data) {
    const arr = bySource.get(dp.activityType) || [];
    arr.push(dp);
    bySource.set(dp.activityType, arr);
  }

  return Array.from(bySource.entries()).map(([source, points]) => ({
    source: source as DataSourceContribution['source'],
    dataPoints: points.length,
    percentage: Math.round((points.length / data.length) * 100),
    lastActivity: points.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp,
  }));
}

// ─── Metric Aggregation ───────────────────────────────────

function calculateAggregatedMetrics(data: BehavioralDataPoint[]): AggregatedMetric[] {
  const byMetric = new Map<MetricType, BehavioralDataPoint[]>();
  for (const dp of data) {
    const arr = byMetric.get(dp.metricType) || [];
    arr.push(dp);
    byMetric.set(dp.metricType, arr);
  }

  return Array.from(byMetric.entries()).map(([metricType, points]) => {
    const sorted = [...points].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const values = sorted.map(p => p.metricValue);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Trend: compare first third vs last third
    let trend: AggregatedMetric['trendDirection'] = 'stable';
    if (values.length >= 6) {
      const third = Math.floor(values.length / 3);
      const earlyAvg = values.slice(0, third).reduce((a, b) => a + b, 0) / third;
      const lateAvg = values.slice(-third).reduce((a, b) => a + b, 0) / third;
      const diff = lateAvg - earlyAvg;
      
      // For metrics where higher is better (accuracy, persistence)
      const higherIsBetter = ['accuracy', 'persistence', 'completion_rate', 'span_length', 'independence_level'].includes(metricType);
      if (higherIsBetter) {
        trend = diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'stable';
      } else {
        // reaction_time, impulsivity, error_rate — lower is better
        trend = diff < -5 ? 'improving' : diff > 5 ? 'declining' : 'stable';
      }
    }

    return {
      metricType,
      latestValue: values[values.length - 1],
      averageValue: Math.round(avg * 100) / 100,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      trendDirection: trend,
      sampleSize: values.length,
    };
  });
}

// ─── Temporal Patterns ────────────────────────────────────

function calculateTemporalPattern(data: BehavioralDataPoint[]): TemporalPattern {
  // Most active time of day
  const timeCounts = { morning: 0, afternoon: 0, evening: 0 };
  for (const dp of data) {
    const tod = dp.context.timeOfDay || 'afternoon';
    timeCounts[tod]++;
  }
  const mostActiveTime = (Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0][0]) as TemporalPattern['mostActiveTime'];

  // Sessions per week
  const dates = [...new Set(data.map(dp => dp.timestamp.slice(0, 10)))].sort();
  const firstDate = new Date(dates[0]);
  const lastDate = new Date(dates[dates.length - 1]);
  const weeks = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const avgSessionsPerWeek = Math.round((dates.length / weeks) * 10) / 10;

  // Consistency: how regular are the sessions
  const gaps: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / (24 * 60 * 60 * 1000);
    gaps.push(diff);
  }
  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 7;
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (avgGap - 1) * 15)));

  // Longest streak (consecutive days)
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / (24 * 60 * 60 * 1000);
    if (diff <= 1.5) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return { mostActiveTime, avgSessionsPerWeek, consistencyScore, longestStreak };
}

// ─── Completeness ─────────────────────────────────────────

export function calculateDataCompleteness(
  data: BehavioralDataPoint[]
): { overall: number; bySource: Record<string, boolean> } {
  const sources = {
    game: data.some(d => d.activityType === 'game'),
    aba: data.some(d => d.activityType === 'aba'),
    routine: data.some(d => d.activityType === 'routine'),
    story: data.some(d => d.activityType === 'story'),
  };

  const overall = Object.values(sources).filter(Boolean).length / Object.keys(sources).length;
  return { overall, bySource: sources };
}
