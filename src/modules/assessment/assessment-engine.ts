/**
 * Assessment Engine
 * 
 * Evaluates cognitive abilities by wrapping the deterministic cognitive engine
 * with a structured assessment API.
 */

import {
  calculateDomainScores,
  classify,
  detectBehaviorPatterns,
  calculateEvolutionTrend,
  type CognitiveDomainScores,
} from '@/modules/games/cognitive-engine';
import type { GamePerformanceData } from '@/types/cognitive-analysis';

// ─── Types ────────────────────────────────────────────────

export interface DomainAssessment {
  domain: string;
  domainLabel: string;
  score: number;                    // 0-100
  classification: 'adequate' | 'monitoring' | 'attention' | 'intervention';
  percentile: number;
  trend: 'improving' | 'stable' | 'declining';
  dataPoints: number;
  interpretation: string;
}

export interface AssessmentResult {
  childId: string;
  ageGroup: string;
  assessedAt: string;
  overallScore: number;
  domains: DomainAssessment[];
  behavioralIndicators: string[];
  strengths: string[];
  areasForDevelopment: string[];
  completeness: number;             // 0-1
  isValid: boolean;                 // true if enough data
}

export interface AssessmentSummary {
  overallScore: number;
  classification: string;
  topStrength: string | null;
  primaryConcern: string | null;
  dataCompleteness: string;
  recommendedActions: string[];
}

// ─── Domain Labels ────────────────────────────────────────

const DOMAIN_LABELS: Record<keyof CognitiveDomainScores, string> = {
  attention: 'Atenção Sustentada',
  inhibition: 'Controle Inibitório',
  memory: 'Memória Operacional',
  flexibility: 'Flexibilidade Cognitiva',
  coordination: 'Coordenação Visuomotora',
  persistence: 'Persistência Comportamental',
};

const BATTERY_DOMAINS: (keyof CognitiveDomainScores)[] = [
  'attention', 'inhibition', 'memory', 'flexibility', 'coordination', 'persistence'
];

// ─── Assessment Runner ────────────────────────────────────

export function runCognitiveAssessment(
  childId: string,
  performanceData: GamePerformanceData[],
  ageGroup: string = '7-9',
  previousScores?: CognitiveDomainScores
): AssessmentResult {
  const scores = calculateDomainScores(performanceData, ageGroup);
  const indicators = detectBehaviorPatterns(scores, performanceData);
  const trend = calculateEvolutionTrend(scores, previousScores);

  // Count which battery tasks have data
  const coveredDomains = new Set<string>();
  for (const data of performanceData) {
    const id = data.gameId.toLowerCase();
    if (id.includes('attention')) coveredDomains.add('attention');
    if (id.includes('inhibit') || id.includes('foco')) coveredDomains.add('inhibition');
    if (id.includes('memory') || id.includes('sequence')) coveredDomains.add('memory');
    if (id.includes('flexib')) coveredDomains.add('flexibility');
    if (id.includes('coordination') || id.includes('touch')) coveredDomains.add('coordination');
    if (id.includes('persist')) coveredDomains.add('persistence');
  }

  const completeness = coveredDomains.size / BATTERY_DOMAINS.length;
  const isValid = completeness >= 0.5 && performanceData.length >= 3;

  const domains: DomainAssessment[] = BATTERY_DOMAINS.map(key => {
    const score = scores[key];
    const zScore = (score - 50) / 10;
    const percentile = Math.round(normalCDF(zScore) * 100);

    return {
      domain: key,
      domainLabel: DOMAIN_LABELS[key],
      score,
      classification: classify(score),
      percentile,
      trend: trend,
      dataPoints: coveredDomains.has(key) ? performanceData.length : 0,
      interpretation: generateDomainInterpretation(key, score, ageGroup),
    };
  });

  const overallScore = Math.round(
    domains.reduce((sum, d) => sum + d.score, 0) / domains.length
  );

  const strengths = domains
    .filter(d => d.classification === 'adequate')
    .map(d => d.domainLabel);

  const areasForDevelopment = domains
    .filter(d => d.classification === 'attention' || d.classification === 'intervention')
    .map(d => d.domainLabel);

  return {
    childId,
    ageGroup,
    assessedAt: new Date().toISOString(),
    overallScore,
    domains,
    behavioralIndicators: indicators.filter(i => i.observed).map(i => i.indicator),
    strengths,
    areasForDevelopment,
    completeness,
    isValid,
  };
}

// ─── Summary Generator ────────────────────────────────────

export function generateAssessmentSummary(result: AssessmentResult): AssessmentSummary {
  const overallClassification = result.overallScore >= 65 ? 'Adequado'
    : result.overallScore >= 50 ? 'Monitoramento'
    : result.overallScore >= 35 ? 'Atenção' : 'Intervenção';

  const actions: string[] = [];
  if (result.areasForDevelopment.length > 0) {
    actions.push(`Focar estimulação em: ${result.areasForDevelopment.join(', ')}`);
  }
  if (!result.isValid) {
    actions.push('Completar mais atividades da bateria para avaliação confiável');
  }
  if (result.overallScore < 40) {
    actions.push('Considerar avaliação aprofundada por profissional qualificado');
  }
  if (actions.length === 0) {
    actions.push('Manter rotina de estimulação variada');
  }

  return {
    overallScore: result.overallScore,
    classification: overallClassification,
    topStrength: result.strengths[0] || null,
    primaryConcern: result.areasForDevelopment[0] || null,
    dataCompleteness: `${Math.round(result.completeness * 100)}%`,
    recommendedActions: actions,
  };
}

// ─── Completeness Check ───────────────────────────────────

export function getAssessmentCompleteness(
  completedGameIds: string[]
): { completeness: number; missingDomains: string[]; completedDomains: string[] } {
  const domainGameMap: Record<string, string[]> = {
    'Atenção Sustentada': ['attention-sustained'],
    'Controle Inibitório': ['inhibitory-control', 'executive-processing'],
    'Memória Operacional': ['working-memory', 'cosmic-sequence'],
    'Flexibilidade Cognitiva': ['cognitive-flexibility'],
    'Coordenação Visuomotora': ['visuomotor-coordination'],
    'Persistência Comportamental': ['behavioral-persistence'],
  };

  const completedDomains: string[] = [];
  const missingDomains: string[] = [];

  for (const [domain, gameIds] of Object.entries(domainGameMap)) {
    const hasData = gameIds.some(gid => 
      completedGameIds.some(cid => cid.toLowerCase().includes(gid))
    );
    if (hasData) completedDomains.push(domain);
    else missingDomains.push(domain);
  }

  return {
    completeness: completedDomains.length / Object.keys(domainGameMap).length,
    missingDomains,
    completedDomains,
  };
}

// ─── Helpers ──────────────────────────────────────────────

function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function generateDomainInterpretation(
  domain: keyof CognitiveDomainScores,
  score: number,
  ageGroup: string
): string {
  const label = DOMAIN_LABELS[domain];
  const classification = classify(score);
  
  const classText: Record<string, string> = {
    adequate: 'dentro do esperado para a faixa etária',
    monitoring: 'na faixa limítrofe, sugerindo monitoramento',
    attention: 'abaixo do esperado, requerendo atenção direcionada',
    intervention: 'significativamente abaixo do esperado, sugerindo intervenção',
  };

  return `${label}: Score ${score}/100 — ${classText[classification]} (faixa ${ageGroup} anos).`;
}
