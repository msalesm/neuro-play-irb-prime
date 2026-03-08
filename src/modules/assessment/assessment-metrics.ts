/**
 * Assessment Metrics
 * 
 * Tracks and aggregates cognitive assessment metrics over time.
 */

// ─── Types ────────────────────────────────────────────────

export interface AssessmentMetric {
  domain: string;
  score: number;
  measuredAt: string;
  sessionId?: string;
  gameId?: string;
}

export interface MetricTrend {
  domain: string;
  currentScore: number;
  previousScore: number | null;
  change: number;
  direction: 'improving' | 'stable' | 'declining';
  dataPoints: number;
  firstMeasured: string;
  lastMeasured: string;
}

export interface AggregatedMetrics {
  domain: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  sampleSize: number;
}

// ─── Trend Calculation ────────────────────────────────────

export function calculateMetricTrends(
  metrics: AssessmentMetric[]
): MetricTrend[] {
  // Group by domain
  const byDomain = new Map<string, AssessmentMetric[]>();
  for (const m of metrics) {
    const arr = byDomain.get(m.domain) || [];
    arr.push(m);
    byDomain.set(m.domain, arr);
  }

  const trends: MetricTrend[] = [];
  
  for (const [domain, domainMetrics] of byDomain.entries()) {
    const sorted = [...domainMetrics].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    const currentScore = sorted[sorted.length - 1].score;
    const previousScore = sorted.length >= 2 ? sorted[sorted.length - 2].score : null;
    
    let direction: MetricTrend['direction'] = 'stable';
    let change = 0;
    
    if (sorted.length >= 3) {
      const recent = sorted.slice(-3).map(s => s.score);
      const earlier = sorted.slice(0, Math.min(3, sorted.length - 3)).map(s => s.score);
      
      if (earlier.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        change = recentAvg - earlierAvg;
        direction = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
      }
    }

    trends.push({
      domain,
      currentScore,
      previousScore,
      change: Math.round(change * 10) / 10,
      direction,
      dataPoints: sorted.length,
      firstMeasured: sorted[0].measuredAt,
      lastMeasured: sorted[sorted.length - 1].measuredAt,
    });
  }

  return trends;
}

// ─── Aggregation ──────────────────────────────────────────

export function aggregateMetrics(
  metrics: AssessmentMetric[]
): AggregatedMetrics[] {
  const byDomain = new Map<string, number[]>();
  for (const m of metrics) {
    const arr = byDomain.get(m.domain) || [];
    arr.push(m.score);
    byDomain.set(m.domain, arr);
  }

  const results: AggregatedMetrics[] = [];
  
  for (const [domain, scores] of byDomain.entries()) {
    const sorted = [...scores].sort((a, b) => a - b);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

    results.push({
      domain,
      mean: Math.round(mean * 10) / 10,
      median: Math.round(median * 10) / 10,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      standardDeviation: Math.round(Math.sqrt(variance) * 10) / 10,
      sampleSize: scores.length,
    });
  }

  return results;
}
