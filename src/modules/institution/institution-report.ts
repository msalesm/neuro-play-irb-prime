/**
 * Institution Report Generator
 * 
 * Creates structured reports for schools and institutions.
 */

import type { SchoolAnalytics } from './school-analytics';

// ─── Types ────────────────────────────────────────────────

export interface InstitutionReport {
  title: string;
  subtitle: string;
  generatedAt: string;
  institutionId: string;
  sections: ReportSection[];
  summary: string;
  recommendations: string[];
}

interface ReportSection {
  title: string;
  content: string;
  type: 'text' | 'metrics' | 'comparison' | 'chart';
  data?: Record<string, any>;
}

// ─── Generator ────────────────────────────────────────────

export function generateInstitutionReport(analytics: SchoolAnalytics): InstitutionReport {
  const sections: ReportSection[] = [];

  // Overview
  sections.push({
    title: 'Visão Geral da Escola',
    content: `${analytics.totalClasses} turma(s) | ${analytics.totalStudents} aluno(s) | Score cognitivo médio: ${analytics.overallCognitiveAvg}/100 | Engajamento: ${analytics.overallEngagement}%`,
    type: 'metrics',
    data: {
      totalClasses: analytics.totalClasses,
      totalStudents: analytics.totalStudents,
      cognitiveAvg: analytics.overallCognitiveAvg,
      engagement: analytics.overallEngagement,
    },
  });

  // Domain averages
  if (Object.keys(analytics.domainAverages).length > 0) {
    const domainLabels: Record<string, string> = {
      attention: 'Atenção', memory: 'Memória', flexibility: 'Flexibilidade',
      persistence: 'Persistência', inhibition: 'Autocontrole', coordination: 'Coordenação',
    };
    sections.push({
      title: 'Indicadores Cognitivos da Escola',
      content: Object.entries(analytics.domainAverages)
        .map(([k, v]) => `${domainLabels[k] || k}: ${v}/100`)
        .join(' | '),
      type: 'chart',
      data: analytics.domainAverages,
    });
  }

  // Class comparison
  if (analytics.classComparisons.length > 0) {
    sections.push({
      title: 'Comparativo entre Turmas',
      content: analytics.classComparisons
        .map(c => `${c.className}: Score ${c.overallAvg}/100 | Engajamento ${c.engagement}% | ${c.studentsNeedingSupport} aluno(s) com apoio`)
        .join('\n'),
      type: 'comparison',
      data: { classes: analytics.classComparisons },
    });
  }

  // Classes needing attention
  if (analytics.classesNeedingAttention.length > 0) {
    sections.push({
      title: '⚠️ Turmas que Necessitam Atenção',
      content: analytics.classesNeedingAttention.join(', '),
      type: 'text',
    });
  }

  // Recommendations
  const recommendations = generateRecommendations(analytics);

  return {
    title: `Relatório Institucional — ${analytics.institutionName}`,
    subtitle: `Gerado em ${new Date(analytics.calculatedAt).toLocaleDateString('pt-BR')}`,
    generatedAt: analytics.calculatedAt,
    institutionId: analytics.institutionId,
    sections,
    summary: `Score médio: ${analytics.overallCognitiveAvg}/100 | Engajamento: ${analytics.overallEngagement}% | ${analytics.classesNeedingAttention.length} turma(s) requerem atenção`,
    recommendations,
  };
}

function generateRecommendations(analytics: SchoolAnalytics): string[] {
  const recs: string[] = [];

  if (analytics.overallEngagement < 50) {
    recs.push('Aumentar frequência de uso da plataforma — meta mínima de 3x/semana por aluno');
  }

  if (analytics.classesNeedingAttention.length > 0) {
    recs.push(`Priorizar suporte para: ${analytics.classesNeedingAttention.join(', ')}`);
  }

  // Domain-specific recommendations
  for (const [domain, score] of Object.entries(analytics.domainAverages)) {
    if (score < 45) {
      const labels: Record<string, string> = {
        attention: 'Implementar atividades de foco no início das aulas',
        memory: 'Introduzir exercícios de memória de trabalho na rotina escolar',
        flexibility: 'Variar formatos de atividades para treinar adaptação',
        persistence: 'Fragmentar tarefas e aumentar reforço positivo',
        inhibition: 'Incluir jogos de autocontrole na rotina',
      };
      if (labels[domain]) recs.push(labels[domain]);
    }
  }

  if (recs.length === 0) {
    recs.push('Manter ritmo atual de atividades e monitorar consistência');
  }

  return recs;
}
