/**
 * Unified Report Engine
 * 
 * Generates all report types from a single engine.
 * Supports: cognitive, ABA, school, evolution reports.
 * Exports to structured data (PDF generation handled by UI layer).
 */

import type { UnifiedProfile, DomainScore } from '@/modules/behavioral/engine';
import type { AppRole } from '@/core/roles';

// ─── Types ────────────────────────────────────────────────

export type ReportType = 'cognitive' | 'aba' | 'school' | 'evolution' | 'family';

export interface ReportConfig {
  type: ReportType;
  childId: string;
  childName: string;
  periodStart: string;
  periodEnd: string;
  generatedBy: string;
  role: AppRole;
}

export interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, any>;
  visualType?: 'text' | 'chart' | 'table' | 'score-card';
}

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  generatedAt: string;
  title: string;
  subtitle: string;
  sections: ReportSection[];
  summary: string;
  recommendations: string[];
  alertFlags: string[];
}

// ─── Report Generation ────────────────────────────────────

export function generateReport(
  config: ReportConfig,
  profile: UnifiedProfile
): GeneratedReport {
  const id = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  switch (config.type) {
    case 'cognitive':
      return generateCognitiveReport(id, config, profile);
    case 'aba':
      return generateAbaReport(id, config, profile);
    case 'school':
      return generateSchoolReport(id, config, profile);
    case 'evolution':
      return generateEvolutionReport(id, config, profile);
    case 'family':
      return generateFamilyReport(id, config, profile);
    default:
      return generateCognitiveReport(id, config, profile);
  }
}

// ─── Report Type Generators ───────────────────────────────

function generateCognitiveReport(
  id: string,
  config: ReportConfig,
  profile: UnifiedProfile
): GeneratedReport {
  const sections: ReportSection[] = [
    {
      title: 'Perfil Cognitivo',
      content: `Avaliação dos domínios cognitivos de ${config.childName} no período de ${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}.`,
      data: profile.cognitive,
      visualType: 'chart',
    },
    {
      title: 'Atenção Sustentada',
      content: describeDomain('Atenção', profile.cognitive.attention),
      data: { score: profile.cognitive.attention },
      visualType: 'score-card',
    },
    {
      title: 'Controle Inibitório',
      content: describeDomain('Controle inibitório', profile.cognitive.inhibition),
      data: { score: profile.cognitive.inhibition },
      visualType: 'score-card',
    },
    {
      title: 'Memória de Trabalho',
      content: describeDomain('Memória de trabalho', profile.cognitive.memory),
      data: { score: profile.cognitive.memory },
      visualType: 'score-card',
    },
    {
      title: 'Flexibilidade Cognitiva',
      content: describeDomain('Flexibilidade cognitiva', profile.cognitive.flexibility),
      data: { score: profile.cognitive.flexibility },
      visualType: 'score-card',
    },
    {
      title: 'Coordenação Visomotora',
      content: describeDomain('Coordenação', profile.cognitive.coordination),
      data: { score: profile.cognitive.coordination },
      visualType: 'score-card',
    },
    {
      title: 'Persistência',
      content: describeDomain('Persistência', profile.cognitive.persistence),
      data: { score: profile.cognitive.persistence },
      visualType: 'score-card',
    },
    {
      title: 'Pontos Fortes',
      content: profile.strengths.length > 0 
        ? profile.strengths.join(', ') 
        : 'Dados insuficientes para determinar pontos fortes.',
      visualType: 'text',
    },
    {
      title: 'Áreas de Desenvolvimento',
      content: profile.areasForDevelopment.length > 0 
        ? profile.areasForDevelopment.join(', ') 
        : 'Nenhuma área crítica identificada.',
      visualType: 'text',
    },
  ];

  return {
    id, config,
    generatedAt: new Date().toISOString(),
    title: `Relatório Cognitivo — ${config.childName}`,
    subtitle: `Período: ${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}`,
    sections,
    summary: `Score geral: ${profile.overallScore}/100. Tendência: ${translateTrend(profile.evolutionTrend)}. Completude dos dados: ${Math.round(profile.dataCompleteness * 100)}%.`,
    recommendations: profile.recommendations,
    alertFlags: getAlertFlags(profile),
  };
}

