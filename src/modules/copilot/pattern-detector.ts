/**
 * Pattern Detector
 * 
 * Detects behavioral patterns across multi-source data streams:
 * games, ABA, routines, stories, assessments.
 * 
 * Core intelligence layer of the NeuroPlay Copilot.
 */

import type { BehavioralDataPoint, MetricType } from '@/modules/dataset/behavioral-dataset';

// ─── Types ────────────────────────────────────────────────

export interface DetectedPattern {
  id: string;
  childId: string;
  patternType: PatternType;
  domain: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;              // 0-1
  direction: 'improving' | 'stable' | 'declining' | 'volatile';
  magnitude: number;               // % change
  detectedAt: string;
  dataWindow: { start: string; end: string };
  supportingMetrics: SupportingMetric[];
  description: string;
  clinicalRelevance: string;
}

export type PatternType =
  | 'attention_decline'
  | 'attention_improvement'
  | 'persistence_drop'
  | 'persistence_growth'
  | 'memory_regression'
  | 'memory_improvement'
  | 'impulsivity_increase'
  | 'impulsivity_decrease'
  | 'emotional_dysregulation'
  | 'emotional_regulation_gain'
  | 'engagement_drop'
  | 'engagement_increase'
  | 'frustration_escalation'
  | 'flexibility_decline'
  | 'flexibility_improvement'
  | 'global_regression'
  | 'global_progress'
  | 'plateau_detected'
  | 'inconsistent_performance';

export interface SupportingMetric {
  metricType: MetricType;
  source: string;
  baseline: number;
  current: number;
  change: number;          // % change
  dataPoints: number;
}

export interface PatternDetectionConfig {
  windowDays: number;
  minDataPoints: number;
  significanceThreshold: number;   // minimum % change to flag
  volatilityThreshold: number;
}

// ─── Default Config ───────────────────────────────────────

const DEFAULT_CONFIG: PatternDetectionConfig = {
  windowDays: 14,
  minDataPoints: 5,
  significanceThreshold: 15,
  volatilityThreshold: 25,
};

// ─── Detection Engine ─────────────────────────────────────

export function detectPatterns(
  dataPoints: BehavioralDataPoint[],
  childId: string,
  config: Partial<PatternDetectionConfig> = {}
): DetectedPattern[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const patterns: DetectedPattern[] = [];

  if (dataPoints.length < cfg.minDataPoints) return patterns;

  const now = new Date();
  const windowStart = new Date(now.getTime() - cfg.windowDays * 24 * 60 * 60 * 1000);
  
  const recentData = dataPoints.filter(dp =>
    dp.childId === childId && new Date(dp.timestamp) >= windowStart
  );

  if (recentData.length < cfg.minDataPoints) return patterns;

  // Group by domain-relevant metric types
  const domainMetrics: Record<string, MetricType[]> = {
    attention: ['reaction_time', 'accuracy', 'persistence'],
    memory: ['span_length', 'accuracy'],
    flexibility: ['flexibility_score', 'decision_latency'],
    persistence: ['persistence', 'completion_rate'],
    impulsivity: ['impulsivity', 'reaction_time', 'error_rate'],
    emotional: ['emotional_response'],
    independence: ['independence_level', 'prompt_level'],
  };

  for (const [domain, metrics] of Object.entries(domainMetrics)) {
    const domainData = recentData.filter(dp => metrics.includes(dp.metricType));
    if (domainData.length < cfg.minDataPoints) continue;

    const trend = computeTrend(domainData);
    const volatility = computeVolatility(domainData);

    if (Math.abs(trend.change) >= cfg.significanceThreshold) {
      const isPositive = isDomainImprovementPositive(domain, trend.change, domainData[0]?.metricType);
      
      patterns.push({
        id: `pattern_${childId}_${domain}_${Date.now()}`,
        childId,
        patternType: getPatternType(domain, isPositive),
        domain,
        severity: getSeverity(Math.abs(trend.change), isPositive),
        confidence: Math.min(1, domainData.length / (cfg.minDataPoints * 3)),
        direction: isPositive ? 'improving' : 'declining',
        magnitude: Math.abs(trend.change),
        detectedAt: now.toISOString(),
        dataWindow: {
          start: windowStart.toISOString(),
          end: now.toISOString(),
        },
        supportingMetrics: buildSupportingMetrics(domainData, metrics),
        description: generateDescription(domain, trend.change, isPositive),
        clinicalRelevance: generateClinicalRelevance(domain, trend.change, isPositive),
      });
    }

    // Detect volatility (inconsistent performance)
    if (volatility > cfg.volatilityThreshold) {
      patterns.push({
        id: `volatility_${childId}_${domain}_${Date.now()}`,
        childId,
        patternType: 'inconsistent_performance',
        domain,
        severity: 'warning',
        confidence: Math.min(1, domainData.length / (cfg.minDataPoints * 2)),
        direction: 'volatile',
        magnitude: volatility,
        detectedAt: now.toISOString(),
        dataWindow: { start: windowStart.toISOString(), end: now.toISOString() },
        supportingMetrics: buildSupportingMetrics(domainData, metrics),
        description: `Desempenho inconsistente em ${translateDomain(domain)} (variação de ${volatility.toFixed(0)}%)`,
        clinicalRelevance: `Inconsistência sugere possível influência de fatores externos ou dificuldade em estabilizar ${translateDomain(domain)}.`,
      });
    }

    // Detect plateau
    if (Math.abs(trend.change) < 5 && domainData.length >= cfg.minDataPoints * 2) {
      patterns.push({
        id: `plateau_${childId}_${domain}_${Date.now()}`,
        childId,
        patternType: 'plateau_detected',
        domain,
        severity: 'info',
        confidence: 0.7,
        direction: 'stable',
        magnitude: Math.abs(trend.change),
        detectedAt: now.toISOString(),
        dataWindow: { start: windowStart.toISOString(), end: now.toISOString() },
        supportingMetrics: buildSupportingMetrics(domainData, metrics),
        description: `Platô detectado em ${translateDomain(domain)} — sem progresso significativo`,
        clinicalRelevance: `Considerar mudança de estratégia de intervenção para ${translateDomain(domain)}.`,
      });
    }
  }

  // Global regression check
  const decliningPatterns = patterns.filter(p => p.direction === 'declining' && p.severity !== 'info');
  if (decliningPatterns.length >= 3) {
    patterns.push({
      id: `global_regression_${childId}_${Date.now()}`,
      childId,
      patternType: 'global_regression',
      domain: 'global',
      severity: 'critical',
      confidence: 0.85,
      direction: 'declining',
      magnitude: decliningPatterns.reduce((sum, p) => sum + p.magnitude, 0) / decliningPatterns.length,
      detectedAt: now.toISOString(),
      dataWindow: { start: windowStart.toISOString(), end: now.toISOString() },
      supportingMetrics: [],
      description: `Regressão global detectada em ${decliningPatterns.length} domínios simultaneamente`,
      clinicalRelevance: 'Declínio multi-domínio pode indicar fator externo significativo. Recomenda-se avaliação clínica imediata.',
    });
  }

  return patterns;
}

