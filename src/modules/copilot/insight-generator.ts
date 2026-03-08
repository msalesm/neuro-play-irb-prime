/**
 * Insight Generator
 * 
 * Transforms detected patterns into human-readable, actionable insights
 * for professionals, parents, and educators.
 */

import type { DetectedPattern } from './pattern-detector';

// ─── Types ────────────────────────────────────────────────

export interface CopilotInsight {
  id: string;
  childId: string;
  insightType: InsightType;
  title: string;
  summary: string;
  details: string;
  domain: string;
  severity: 'positive' | 'neutral' | 'attention' | 'urgent';
  actionable: boolean;
  suggestedActions: string[];
  targetAudience: ('therapist' | 'parent' | 'teacher')[];
  sourcePatterns: string[];
  generatedAt: string;
  validUntil: string;
  confidence: number;
}

export type InsightType =
  | 'progress_celebration'
  | 'regression_alert'
  | 'plateau_warning'
  | 'consistency_note'
  | 'strategy_suggestion'
  | 'assessment_recommendation'
  | 'environmental_factor'
  | 'cross_domain_correlation';

// ─── Generator ────────────────────────────────────────────

export function generateInsights(
  patterns: DetectedPattern[],
  childId: string
): CopilotInsight[] {
  const insights: CopilotInsight[] = [];
  const now = new Date();
  const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  for (const pattern of patterns) {
    if (pattern.direction === 'improving') {
      insights.push(createProgressInsight(pattern, validUntil));
    }
    
    if (pattern.direction === 'declining') {
      insights.push(createRegressionInsight(pattern, validUntil));
      
      // Add strategy suggestion for declines
      insights.push(createStrategyInsight(pattern, validUntil));
    }

    if (pattern.patternType === 'plateau_detected') {
      insights.push(createPlateauInsight(pattern, validUntil));
    }

    if (pattern.patternType === 'inconsistent_performance') {
      insights.push(createConsistencyInsight(pattern, validUntil));
    }
  }

  // Cross-domain correlations
  const crossDomainInsight = detectCrossDomainCorrelations(patterns, childId, validUntil);
  if (crossDomainInsight) insights.push(crossDomainInsight);

  // Global regression → assessment recommendation
  const globalRegression = patterns.find(p => p.patternType === 'global_regression');
  if (globalRegression) {
    insights.push({
      id: `insight_assessment_${childId}_${Date.now()}`,
      childId,
      insightType: 'assessment_recommendation',
      title: '⚠️ Avaliação cognitiva recomendada',
      summary: 'Múltiplos domínios apresentam declínio simultâneo. Recomenda-se avaliação cognitiva estruturada.',
      details: `Detectamos queda em ${globalRegression.supportingMetrics.length || 3}+ domínios. Isso pode indicar fatores externos (mudança de rotina, saúde, estresse) ou necessidade de reavaliação do plano de intervenção.`,
      domain: 'global',
      severity: 'urgent',
      actionable: true,
      suggestedActions: [
        'Agendar avaliação cognitiva completa',
        'Verificar mudanças recentes na rotina da criança',
        'Conversar com pais sobre possíveis fatores externos',
        'Considerar pausa temporária de atividades mais complexas',
      ],
      targetAudience: ['therapist', 'parent'],
      sourcePatterns: [globalRegression.id],
      generatedAt: new Date().toISOString(),
      validUntil,
      confidence: globalRegression.confidence,
    });
  }

  return insights;
}

// ─── Insight Builders ─────────────────────────────────────

function createProgressInsight(pattern: DetectedPattern, validUntil: string): CopilotInsight {
  return {
    id: `insight_progress_${pattern.childId}_${pattern.domain}_${Date.now()}`,
    childId: pattern.childId,
    insightType: 'progress_celebration',
    title: `🌟 Progresso em ${pattern.domain}`,
    summary: pattern.description,
    details: pattern.clinicalRelevance,
    domain: pattern.domain,
    severity: 'positive',
    actionable: true,
    suggestedActions: [
      'Celebrar o progresso com a criança',
      'Considerar aumento gradual de complexidade',
      'Registrar em prontuário para acompanhamento longitudinal',
    ],
    targetAudience: ['therapist', 'parent', 'teacher'],
    sourcePatterns: [pattern.id],
    generatedAt: new Date().toISOString(),
    validUntil,
    confidence: pattern.confidence,
  };
}

