/**
 * Alert System
 * 
 * Generates early-warning alerts from detected patterns.
 * Classified by severity with escalation rules.
 */

import type { DetectedPattern } from './pattern-detector';
import type { CopilotInsight } from './insight-generator';

// ─── Types ────────────────────────────────────────────────

export interface CopilotAlert {
  id: string;
  childId: string;
  alertType: AlertType;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  clinicalNote: string;
  domain: string;
  triggerPatterns: string[];
  triggerInsights: string[];
  suggestedResponse: string[];
  notifyRoles: ('therapist' | 'parent' | 'teacher' | 'admin')[];
  createdAt: string;
  expiresAt: string;
  requiresAcknowledgment: boolean;
  escalationMinutes: number | null;
}

export type AlertType =
  | 'regression_mild'
  | 'regression_severe'
  | 'global_regression'
  | 'frustration_high'
  | 'engagement_drop'
  | 'plateau_extended'
  | 'assessment_needed'
  | 'inconsistency_detected'
  | 'milestone_reached'
  | 'progress_celebration';

// ─── Alert Generator ──────────────────────────────────────

export function generateAlerts(
  patterns: DetectedPattern[],
  insights: CopilotInsight[],
  childId: string
): CopilotAlert[] {
  const alerts: CopilotAlert[] = [];
  const now = new Date();

  // Critical: Global regression
  const globalRegression = patterns.find(p => p.patternType === 'global_regression');
  if (globalRegression) {
    alerts.push({
      id: `alert_global_${childId}_${Date.now()}`,
      childId,
      alertType: 'global_regression',
      severity: 'critical',
      title: '🔴 Regressão Global Detectada',
      message: `Declínio simultâneo em múltiplos domínios cognitivos. Magnitude média: ${globalRegression.magnitude.toFixed(0)}%.`,
      clinicalNote: 'Regressão multi-domínio pode indicar fator externo significativo (mudança de rotina, saúde, estresse emocional). Recomenda-se avaliação clínica imediata.',
      domain: 'global',
      triggerPatterns: [globalRegression.id],
      triggerInsights: insights.filter(i => i.severity === 'urgent').map(i => i.id),
      suggestedResponse: [
        'Agendar avaliação cognitiva completa',
        'Conversar com pais sobre mudanças recentes',
        'Reduzir dificuldade das atividades temporariamente',
        'Monitorar diariamente por 1 semana',
      ],
      notifyRoles: ['therapist', 'parent'],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requiresAcknowledgment: true,
      escalationMinutes: 1440, // 24h
    });
  }

  // Severe individual regressions
  const severeDeclines = patterns.filter(p => p.severity === 'critical' && p.direction === 'declining');
  for (const pattern of severeDeclines) {
    if (pattern.patternType === 'global_regression') continue;
    alerts.push({
      id: `alert_severe_${childId}_${pattern.domain}_${Date.now()}`,
      childId,
      alertType: 'regression_severe',
      severity: 'warning',
      title: `🟡 Queda significativa em ${translateDomain(pattern.domain)}`,
      message: `${translateDomain(pattern.domain)} caiu ${pattern.magnitude.toFixed(0)}% nas últimas 2 semanas.`,
      clinicalNote: pattern.clinicalRelevance,
      domain: pattern.domain,
      triggerPatterns: [pattern.id],
      triggerInsights: [],
      suggestedResponse: [
        `Revisar plano de intervenção para ${translateDomain(pattern.domain)}`,
        'Ajustar dificuldade do motor adaptativo',
        'Registrar observações clínicas',
      ],
      notifyRoles: ['therapist'],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      requiresAcknowledgment: false,
      escalationMinutes: null,
    });
  }

  // Frustration escalation
  const frustrationPattern = patterns.find(p => p.patternType === 'frustration_escalation');
  if (frustrationPattern) {
    alerts.push({
      id: `alert_frustration_${childId}_${Date.now()}`,
      childId,
      alertType: 'frustration_high',
      severity: 'warning',
      title: '😤 Frustração elevada detectada',
      message: 'A criança está demonstrando sinais crescentes de frustração durante as atividades.',
      clinicalNote: 'Frustração alta pode levar a aversão às atividades. Recomenda-se reduzir dificuldade e aumentar reforço positivo.',
      domain: 'emotional',
      triggerPatterns: [frustrationPattern.id],
      triggerInsights: [],
      suggestedResponse: [
        'Reduzir nível de dificuldade imediatamente',
        'Aumentar frequência de reforço positivo',
        'Intercalar com atividades preferidas',
        'Considerar pausa terapêutica se necessário',
      ],
      notifyRoles: ['therapist', 'parent'],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      requiresAcknowledgment: true,
      escalationMinutes: 720, // 12h
    });
  }

  // Progress celebrations
  const improvements = patterns.filter(p => p.direction === 'improving' && p.magnitude >= 20);
  for (const pattern of improvements) {
    alerts.push({
      id: `alert_progress_${childId}_${pattern.domain}_${Date.now()}`,
      childId,
      alertType: 'progress_celebration',
      severity: 'info',
      title: `🌟 Progresso em ${translateDomain(pattern.domain)}!`,
      message: `${translateDomain(pattern.domain)} melhorou ${pattern.magnitude.toFixed(0)}% — excelente evolução!`,
      clinicalNote: 'Progresso significativo. Documentar em prontuário e considerar avanço gradual.',
      domain: pattern.domain,
      triggerPatterns: [pattern.id],
      triggerInsights: [],
      suggestedResponse: [
        'Celebrar com a criança e a família',
        'Registrar no prontuário',
        'Considerar aumento gradual de complexidade',
      ],
      notifyRoles: ['therapist', 'parent'],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requiresAcknowledgment: false,
      escalationMinutes: null,
    });
  }

  // Extended plateau alert
  const plateaus = patterns.filter(p => p.patternType === 'plateau_detected');
  for (const plateau of plateaus) {
    alerts.push({
      id: `alert_plateau_${childId}_${plateau.domain}_${Date.now()}`,
      childId,
      alertType: 'plateau_extended',
      severity: 'info',
      title: `📊 Platô em ${translateDomain(plateau.domain)}`,
      message: `Sem progresso significativo em ${translateDomain(plateau.domain)} há 2+ semanas.`,
      clinicalNote: 'Platô pode indicar necessidade de variar abordagem ou que o nível atual é o adequado para o momento.',
      domain: plateau.domain,
      triggerPatterns: [plateau.id],
      triggerInsights: [],
      suggestedResponse: [
        'Variar tipo de atividade dentro do domínio',
        'Revisar se o nível está na ZDP da criança',
        'Considerar nova abordagem terapêutica',
      ],
      notifyRoles: ['therapist'],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      requiresAcknowledgment: false,
      escalationMinutes: null,
    });
  }

  return alerts;
}

// ─── Alert Filtering ──────────────────────────────────────

export function filterAlertsByRole(
  alerts: CopilotAlert[],
  role: 'therapist' | 'parent' | 'teacher' | 'admin'
): CopilotAlert[] {
  return alerts.filter(a => a.notifyRoles.includes(role));
}

export function getActiveAlerts(alerts: CopilotAlert[]): CopilotAlert[] {
  const now = new Date();
  return alerts.filter(a => new Date(a.expiresAt) > now);
}

export function getUrgentAlerts(alerts: CopilotAlert[]): CopilotAlert[] {
  return alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');
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
    global: 'Desenvolvimento Global',
    cross_domain: 'Multi-Domínio',
  };
  return map[domain] ?? domain;
}
