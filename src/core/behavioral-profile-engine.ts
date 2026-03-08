/**
 * Unified Behavioral Profile Engine
 * 
 * Integrates data from games, ABA, routines, and stories
 * to generate a comprehensive behavioral profile.
 * NO clinical diagnoses - educational/behavioral profiles only.
 */

import type { CognitiveDomain, GameMetrics } from './game-engine';
import type { SocioemotionalMetrics } from '@/hooks/useStoryEngine';
import type { ExecutiveMetrics } from '@/hooks/useExecutiveRoutine';

// ─── Types ────────────────────────────────────────────────

export interface UnifiedProfile {
  childId: string;
  generatedAt: string;
  overallScore: number; // 0-100
  
  // Core cognitive domains (from games)
  cognitive: {
    attention: DomainScore;
    inhibition: DomainScore;
    memory: DomainScore;
    flexibility: DomainScore;
    coordination: DomainScore;
    persistence: DomainScore;
  };
  
  // Socioemotional (from stories + social scenarios)
  socioemotional: {
    empathy: DomainScore;
    impulseControl: DomainScore;
    socialFlexibility: DomainScore;
    frustrationTolerance: DomainScore;
    emotionalRegulation: DomainScore;
  };
  
  // Executive function (from routines)
  executive: {
    organization: DomainScore;
    autonomy: DomainScore;
    taskInitiation: DomainScore;
    completion: DomainScore;
  };
  
  // ABA progress (from ABA module)
  aba?: {
    overallIndependence: number; // 0-100
    activePrograms: number;
    masteredSkills: number;
    trendDirection: 'up' | 'stable' | 'down';
  };
  
  // Meta-analysis
  strengths: string[];
  areasForDevelopment: string[];
  recommendations: string[];
  evolutionTrend: 'improving' | 'stable' | 'declining';
  dataCompleteness: number; // 0-1 how much data we have
}

export interface DomainScore {
  score: number; // 0-100
  classification: 'adequate' | 'monitoring' | 'attention' | 'intervention';
  trend: 'up' | 'stable' | 'down';
  dataPoints: number; // how many data points we used
}

export interface ProfileDataSources {
  gameMetrics?: Array<{ gameId: string; date: string; metrics: Partial<GameMetrics> }>;
  storyMetrics?: SocioemotionalMetrics;
  routineMetrics?: ExecutiveMetrics;
  abaData?: {
    independencePercentage: number;
    activePrograms: number;
    masteredSkills: number;
    trend: 'up' | 'stable' | 'down';
  };
}

// ─── Classification Logic ─────────────────────────────────

function classifyScore(score: number): DomainScore['classification'] {
  if (score >= 75) return 'adequate';
  if (score >= 50) return 'monitoring';
  if (score >= 25) return 'attention';
  return 'intervention';
}

function determineTrend(values: number[]): DomainScore['trend'] {
  if (values.length < 3) return 'stable';
  
  const recent = values.slice(-3);
  const earlier = values.slice(0, 3);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  
  const diff = recentAvg - earlierAvg;
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

function makeDomainScore(score: number, dataPoints = 1, trend: DomainScore['trend'] = 'stable'): DomainScore {
  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    classification: classifyScore(score),
    trend,
    dataPoints,
  };
}

// ─── Profile Generation ───────────────────────────────────