function createRegressionInsight(pattern: DetectedPattern, validUntil: string): CopilotInsight {
  const isUrgent = pattern.severity === 'critical';
  return {
    id: `insight_regression_${pattern.childId}_${pattern.domain}_${Date.now()}`,
    childId: pattern.childId,
    insightType: 'regression_alert',
    title: `${isUrgent ? '🔴' : '🟡'} Queda em ${pattern.domain}`,
    summary: pattern.description,
    details: pattern.clinicalRelevance,
    domain: pattern.domain,
    severity: isUrgent ? 'urgent' : 'attention',
    actionable: true,
    suggestedActions: getRegressionActions(pattern.domain),
    targetAudience: ['therapist', 'parent'],
    sourcePatterns: [pattern.id],
    generatedAt: new Date().toISOString(),
    validUntil,
    confidence: pattern.confidence,
  };
}

function createStrategyInsight(pattern: DetectedPattern, validUntil: string): CopilotInsight {
  return {
    id: `insight_strategy_${pattern.childId}_${pattern.domain}_${Date.now()}`,
    childId: pattern.childId,
    insightType: 'strategy_suggestion',
    title: `💡 Sugestão para ${pattern.domain}`,
    summary: `Estratégia adaptada para apoiar ${pattern.domain}`,
    details: getStrategyDetails(pattern.domain),
    domain: pattern.domain,
    severity: 'neutral',
    actionable: true,
    suggestedActions: getStrategyActions(pattern.domain),
    targetAudience: getStrategyAudience(pattern.domain),
    sourcePatterns: [pattern.id],
    generatedAt: new Date().toISOString(),
    validUntil,
    confidence: pattern.confidence * 0.9,
  };
}

function createPlateauInsight(pattern: DetectedPattern, validUntil: string): CopilotInsight {
  return {
    id: `insight_plateau_${pattern.childId}_${pattern.domain}_${Date.now()}`,
    childId: pattern.childId,
    insightType: 'plateau_warning',
    title: `📊 Platô em ${pattern.domain}`,
    summary: pattern.description,
    details: 'O desempenho se estabilizou sem avanço significativo. Pode ser necessário variar a abordagem terapêutica.',
    domain: pattern.domain,
    severity: 'attention',
    actionable: true,
    suggestedActions: [
      'Variar tipo de atividade (jogos diferentes, nova abordagem)',
      'Introduzir desafios novos dentro do mesmo domínio',
      'Avaliar se o nível atual está adequado à ZDP da criança',
      'Considerar abordagem lúdica diferente para re-engajar',
    ],
    targetAudience: ['therapist'],
    sourcePatterns: [pattern.id],
    generatedAt: new Date().toISOString(),
    validUntil,
    confidence: pattern.confidence,
  };
}

function createConsistencyInsight(pattern: DetectedPattern, validUntil: string): CopilotInsight {
  return {
    id: `insight_consistency_${pattern.childId}_${pattern.domain}_${Date.now()}`,
    childId: pattern.childId,
    insightType: 'consistency_note',
    title: `🔄 Inconsistência em ${pattern.domain}`,
    summary: pattern.description,
    details: 'Desempenho altamente variável entre sessões. Investigar fatores como sono, humor, horário e contexto.',
    domain: pattern.domain,
    severity: 'attention',
    actionable: true,
    suggestedActions: [
      'Correlacionar desempenho com checkins emocionais',
      'Verificar regularidade do sono e rotina',
      'Anotar fatores contextuais em cada sessão',
      'Considerar horário mais estável para atividades',
    ],
    targetAudience: ['therapist', 'parent'],
    sourcePatterns: [pattern.id],
    generatedAt: new Date().toISOString(),
    validUntil,
    confidence: pattern.confidence,
  };
}

function detectCrossDomainCorrelations(
  patterns: DetectedPattern[], childId: string, validUntil: string
): CopilotInsight | null {
  const declines = patterns.filter(p => p.direction === 'declining');
  const attentionDecline = declines.find(p => p.domain === 'attention');
  const persistenceDecline = declines.find(p => p.domain === 'persistence');

  if (attentionDecline && persistenceDecline) {
    return {
      id: `insight_cross_${childId}_attention_persistence_${Date.now()}`,
      childId,
      insightType: 'cross_domain_correlation',
      title: '🔗 Correlação: atenção + persistência',
      summary: 'Queda simultânea em atenção e persistência pode indicar fator externo.',
      details: 'Quando atenção e persistência caem juntas, frequentemente há um fator contextual: mudança de rotina, cansaço acumulado, questão emocional ou evento estressor. Investigar contexto familiar e escolar.',
      domain: 'cross_domain',
      severity: 'attention',
      actionable: true,
      suggestedActions: [
        'Investigar mudanças recentes na rotina da criança',
        'Verificar qualidade do sono',
        'Perguntar aos pais sobre eventos estressores',
        'Reduzir temporariamente a complexidade das atividades',
      ],
      targetAudience: ['therapist', 'parent'],
      sourcePatterns: [attentionDecline.id, persistenceDecline.id],
      generatedAt: new Date().toISOString(),
      validUntil,
      confidence: Math.min(attentionDecline.confidence, persistenceDecline.confidence),
    };
  }

  return null;
}

