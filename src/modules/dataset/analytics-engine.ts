/**
 * Analytics Engine
 * 
 * Generates insights and correlations from behavioral dataset.
 */

import type { BehavioralDataPoint } from './behavioral-dataset';

// ─── Types ────────────────────────────────────────────────

export interface AnalyticsInsight {
  id: string;
  type: 'correlation' | 'trend' | 'anomaly' | 'milestone';
  title: string;
  description: string;
  confidence: number; // 0-1
  dataPointsUsed: number;
  generatedAt: string;
}

export interface CorrelationResult {
  metricA: string;
  metricB: string;
  coefficient: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  interpretation: string;
  sampleSize: number;
}

// ─── Insight Generator ────────────────────────────────────

export function generateInsights(
  data: BehavioralDataPoint[],
  childId?: string
): AnalyticsInsight[] {
  const filtered = childId ? data.filter(d => d.childId === childId) : data;
  if (filtered.length < 10) return [];

  const insights: AnalyticsInsight[] = [];
  let id = 0;

  // Trend insights
  const trendInsights = detectTrends(filtered);
  insights.push(...trendInsights.map(t => ({ ...t, id: `insight_${++id}` })));

  // Anomaly detection
  const anomalies = detectAnomalies(filtered);
  insights.push(...anomalies.map(a => ({ ...a, id: `insight_${++id}` })));

  // Milestone detection
  const milestones = detectMilestones(filtered);
  insights.push(...milestones.map(m => ({ ...m, id: `insight_${++id}` })));

  // Temporal patterns
  const temporal = detectTemporalPatterns(filtered);
  insights.push(...temporal.map(t => ({ ...t, id: `insight_${++id}` })));

  return insights.sort((a, b) => b.confidence - a.confidence);
}

// ─── Correlation Calculator ───────────────────────────────

export function calculateCorrelation(
  data: BehavioralDataPoint[],
  metricA: string,
  metricB: string
): CorrelationResult {
  const pointsA = data.filter(d => d.metricType === metricA);
  const pointsB = data.filter(d => d.metricType === metricB);

  // Match by timestamp proximity (same session)
  const pairs: Array<[number, number]> = [];
  for (const a of pointsA) {
    const closest = pointsB.find(b => 
      b.childId === a.childId && 
      Math.abs(new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) < 3600000
    );
    if (closest) {
      pairs.push([a.metricValue, closest.metricValue]);
    }
  }

  if (pairs.length < 5) {
    return {
      metricA, metricB,
      coefficient: 0,
      strength: 'none',
      interpretation: 'Dados insuficientes para calcular correlação',
      sampleSize: pairs.length,
    };
  }

  const coefficient = pearsonCorrelation(pairs);
  const abs = Math.abs(coefficient);
  const strength: CorrelationResult['strength'] = 
    abs >= 0.7 ? 'strong' : abs >= 0.4 ? 'moderate' : abs >= 0.2 ? 'weak' : 'none';

  const direction = coefficient > 0 ? 'positiva' : 'negativa';
  const interpretation = strength === 'none'
    ? `Sem correlação significativa entre ${metricA} e ${metricB}`
    : `Correlação ${strength === 'strong' ? 'forte' : strength === 'moderate' ? 'moderada' : 'fraca'} ${direction} entre ${metricA} e ${metricB} (r=${coefficient.toFixed(2)})`;

  return { metricA, metricB, coefficient, strength, interpretation, sampleSize: pairs.length };
}

// ─── Internal Detection Functions ─────────────────────────

function detectTrends(data: BehavioralDataPoint[]): Omit<AnalyticsInsight, 'id'>[] {
  const insights: Omit<AnalyticsInsight, 'id'>[] = [];
  const now = new Date().toISOString();

  // Group by metric type and check trend
  const byMetric = new Map<string, number[]>();
  const sorted = [...data].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  
  for (const dp of sorted) {
    const arr = byMetric.get(dp.metricType) || [];
    arr.push(dp.metricValue);
    byMetric.set(dp.metricType, arr);
  }

  for (const [metric, values] of byMetric.entries()) {
    if (values.length < 5) continue;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(change) > 15) {
      const direction = change > 0 ? 'aumento' : 'redução';
      insights.push({
        type: 'trend',
        title: `Tendência em ${translateMetric(metric)}`,
        description: `${direction} de ${Math.abs(Math.round(change))}% observado ao longo de ${values.length} medições`,
        confidence: Math.min(0.9, values.length / 20),
        dataPointsUsed: values.length,
        generatedAt: now,
      });
    }
  }

  return insights;
}

