/**
 * NeuroPlay Copilot Engine
 * 
 * The central intelligence orchestrator that integrates all data sources
 * (games, ABA, routines, stories, assessments) into a unified
 * child development intelligence system.
 * 
 * This is the most advanced module of NeuroPlay — producing continuous
 * behavioral diagnosis, personalized recommendations, automatic
 * activity adjustments, and early-warning alerts.
 */

import { detectPatterns, type DetectedPattern, type PatternDetectionConfig } from './pattern-detector';
import { generateInsights, type CopilotInsight } from './insight-generator';
import { generateCopilotRecommendations, type CopilotRecommendation } from './recommendation-generator';
import { generateAlerts, filterAlertsByRole, getActiveAlerts, getUrgentAlerts, type CopilotAlert } from './alert-system';
import type { BehavioralDataPoint } from '@/modules/dataset/behavioral-dataset';

// ─── Types ────────────────────────────────────────────────

export interface CopilotReport {
  childId: string;
  generatedAt: string;
  dataWindow: { start: string; end: string };
  dataPointsAnalyzed: number;

  // Core outputs
  patterns: DetectedPattern[];
  insights: CopilotInsight[];
  recommendations: CopilotRecommendation[];
  alerts: CopilotAlert[];

  // Summary
  summary: CopilotSummary;
}

export interface CopilotSummary {
  overallStatus: 'thriving' | 'progressing' | 'stable' | 'needs_attention' | 'needs_intervention';
  strengths: string[];
  concerns: string[];
  topPriorityAction: string;
  progressDomains: string[];
  declineDomains: string[];
  plateauDomains: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidenceScore: number;
}

export interface CopilotConfig {
  patternDetection?: Partial<PatternDetectionConfig>;
  maxInsightsPerDomain?: number;
  maxRecommendationsPerRole?: number;
  enableAlerts?: boolean;
}

// ─── Main Engine ──────────────────────────────────────────

/**
 * Runs the full Copilot pipeline for a child.
 * 
 * Flow:
 * 1. Pattern Detection — scans multi-source data for behavioral patterns
 * 2. Insight Generation — transforms patterns into human-readable insights
 * 3. Recommendation Generation — produces role-specific actionable recommendations
 * 4. Alert System — generates early-warning alerts for critical patterns
 * 5. Summary — synthesizes everything into an overall status report
 */
export function runCopilot(
  dataPoints: BehavioralDataPoint[],
  childId: string,
  config: CopilotConfig = {}
): CopilotReport {
  const now = new Date();
  const windowDays = config.patternDetection?.windowDays ?? 14;
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  // 1. Detect patterns
  const patterns = detectPatterns(dataPoints, childId, config.patternDetection);

  // 2. Generate insights
  const insights = generateInsights(patterns, childId);

  // 3. Generate recommendations
  const recommendations = generateCopilotRecommendations(insights, childId);

  // 4. Generate alerts
  const alerts = config.enableAlerts !== false
    ? generateAlerts(patterns, insights, childId)
    : [];

  // 5. Build summary
  const summary = buildSummary(patterns, insights, alerts);

  return {
    childId,
    generatedAt: now.toISOString(),
    dataWindow: {
      start: windowStart.toISOString(),
      end: now.toISOString(),
    },
    dataPointsAnalyzed: dataPoints.filter(dp => dp.childId === childId).length,
    patterns,
    insights,
    recommendations,
    alerts,
    summary,
  };
}

// ─── Role-Filtered Views ──────────────────────────────────

export function getCopilotForParent(report: CopilotReport): ParentCopilotView {
  return {
    childId: report.childId,
    generatedAt: report.generatedAt,
    status: report.summary.overallStatus,
    whatIsImproving: report.summary.progressDomains.map(translateDomain),
    whatNeedsSupport: report.summary.concerns,
    whatToDoAtHome: report.recommendations
      .filter(r => r.targetRole === 'parent')
      .map(r => ({
        title: r.title,
        description: r.description,
        steps: r.actionSteps.map(s => s.instruction),
        priority: r.priority,
      })),
    alerts: filterAlertsByRole(report.alerts, 'parent'),
    celebrations: report.insights
      .filter(i => i.insightType === 'progress_celebration')
      .map(i => ({ title: i.title, summary: i.summary })),
  };
}