function generateAbaReport(
  id: string,
  config: ReportConfig,
  profile: UnifiedProfile
): GeneratedReport {
  const aba = profile.aba;
  const sections: ReportSection[] = [
    {
      title: 'Resumo ABA',
      content: aba 
        ? `${aba.activePrograms} programa(s) ativo(s), ${aba.masteredSkills} habilidade(s) dominada(s). Independência geral: ${aba.overallIndependence}%.`
        : 'Nenhum dado ABA disponível para este período.',
      visualType: 'text',
    },
    {
      title: 'Integração Cognitiva',
      content: 'Indicadores cognitivos dos jogos que complementam o programa ABA.',
      data: profile.cognitive,
      visualType: 'chart',
    },
  ];

  return {
    id, config,
    generatedAt: new Date().toISOString(),
    title: `Relatório ABA — ${config.childName}`,
    subtitle: `Período: ${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}`,
    sections,
    summary: aba ? `Tendência ABA: ${translateTrend(aba.trendDirection === 'up' ? 'improving' : aba.trendDirection === 'down' ? 'declining' : 'stable')}.` : 'Sem dados ABA.',
    recommendations: profile.recommendations,
    alertFlags: getAlertFlags(profile),
  };
}

function generateSchoolReport(
  id: string,
  config: ReportConfig,
  profile: UnifiedProfile
): GeneratedReport {
  const sections: ReportSection[] = [
    {
      title: 'Indicadores Pedagógicos',
      content: `Perfil de aprendizagem de ${config.childName} baseado em atividades da plataforma.`,
      visualType: 'text',
    },
    {
      title: 'Função Executiva',
      content: `Organização: ${profile.executive.organization.score}/100 | Autonomia: ${profile.executive.autonomy.score}/100 | Conclusão: ${profile.executive.completion.score}/100`,
      data: profile.executive,
      visualType: 'chart',
    },
    {
      title: 'Indicadores Cognitivos',
      content: `Atenção: ${profile.cognitive.attention.score}/100 | Memória: ${profile.cognitive.memory.score}/100 | Flexibilidade: ${profile.cognitive.flexibility.score}/100`,
      data: { attention: profile.cognitive.attention, memory: profile.cognitive.memory, flexibility: profile.cognitive.flexibility },
      visualType: 'chart',
    },
    {
      title: 'Indicadores Socioemocionais',
      content: `Empatia: ${profile.socioemotional.empathy.score}/100 | Regulação: ${profile.socioemotional.emotionalRegulation.score}/100`,
      data: profile.socioemotional,
      visualType: 'chart',
    },
  ];

  return {
    id, config,
    generatedAt: new Date().toISOString(),
    title: `Relatório Pedagógico — ${config.childName}`,
    subtitle: `Período: ${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}`,
    sections,
    summary: `Score geral: ${profile.overallScore}/100. Dados educacionais com foco em função executiva e indicadores de aprendizagem.`,
    recommendations: profile.recommendations.filter(r => 
      r.includes('atividade') || r.includes('rotina') || r.includes('estimulação')
    ),
    alertFlags: getAlertFlags(profile),
  };
}

function generateEvolutionReport(
  id: string,
  config: ReportConfig,
  profile: UnifiedProfile
): GeneratedReport {
  const sections: ReportSection[] = [
    {
      title: 'Evolução Geral',
      content: `Tendência: ${translateTrend(profile.evolutionTrend)}. Score atual: ${profile.overallScore}/100.`,
      visualType: 'text',
    },
    {
      title: 'Domínios Cognitivos',
      content: Object.entries(profile.cognitive)
        .map(([k, v]) => `${translateDomainKey(k)}: ${v.score}/100 (${v.trend === 'up' ? '↑' : v.trend === 'down' ? '↓' : '→'})`)
        .join(' | '),
      data: profile.cognitive,
      visualType: 'chart',
    },
  ];

  return {
    id, config,
    generatedAt: new Date().toISOString(),
    title: `Relatório de Evolução — ${config.childName}`,
    subtitle: `Período: ${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}`,
    sections,
    summary: `Evolução: ${translateTrend(profile.evolutionTrend)}.`,
    recommendations: profile.recommendations,
    alertFlags: getAlertFlags(profile),
  };
}