function detectAnomalies(data: BehavioralDataPoint[]): Omit<AnalyticsInsight, 'id'>[] {
  const insights: Omit<AnalyticsInsight, 'id'>[] = [];
  const now = new Date().toISOString();

  // Check for sudden performance drops
  const byMetric = new Map<string, BehavioralDataPoint[]>();
  for (const dp of data) {
    const arr = byMetric.get(dp.metricType) || [];
    arr.push(dp);
    byMetric.set(dp.metricType, arr);
  }

  for (const [metric, points] of byMetric.entries()) {
    if (points.length < 5) continue;
    const sorted = [...points].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const values = sorted.map(p => p.metricValue);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);

    const lastValue = values[values.length - 1];
    if (sd > 0 && Math.abs(lastValue - mean) > 2 * sd) {
      insights.push({
        type: 'anomaly',
        title: `Valor atípico em ${translateMetric(metric)}`,
        description: `Última medição (${lastValue}) está ${lastValue > mean ? 'acima' : 'abaixo'} do padrão habitual`,
        confidence: 0.7,
        dataPointsUsed: values.length,
        generatedAt: now,
      });
    }
  }

  return insights;
}

function detectMilestones(data: BehavioralDataPoint[]): Omit<AnalyticsInsight, 'id'>[] {
  const insights: Omit<AnalyticsInsight, 'id'>[] = [];
  const now = new Date().toISOString();

  // Check total activities milestone
  const totalActivities = data.length;
  const milestones = [50, 100, 200, 500];
  for (const m of milestones) {
    if (totalActivities >= m && totalActivities < m + 10) {
      insights.push({
        type: 'milestone',
        title: `Marco: ${m} atividades registradas!`,
        description: `A criança completou ${m} registros de atividades na plataforma`,
        confidence: 1,
        dataPointsUsed: totalActivities,
        generatedAt: now,
      });
    }
  }

  return insights;
}

function detectTemporalPatterns(data: BehavioralDataPoint[]): Omit<AnalyticsInsight, 'id'>[] {
  const insights: Omit<AnalyticsInsight, 'id'>[] = [];
  const now = new Date().toISOString();

  // Check if performance varies by time of day
  const byTime: Record<string, number[]> = { morning: [], afternoon: [], evening: [] };
  for (const dp of data) {
    if (dp.metricType === 'accuracy' && dp.context.timeOfDay) {
      byTime[dp.context.timeOfDay].push(dp.metricValue);
    }
  }

  const avgByTime: Record<string, number> = {};
  for (const [time, values] of Object.entries(byTime)) {
    if (values.length >= 3) {
      avgByTime[time] = values.reduce((a, b) => a + b, 0) / values.length;
    }
  }

  const times = Object.entries(avgByTime);
  if (times.length >= 2) {
    const best = times.sort((a, b) => b[1] - a[1])[0];
    const worst = times[times.length - 1];
    const diff = best[1] - worst[1];

    if (diff > 10) {
      insights.push({
        type: 'correlation',
        title: 'Padrão de desempenho por horário',
        description: `Melhor desempenho no período da ${translateTimeOfDay(best[0])} (${Math.round(best[1])}%) vs ${translateTimeOfDay(worst[0])} (${Math.round(worst[1])}%)`,
        confidence: Math.min(0.8, data.length / 30),
        dataPointsUsed: data.filter(d => d.metricType === 'accuracy').length,
        generatedAt: now,
      });
    }
  }

  return insights;
}

// ─── Helpers ──────────────────────────────────────────────

function pearsonCorrelation(pairs: Array<[number, number]>): number {
  const n = pairs.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const [x, y] of pairs) {
    sumX += x; sumY += y;
    sumXY += x * y;
    sumX2 += x * x; sumY2 += y * y;
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
}

function translateMetric(m: string): string {
  const map: Record<string, string> = {
    reaction_time: 'tempo de reação',
    accuracy: 'taxa de acerto',
    persistence: 'persistência',
    impulsivity: 'impulsividade',
    decision_latency: 'tempo de decisão',
    emotional_response: 'resposta emocional',
    completion_rate: 'taxa de conclusão',
    error_rate: 'taxa de erro',
    span_length: 'span de memória',
    flexibility_score: 'flexibilidade',
    independence_level: 'nível de independência',
    prompt_level: 'nível de prompt',
  };
  return map[m] || m;
}

function translateTimeOfDay(t: string): string {
  return t === 'morning' ? 'manhã' : t === 'afternoon' ? 'tarde' : 'noite';
}