export function getCopilotForTherapist(report: CopilotReport): TherapistCopilotView {
  return {
    childId: report.childId,
    generatedAt: report.generatedAt,
    summary: report.summary,
    patterns: report.patterns,
    insights: report.insights,
    recommendations: report.recommendations.filter(r => r.targetRole === 'therapist'),
    alerts: filterAlertsByRole(report.alerts, 'therapist'),
    urgentAlerts: getUrgentAlerts(report.alerts),
    clinicalActions: report.recommendations
      .filter(r => r.targetRole === 'therapist' && (r.priority === 'immediate' || r.priority === 'high'))
      .map(r => ({
        title: r.title,
        steps: r.actionSteps.map(s => s.instruction),
        priority: r.priority,
      })),
  };
}

export function getCopilotForTeacher(report: CopilotReport): TeacherCopilotView {
  return {
    childId: report.childId,
    generatedAt: report.generatedAt,
    status: report.summary.overallStatus,
    classroomStrategies: report.recommendations
      .filter(r => r.targetRole === 'teacher')
      .map(r => ({
        title: r.title,
        description: r.description,
        steps: r.actionSteps.map(s => s.instruction),
        frequency: r.frequency,
      })),
    alerts: filterAlertsByRole(report.alerts, 'teacher'),
    strengths: report.summary.strengths,
    needsSupport: report.summary.concerns,
  };
}

// ─── Class-Level Copilot ──────────────────────────────────

export function runClassCopilot(
  studentReports: CopilotReport[]
): ClassCopilotView {
  const statusCounts = { thriving: 0, progressing: 0, stable: 0, needs_attention: 0, needs_intervention: 0 };
  const allConcerns: string[] = [];
  const allStrengths: string[] = [];

  for (const report of studentReports) {
    statusCounts[report.summary.overallStatus]++;
    allConcerns.push(...report.summary.concerns);
    allStrengths.push(...report.summary.strengths);
  }

  // Find most common concerns
  const concernFreq = countFrequency(allConcerns);
  const strengthFreq = countFrequency(allStrengths);

  const urgentStudents = studentReports
    .filter(r => r.summary.riskLevel === 'high' || r.summary.riskLevel === 'critical')
    .map(r => r.childId);

  return {
    totalStudents: studentReports.length,
    statusDistribution: statusCounts,
    topConcerns: Object.entries(concernFreq).sort(([,a], [,b]) => b - a).slice(0, 5).map(([k]) => k),
    topStrengths: Object.entries(strengthFreq).sort(([,a], [,b]) => b - a).slice(0, 5).map(([k]) => k),
    studentsNeedingAttention: urgentStudents,
    classRecommendations: generateClassRecommendations(concernFreq),
    generatedAt: new Date().toISOString(),
  };
}

// ─── View Types ───────────────────────────────────────────

export interface ParentCopilotView {
  childId: string;
  generatedAt: string;
  status: string;
  whatIsImproving: string[];
  whatNeedsSupport: string[];
  whatToDoAtHome: { title: string; description: string; steps: string[]; priority: string }[];
  alerts: CopilotAlert[];
  celebrations: { title: string; summary: string }[];
}

export interface TherapistCopilotView {
  childId: string;
  generatedAt: string;
  summary: CopilotSummary;
  patterns: DetectedPattern[];
  insights: CopilotInsight[];
  recommendations: CopilotRecommendation[];
  alerts: CopilotAlert[];
  urgentAlerts: CopilotAlert[];
  clinicalActions: { title: string; steps: string[]; priority: string }[];
}

export interface TeacherCopilotView {
  childId: string;
  generatedAt: string;
  status: string;
  classroomStrategies: { title: string; description: string; steps: string[]; frequency: string }[];
  alerts: CopilotAlert[];
  strengths: string[];
  needsSupport: string[];
}