function generateFamilyReport(
  id: string,
  config: ReportConfig,
  profile: UnifiedProfile
): GeneratedReport {
  // Simplified report for parents
  const sections: ReportSection[] = [
    {
      title: 'Como está seu filho(a)',
      content: `${config.childName} está com um score geral de ${profile.overallScore}/100. ${profile.evolutionTrend === 'improving' ? 'Está evoluindo muito bem! 🎉' : profile.evolutionTrend === 'declining' ? 'Precisa de um pouco mais de apoio.' : 'Mantendo um ritmo constante.'}`,
      visualType: 'text',
    },
    {
      title: 'Pontos Fortes',
      content: profile.strengths.length > 0 ? `Destaque em: ${profile.strengths.join(', ')}` : 'Continue praticando as atividades para identificar pontos fortes!',
      visualType: 'text',
    },
    {
      title: 'O que praticar em casa',
      content: profile.recommendations.slice(0, 3).join('\n') || 'Continue com as atividades da plataforma.',
      visualType: 'text',
    },
  ];

  return {
    id, config,
    generatedAt: new Date().toISOString(),
    title: `Progresso de ${config.childName}`,
    subtitle: `${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}`,
    sections,
    summary: `Score: ${profile.overallScore}/100 — ${translateTrend(profile.evolutionTrend)}.`,
    recommendations: profile.recommendations.slice(0, 3),
    alertFlags: [],
  };
}

// ─── Helpers ──────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function describeDomain(name: string, domain: DomainScore): string {
  const classMap: Record<string, string> = {
    adequate: 'dentro da faixa esperada',
    monitoring: 'requer monitoramento',
    attention: 'requer atenção específica',
    intervention: 'sugere necessidade de intervenção direcionada',
  };
  
  const trendMap: Record<string, string> = {
    up: 'com tendência de melhora',
    down: 'com tendência de queda',
    stable: 'estável',
  };
  
  return `${name}: ${domain.score}/100 — ${classMap[domain.classification] || 'não classificado'}, ${trendMap[domain.trend] || 'estável'}. Baseado em ${domain.dataPoints} ponto(s) de dados.`;
}

function translateTrend(trend: string): string {
  const map: Record<string, string> = {
    improving: 'Em melhora',
    declining: 'Em declínio',
    stable: 'Estável',
    up: 'Em melhora',
    down: 'Em declínio',
  };
  return map[trend] || 'Estável';
}

function translateDomainKey(key: string): string {
  const map: Record<string, string> = {
    attention: 'Atenção',
    inhibition: 'Inibição',
    memory: 'Memória',
    flexibility: 'Flexibilidade',
    coordination: 'Coordenação',
    persistence: 'Persistência',
  };
  return map[key] || key;
}

function getAlertFlags(profile: UnifiedProfile): string[] {
  const flags: string[] = [];
  
  const checkDomain = (name: string, domain: DomainScore) => {
    if (domain.classification === 'intervention') {
      flags.push(`⚠️ ${name} em nível de intervenção (${domain.score}/100)`);
    }
    if (domain.trend === 'down' && domain.dataPoints >= 3) {
      flags.push(`📉 ${name} em tendência de queda`);
    }
  };
  
  Object.entries(profile.cognitive).forEach(([k, v]) => checkDomain(translateDomainKey(k), v));
  
  if (profile.dataCompleteness < 0.25) {
    flags.push('📊 Dados insuficientes para análise confiável');
  }
  
  return flags;
}

/**
 * Get available report types for a given role
 */
export function getAvailableReportTypes(role: AppRole): ReportType[] {
  switch (role) {
    case 'admin':
      return ['cognitive', 'aba', 'school', 'evolution', 'family'];
    case 'therapist':
      return ['cognitive', 'aba', 'evolution'];
    case 'teacher':
      return ['school', 'evolution'];
    case 'parent':
      return ['family', 'evolution'];
    default:
      return ['family'];
  }
}