// ─── Domain-Specific Helpers ──────────────────────────────

function getRegressionActions(domain: string): string[] {
  const actions: Record<string, string[]> = {
    attention: [
      'Reduzir duração das atividades para 3-5 minutos',
      'Intercalar com pausas sensoriais',
      'Verificar estímulos ambientais durante sessões',
    ],
    memory: [
      'Retornar ao último nível dominado com confiança',
      'Utilizar suportes visuais (cartões, imagens)',
      'Praticar em sessões curtas e frequentes',
    ],
    persistence: [
      'Trocar para jogos mais curtos e com recompensa imediata',
      'Aplicar reforço positivo mais frequente',
      'Garantir que o nível de dificuldade não está alto demais',
    ],
    impulsivity: [
      'Incluir atividades de controle inibitório (go/no-go)',
      'Praticar "esperar" antes de responder',
      'Usar temporizadores visuais',
    ],
    emotional: [
      'Iniciar sessões com check-in emocional',
      'Utilizar histórias interativas com foco socioemocional',
      'Oferecer escolhas para aumentar senso de controle',
    ],
    flexibility: [
      'Introduzir mudanças graduais nas atividades',
      'Usar jogos de categorização com alternância',
      'Praticar transições com antecipação verbal',
    ],
  };
  return actions[domain] ?? ['Monitorar e registrar observações', 'Consultar equipe clínica'];
}

function getStrategyDetails(domain: string): string {
  const details: Record<string, string> = {
    attention: 'Para apoiar a atenção: atividades curtas com feedback imediato, ambiente com mínimo de distração, pausas sensoriais entre tarefas.',
    memory: 'Para apoiar a memória: repetição espaçada, suportes visuais, chunking de informações, prática distribuída.',
    persistence: 'Para apoiar a persistência: metas menores e alcançáveis, celebração frequente, dificuldade gradual, escolha de atividades.',
    impulsivity: 'Para controle inibitório: jogos de espera, técnicas de respiração, modelo de resposta pausada, reforço da auto-regulação.',
    emotional: 'Para regulação emocional: check-ins antes de atividades, rotina previsível, validação emocional, histórias sociais.',
    flexibility: 'Para flexibilidade: mudanças graduais, múltiplas soluções para problemas, jogos de categorização alternada.',
  };
  return details[domain] ?? 'Manter acompanhamento regular e ajustar conforme resposta da criança.';
}

function getStrategyActions(domain: string): string[] {
  const actions: Record<string, string[]> = {
    attention: [
      'Iniciar dia com atividade de foco de 3 minutos',
      'Usar timer visual para sessões',
      'Criar ambiente com mínimo de estímulos',
    ],
    memory: [
      'Criar rotina visual com 3 passos',
      'Praticar sequências curtas em casa',
      'Usar flashcards com imagens familiares',
    ],
    persistence: [
      'Dividir tarefas grandes em 3 etapas pequenas',
      'Celebrar cada etapa concluída',
      'Oferecer escolha entre 2 atividades',
    ],
    impulsivity: [
      'Praticar "1-2-3 e responde" antes de ações',
      'Usar semáforo visual (vermelho=para, verde=vai)',
      'Jogar jogos de espera em família',
    ],
    emotional: [
      'Fazer check-in emocional diário com emojis',
      'Criar "cantinho de calma" em casa',
      'Ler histórias sobre emoções antes de dormir',
    ],
    flexibility: [
      'Variar rotina com pequenas mudanças controladas',
      'Brincar de "e se..." com cenários diferentes',
      'Praticar transições com contagem regressiva',
    ],
  };
  return actions[domain] ?? ['Acompanhar e registrar'];
}

function getStrategyAudience(domain: string): ('therapist' | 'parent' | 'teacher')[] {
  const audiences: Record<string, ('therapist' | 'parent' | 'teacher')[]> = {
    attention: ['parent', 'teacher'],
    memory: ['parent', 'teacher'],
    persistence: ['parent', 'teacher'],
    impulsivity: ['parent', 'therapist'],
    emotional: ['parent', 'therapist'],
    flexibility: ['parent', 'teacher'],
  };
  return audiences[domain] ?? ['therapist'];
}