export function generateUnifiedProfile(
  childId: string,
  sources: ProfileDataSources
): UnifiedProfile {
  const now = new Date().toISOString();
  
  // Calculate cognitive domain scores from game metrics
  const cognitive = calculateCognitiveDomains(sources.gameMetrics || []);
  
  // Calculate socioemotional scores from stories
  const socioemotional = calculateSocioemotionalDomains(sources.storyMetrics);
  
  // Calculate executive function scores from routines
  const executive = calculateExecutiveDomains(sources.routineMetrics);
  
  // Calculate data completeness
  const hasGames = (sources.gameMetrics?.length || 0) > 0;
  const hasStories = !!sources.storyMetrics;
  const hasRoutines = !!sources.routineMetrics;
  const hasAba = !!sources.abaData;
  const dataCompleteness = [hasGames, hasStories, hasRoutines, hasAba].filter(Boolean).length / 4;
  
  // Calculate overall score (weighted)
  const cogScores = Object.values(cognitive).map(d => d.score);
  const socScores = Object.values(socioemotional).map(d => d.score);
  const execScores = Object.values(executive).map(d => d.score);
  
  const cogAvg = cogScores.length > 0 ? cogScores.reduce((a, b) => a + b, 0) / cogScores.length : 50;
  const socAvg = socScores.length > 0 ? socScores.reduce((a, b) => a + b, 0) / socScores.length : 50;
  const execAvg = execScores.length > 0 ? execScores.reduce((a, b) => a + b, 0) / execScores.length : 50;
  
  const overallScore = Math.round(cogAvg * 0.4 + socAvg * 0.3 + execAvg * 0.3);
  
  // Determine strengths and areas for development
  const allDomains: Array<{ name: string; score: number }> = [
    ...Object.entries(cognitive).map(([k, v]) => ({ name: translateDomain(k), score: v.score })),
    ...Object.entries(socioemotional).map(([k, v]) => ({ name: translateDomain(k), score: v.score })),
    ...Object.entries(executive).map(([k, v]) => ({ name: translateDomain(k), score: v.score })),
  ];
  
  const strengths = allDomains
    .filter(d => d.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => d.name);
  
  const areasForDevelopment = allDomains
    .filter(d => d.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(d => d.name);
  
  const recommendations = generateRecommendations(cognitive, socioemotional, executive);
  
  // Overall evolution trend
  const allTrends = [
    ...Object.values(cognitive).map(d => d.trend),
    ...Object.values(socioemotional).map(d => d.trend),
    ...Object.values(executive).map(d => d.trend),
  ];
  const upCount = allTrends.filter(t => t === 'up').length;
  const downCount = allTrends.filter(t => t === 'down').length;
  const evolutionTrend = upCount > downCount ? 'improving' : downCount > upCount ? 'declining' : 'stable';
  
  return {
    childId,
    generatedAt: now,
    overallScore,
    cognitive,
    socioemotional,
    executive,
    aba: sources.abaData ? {
      overallIndependence: sources.abaData.independencePercentage,
      activePrograms: sources.abaData.activePrograms,
      masteredSkills: sources.abaData.masteredSkills,
      trendDirection: sources.abaData.trend,
    } : undefined,
    strengths,
    areasForDevelopment,
    recommendations,
    evolutionTrend,
    dataCompleteness,
  };
}

// ─── Domain Calculators ───────────────────────────────────

function calculateCognitiveDomains(
  gameData: ProfileDataSources['gameMetrics']
): UnifiedProfile['cognitive'] {
  if (!gameData || gameData.length === 0) {
    return {
      attention: makeDomainScore(50, 0),
      inhibition: makeDomainScore(50, 0),
      memory: makeDomainScore(50, 0),
      flexibility: makeDomainScore(50, 0),
      coordination: makeDomainScore(50, 0),
      persistence: makeDomainScore(50, 0),
    };
  }
  
  const accuracies = gameData.map(g => (g.metrics.accuracy || 0) * 100);
  const trend = determineTrend(accuracies);
  
  const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  
  return {
    attention: makeDomainScore(avgAccuracy, gameData.length, trend),
    inhibition: makeDomainScore(avgAccuracy * 0.9, gameData.length, trend),
    memory: makeDomainScore(avgAccuracy * 0.95, gameData.length, trend),
    flexibility: makeDomainScore(avgAccuracy * 0.85, gameData.length, trend),
    coordination: makeDomainScore(avgAccuracy * 0.9, gameData.length, trend),
    persistence: makeDomainScore(avgAccuracy * 0.95, gameData.length, trend),
  };
}

function calculateSocioemotionalDomains(
  storyMetrics?: SocioemotionalMetrics
): UnifiedProfile['socioemotional'] {
  if (!storyMetrics) {
    return {
      empathy: makeDomainScore(50, 0),
      impulseControl: makeDomainScore(50, 0),
      socialFlexibility: makeDomainScore(50, 0),
      frustrationTolerance: makeDomainScore(50, 0),
      emotionalRegulation: makeDomainScore(50, 0),
    };
  }
  
  return {
    empathy: makeDomainScore(storyMetrics.empathyScore, storyMetrics.totalDecisions),
    impulseControl: makeDomainScore(storyMetrics.impulseControlScore, storyMetrics.totalDecisions),
    socialFlexibility: makeDomainScore(storyMetrics.socialFlexibilityScore, storyMetrics.totalDecisions),
    frustrationTolerance: makeDomainScore(storyMetrics.frustrationToleranceScore, storyMetrics.totalDecisions),
    emotionalRegulation: makeDomainScore(storyMetrics.overallScore, storyMetrics.totalDecisions),
  };
}

function calculateExecutiveDomains(
  routineMetrics?: ExecutiveMetrics
): UnifiedProfile['executive'] {
  if (!routineMetrics) {
    return {
      organization: makeDomainScore(50, 0),
      autonomy: makeDomainScore(50, 0),
      taskInitiation: makeDomainScore(50, 0),
      completion: makeDomainScore(50, 0),
    };
  }
  
  return {
    organization: makeDomainScore(routineMetrics.organizationIndex, routineMetrics.totalExecutions),
    autonomy: makeDomainScore(routineMetrics.autonomyScore, routineMetrics.totalExecutions),
    taskInitiation: makeDomainScore(100 - routineMetrics.avgLatencySeconds / 3, routineMetrics.totalExecutions),
    completion: makeDomainScore(routineMetrics.completionRate, routineMetrics.totalExecutions),
  };
}

// ─── Helpers ──────────────────────────────────────────────

function translateDomain(key: string): string {
  const map: Record<string, string> = {
    attention: 'Atenção',
    inhibition: 'Controle Inibitório',
    memory: 'Memória de Trabalho',
    flexibility: 'Flexibilidade Cognitiva',
    coordination: 'Coordenação Visomotora',
    persistence: 'Persistência',
    empathy: 'Empatia',
    impulseControl: 'Controle de Impulsos',
    socialFlexibility: 'Flexibilidade Social',
    frustrationTolerance: 'Tolerância à Frustração',
    emotionalRegulation: 'Regulação Emocional',
    organization: 'Organização',
    autonomy: 'Autonomia',
    taskInitiation: 'Iniciação de Tarefa',
    completion: 'Conclusão de Tarefas',
  };
  return map[key] || key;
}

function generateRecommendations(
  cognitive: UnifiedProfile['cognitive'],
  socioemotional: UnifiedProfile['socioemotional'],
  executive: UnifiedProfile['executive']
): string[] {
  const recs: string[] = [];
  
  if (cognitive.attention.classification === 'intervention' || cognitive.attention.classification === 'attention') {
    recs.push('Realizar atividades de atenção sustentada com duração progressiva');
  }
  if (cognitive.memory.classification === 'intervention' || cognitive.memory.classification === 'attention') {
    recs.push('Treinar memória de trabalho com jogos de sequência e span');
  }
  if (cognitive.flexibility.classification === 'intervention') {
    recs.push('Introduzir atividades de alternância e resolução de problemas');
  }
  if (socioemotional.empathy.score < 50) {
    recs.push('Utilizar histórias sociais focadas em perspectiva do outro');
  }
  if (socioemotional.impulseControl.score < 50) {
    recs.push('Praticar jogos de controle inibitório tipo Go/No-Go');
  }
  if (executive.organization.score < 50) {
    recs.push('Implementar rotina visual estruturada com apoio gradual');
  }
  if (executive.autonomy.score < 50) {
    recs.push('Reduzir gradualmente lembretes e prompts nas rotinas');
  }
  
  if (recs.length === 0) {
    recs.push('Manter nível atual de estimulação com atividades variadas');
  }
  
  return recs;
}