export interface ClassCopilotView {
  totalStudents: number;
  statusDistribution: Record<string, number>;
  topConcerns: string[];
  topStrengths: string[];
  studentsNeedingAttention: string[];
  classRecommendations: string[];
  generatedAt: string;
}

// ─── Summary Builder ──────────────────────────────────────

function buildSummary(
  patterns: DetectedPattern[],
  insights: CopilotInsight[],
  alerts: CopilotAlert[]
): CopilotSummary {
  const improving = patterns.filter(p => p.direction === 'improving');
  const declining = patterns.filter(p => p.direction === 'declining');
  const plateaus = patterns.filter(p => p.patternType === 'plateau_detected');
  const urgentAlerts = getUrgentAlerts(alerts);

  const progressDomains = [...new Set(improving.map(p => p.domain))];
  const declineDomains = [...new Set(declining.map(p => p.domain))];
  const plateauDomains = [...new Set(plateaus.map(p => p.domain))];

  // Determine overall status
  let overallStatus: CopilotSummary['overallStatus'];
  if (urgentAlerts.length > 0) overallStatus = 'needs_intervention';
  else if (declining.length > improving.length * 2) overallStatus = 'needs_attention';
  else if (improving.length > declining.length * 2) overallStatus = 'thriving';
  else if (improving.length > declining.length) overallStatus = 'progressing';
  else overallStatus = 'stable';

  // Risk level
  let riskLevel: CopilotSummary['riskLevel'] = 'low';
  if (urgentAlerts.length > 0) riskLevel = 'critical';
  else if (declining.length >= 3) riskLevel = 'high';
  else if (declining.length >= 1) riskLevel = 'moderate';

  // Confidence
  const avgConfidence = patterns.length > 0
    ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
    : 0.5;

  return {
    overallStatus,
    strengths: progressDomains.map(d => `Progresso em ${translateDomain(d)}`),
    concerns: declineDomains.map(d => `Queda em ${translateDomain(d)}`),
    topPriorityAction: urgentAlerts[0]?.suggestedResponse[0]
      ?? (declining[0] ? `Revisar intervenção em ${translateDomain(declining[0].domain)}` : 'Manter plano atual'),
    progressDomains,
    declineDomains,
    plateauDomains,
    riskLevel,
    confidenceScore: avgConfidence,
  };
}

// ─── Helpers ──────────────────────────────────────────────

function translateDomain(domain: string): string {
  const map: Record<string, string> = {
    attention: 'Atenção',
    memory: 'Memória',
    flexibility: 'Flexibilidade Cognitiva',
    persistence: 'Persistência',
    impulsivity: 'Controle Inibitório',
    emotional: 'Regulação Emocional',
    independence: 'Independência',
    global: 'Global',
  };
  return map[domain] ?? domain;
}

function countFrequency(items: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const item of items) freq[item] = (freq[item] ?? 0) + 1;
  return freq;
}

function generateClassRecommendations(concernFreq: Record<string, number>): string[] {
  const recommendations: string[] = [];
  const sorted = Object.entries(concernFreq).sort(([,a], [,b]) => b - a);

  for (const [concern] of sorted.slice(0, 3)) {
    if (concern.includes('Atenção')) {
      recommendations.push('Incluir atividade coletiva de foco de 2 minutos no início das aulas');
    }
    if (concern.includes('Persistência')) {
      recommendations.push('Dividir atividades longas em blocos menores com checkpoints');
    }
    if (concern.includes('Memória')) {
      recommendations.push('Utilizar suportes visuais e repetição espaçada nas explicações');
    }
    if (concern.includes('Flexibilidade')) {
      recommendations.push('Antecipar mudanças de rotina com apoio visual');
    }
    if (concern.includes('Regulação')) {
      recommendations.push('Implementar "cantinho de calma" e check-ins emocionais diários');
    }
  }

  return [...new Set(recommendations)];
}