// ─── Helpers ──────────────────────────────────────────────

function computeTrend(data: BehavioralDataPoint[]): { change: number; slope: number } {
  if (data.length < 2) return { change: 0, slope: 0 };

  const sorted = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const avgFirst = firstHalf.reduce((s, d) => s + d.metricValue, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, d) => s + d.metricValue, 0) / secondHalf.length;

  const change = avgFirst === 0 ? 0 : ((avgSecond - avgFirst) / avgFirst) * 100;
  return { change, slope: avgSecond - avgFirst };
}

function computeVolatility(data: BehavioralDataPoint[]): number {
  if (data.length < 3) return 0;
  const values = data.map(d => d.metricValue);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : (stdDev / mean) * 100;
}

function isDomainImprovementPositive(domain: string, change: number, metricType?: MetricType): boolean {
  // For reaction_time, impulsivity, error_rate, prompt_level — lower is better
  const lowerIsBetter: MetricType[] = ['reaction_time', 'impulsivity', 'error_rate', 'prompt_level', 'decision_latency'];
  if (metricType && lowerIsBetter.includes(metricType)) return change < 0;
  return change > 0;
}

function getPatternType(domain: string, isPositive: boolean): PatternType {
  const map: Record<string, [PatternType, PatternType]> = {
    attention: ['attention_improvement', 'attention_decline'],
    memory: ['memory_improvement', 'memory_regression'],
    flexibility: ['flexibility_improvement', 'flexibility_decline'],
    persistence: ['persistence_growth', 'persistence_drop'],
    impulsivity: ['impulsivity_decrease', 'impulsivity_increase'],
    emotional: ['emotional_regulation_gain', 'emotional_dysregulation'],
    independence: ['global_progress', 'global_regression'],
  };
  const pair = map[domain] ?? ['global_progress', 'global_regression'];
  return isPositive ? pair[0] : pair[1];
}

function getSeverity(magnitude: number, isPositive: boolean): 'info' | 'warning' | 'critical' {
  if (isPositive) return magnitude > 30 ? 'info' : 'info';
  if (magnitude >= 30) return 'critical';
  if (magnitude >= 15) return 'warning';
  return 'info';
}

function buildSupportingMetrics(data: BehavioralDataPoint[], metrics: MetricType[]): SupportingMetric[] {
  return metrics.map(mt => {
    const filtered = data.filter(d => d.metricType === mt);
    if (filtered.length < 2) return null;
    const sorted = [...filtered].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const baseline = sorted[0].metricValue;
    const current = sorted[sorted.length - 1].metricValue;
    return {
      metricType: mt,
      source: sorted[0].activityType,
      baseline,
      current,
      change: baseline === 0 ? 0 : ((current - baseline) / baseline) * 100,
      dataPoints: filtered.length,
    };
  }).filter(Boolean) as SupportingMetric[];
}

function translateDomain(domain: string): string {
  const map: Record<string, string> = {
    attention: 'atenção',
    memory: 'memória',
    flexibility: 'flexibilidade cognitiva',
    persistence: 'persistência',
    impulsivity: 'controle inibitório',
    emotional: 'regulação emocional',
    independence: 'independência',
    global: 'desenvolvimento global',
  };
  return map[domain] ?? domain;
}

function generateDescription(domain: string, change: number, isPositive: boolean): string {
  const d = translateDomain(domain);
  const abs = Math.abs(change).toFixed(0);
  if (isPositive) return `${d.charAt(0).toUpperCase() + d.slice(1)} melhorou ${abs}% nas últimas 2 semanas`;
  return `${d.charAt(0).toUpperCase() + d.slice(1)} caiu ${abs}% nas últimas 2 semanas`;
}

function generateClinicalRelevance(domain: string, change: number, isPositive: boolean): string {
  if (isPositive) return `Progresso positivo em ${translateDomain(domain)}. Manter estratégia atual e considerar aumento gradual de complexidade.`;
  const abs = Math.abs(change);
  if (abs >= 30) return `Declínio significativo em ${translateDomain(domain)}. Recomenda-se avaliação clínica e possível ajuste de intervenção.`;
  return `Queda moderada em ${translateDomain(domain)}. Monitorar proximamente e considerar ajuste de dificuldade.`;
}
