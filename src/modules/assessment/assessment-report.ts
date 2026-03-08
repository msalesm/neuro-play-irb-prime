/**
 * Assessment Report Generator
 * 
 * Creates structured assessment reports from cognitive assessment results.
 */

import type { AssessmentResult } from './assessment-engine';

// ─── Types ────────────────────────────────────────────────

export interface AssessmentReportData {
  title: string;
  subtitle: string;
  generatedAt: string;
  childId: string;
  overallScore: number;
  sections: ReportSection[];
  footer: string;
}

interface ReportSection {
  title: string;
  content: string;
  type: 'text' | 'scores' | 'indicators' | 'recommendations';
  data?: Record<string, any>;
}

// ─── Report Generator ─────────────────────────────────────

export function generateAssessmentReport(result: AssessmentResult): AssessmentReportData {
  const sections: ReportSection[] = [];

  // Overview section
  sections.push({
    title: 'Visão Geral',
    content: `Score geral: ${result.overallScore}/100. ` +
      `Completude da avaliação: ${Math.round(result.completeness * 100)}%. ` +
      (result.isValid 
        ? 'Dados suficientes para análise confiável.' 
        : '⚠️ Dados insuficientes — completar mais tarefas da bateria.'),
    type: 'text',
  });

  // Domain scores section
  sections.push({
    title: 'Scores por Domínio',
    content: result.domains.map(d => 
      `${d.domainLabel}: ${d.score}/100 (${translateClassification(d.classification)})`
    ).join('\n'),
    type: 'scores',
    data: Object.fromEntries(result.domains.map(d => [d.domain, d.score])),
  });

  // Strengths
  if (result.strengths.length > 0) {
    sections.push({
      title: 'Pontos Fortes',
      content: result.strengths.join(', '),
      type: 'text',
    });
  }

  // Areas for development
  if (result.areasForDevelopment.length > 0) {
    sections.push({
      title: 'Áreas para Desenvolvimento',
      content: result.areasForDevelopment.join(', '),
      type: 'text',
    });
  }

  // Behavioral indicators
  if (result.behavioralIndicators.length > 0) {
    sections.push({
      title: 'Indicadores Comportamentais Observados',
      content: result.behavioralIndicators.map(i => `• ${i}`).join('\n'),
      type: 'indicators',
    });
  }

  return {
    title: 'Relatório de Avaliação Cognitiva',
    subtitle: `Faixa etária: ${result.ageGroup} anos | Avaliado em: ${new Date(result.assessedAt).toLocaleDateString('pt-BR')}`,
    generatedAt: result.assessedAt,
    childId: result.childId,
    overallScore: result.overallScore,
    sections,
    footer: '⚠️ Este relatório apresenta padrões comportamentais observados durante atividades educacionais estruturadas. Não constitui avaliação clínica.',
  };
}

function translateClassification(c: string): string {
  const map: Record<string, string> = {
    adequate: 'Adequado',
    monitoring: 'Monitoramento',
    attention: 'Atenção',
    intervention: 'Intervenção',
  };
  return map[c] || c;
}
