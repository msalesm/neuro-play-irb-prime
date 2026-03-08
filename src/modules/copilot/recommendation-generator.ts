/**
 * Recommendation Generator
 * 
 * Produces actionable, role-specific recommendations
 * from Copilot insights — for parents, teachers, and therapists.
 */

import type { CopilotInsight } from './insight-generator';

// ─── Types ────────────────────────────────────────────────

export interface CopilotRecommendation {
  id: string;
  childId: string;
  targetRole: 'parent' | 'teacher' | 'therapist';
  category: string;
  title: string;
  description: string;
  actionSteps: ActionStep[];
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedDuration: string;
  frequency: string;
  expectedOutcome: string;
  sourceInsightIds: string[];
  generatedAt: string;
  expiresAt: string;
}

export interface ActionStep {
  order: number;
  instruction: string;
  duration?: string;
  materials?: string[];
}

// ─── Generator ────────────────────────────────────────────

export function generateCopilotRecommendations(
  insights: CopilotInsight[],
  childId: string
): CopilotRecommendation[] {
  const recommendations: CopilotRecommendation[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  for (const insight of insights) {
    if (!insight.actionable) continue;

    for (const audience of insight.targetAudience) {
      const rec = buildRecommendation(insight, audience, childId, expiresAt);
      if (rec) recommendations.push(rec);
    }
  }

  // Sort by priority
  const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to top 10 per role to avoid overload
  const byRole: Record<string, CopilotRecommendation[]> = {};
  for (const rec of recommendations) {
    byRole[rec.targetRole] ??= [];
    byRole[rec.targetRole].push(rec);
  }

  return Object.values(byRole).flatMap(recs => recs.slice(0, 10));
}

// ─── Builders ─────────────────────────────────────────────

function buildRecommendation(
  insight: CopilotInsight,
  role: 'parent' | 'teacher' | 'therapist',
  childId: string,
  expiresAt: string
): CopilotRecommendation | null {
  const roleConfig = ROLE_RECOMMENDATIONS[role]?.[insight.domain];
  if (!roleConfig) return createGenericRecommendation(insight, role, childId, expiresAt);

  const config = insight.severity === 'urgent' || insight.severity === 'attention'
    ? roleConfig.decline
    : roleConfig.progress;

  if (!config) return null;

  return {
    id: `rec_${role}_${childId}_${insight.domain}_${Date.now()}`,
    childId,
    targetRole: role,
    category: insight.domain,
    title: config.title,
    description: config.description,
    actionSteps: config.steps,
    priority: mapSeverityToPriority(insight.severity),
    estimatedDuration: config.duration ?? '5-10 minutos',
    frequency: config.frequency ?? 'Diariamente',
    expectedOutcome: config.expectedOutcome ?? 'Melhoria gradual ao longo de 2-4 semanas',
    sourceInsightIds: [insight.id],
    generatedAt: new Date().toISOString(),
    expiresAt,
  };
}

function createGenericRecommendation(
  insight: CopilotInsight,
  role: 'parent' | 'teacher' | 'therapist',
  childId: string,
  expiresAt: string
): CopilotRecommendation {
  return {
    id: `rec_generic_${role}_${childId}_${Date.now()}`,
    childId,
    targetRole: role,
    category: insight.domain,
    title: insight.title,
    description: insight.summary,
    actionSteps: insight.suggestedActions.map((a, i) => ({
      order: i + 1,
      instruction: a,
    })),
    priority: mapSeverityToPriority(insight.severity),
    estimatedDuration: '10 minutos',
    frequency: 'Conforme necessário',
    expectedOutcome: 'Monitorar resposta e ajustar abordagem',
    sourceInsightIds: [insight.id],
    generatedAt: new Date().toISOString(),
    expiresAt,
  };
}

function mapSeverityToPriority(severity: string): 'immediate' | 'high' | 'medium' | 'low' {
  switch (severity) {
    case 'urgent': return 'immediate';
    case 'attention': return 'high';
    case 'neutral': return 'medium';
    default: return 'low';
  }
}

// ─── Role-Specific Recommendation Templates ───────────────

interface RecommendationTemplate {
  title: string;
  description: string;
  steps: ActionStep[];
  duration?: string;
  frequency?: string;
  expectedOutcome?: string;
}

const ROLE_RECOMMENDATIONS: Record<string, Record<string, { decline: RecommendationTemplate; progress: RecommendationTemplate }>> = {
  parent: {
    attention: {
      decline: {
        title: '🎯 Apoiar o foco em casa',
        description: 'A atenção da criança apresentou queda recente. Atividades simples em casa podem ajudar.',
        steps: [
          { order: 1, instruction: 'Criar um "canto de foco" sem distrações visuais e sonoras', materials: ['Mesa limpa', 'Fone abafador (opcional)'] },
          { order: 2, instruction: 'Iniciar atividades com timer visual de 3 minutos', materials: ['Timer visual ou ampulheta'], duration: '3 min' },
          { order: 3, instruction: 'Aumentar para 5 minutos após 3 dias de sucesso', duration: '5 min' },
          { order: 4, instruction: 'Celebrar cada sessão completada com elogio específico' },
        ],
        frequency: 'Diariamente, antes de tarefas que exigem foco',
        expectedOutcome: 'Melhoria na sustentação de atenção em 2-3 semanas',
      },
      progress: {
        title: '🌟 Atenção melhorando!',
        description: 'A atenção está evoluindo bem. Continue com as estratégias atuais.',
        steps: [
          { order: 1, instruction: 'Manter rotina atual de atividades de foco' },
          { order: 2, instruction: 'Gradualmente aumentar a duração das atividades' },
          { order: 3, instruction: 'Introduzir tarefas com duas etapas sequenciais' },
        ],
        frequency: 'Manter frequência atual',
        expectedOutcome: 'Consolidação do progresso',
      },
    },
    persistence: {
      decline: {
        title: '💪 Ajudar a criança a persistir',
        description: 'A persistência caiu. Tarefas menores com recompensa imediata ajudam.',
        steps: [
          { order: 1, instruction: 'Dividir qualquer tarefa em no máximo 3 passos' },
          { order: 2, instruction: 'Usar checklist visual com adesivos para cada passo concluído', materials: ['Checklist impresso', 'Adesivos'] },
          { order: 3, instruction: 'Celebrar a conclusão de cada passo, não apenas o resultado final' },
          { order: 4, instruction: 'Oferecer escolha entre 2 atividades para aumentar engajamento' },
        ],
        frequency: 'Em todas as tarefas do dia',
        expectedOutcome: 'Aumento na taxa de conclusão em 1-2 semanas',
      },
      progress: {
        title: '🏆 Persistência crescendo!',
        description: 'A criança está completando mais atividades. Excelente progresso.',
        steps: [
          { order: 1, instruction: 'Introduzir gradualmente tarefas um pouco mais longas' },
          { order: 2, instruction: 'Reconhecer o esforço com elogio descritivo' },
        ],
        frequency: 'Manter frequência atual',
        expectedOutcome: 'Estabilização da persistência em nível mais alto',
      },
    },
    memory: {
      decline: {
        title: '🧠 Exercitar a memória em casa',
        description: 'A memória operacional caiu. Atividades lúdicas podem apoiar.',
        steps: [
          { order: 1, instruction: 'Jogar "o que mudou?" com 3 objetos sobre a mesa', materials: ['3-5 objetos variados'], duration: '5 min' },
          { order: 2, instruction: 'Pedir para a criança contar o que fez no dia em 3 eventos', duration: '5 min' },
          { order: 3, instruction: 'Ler uma história curta e perguntar sobre 2 detalhes', materials: ['Livro infantil'], duration: '10 min' },
        ],
        frequency: 'Diariamente antes de dormir',
        expectedOutcome: 'Melhoria na memória de curto prazo em 3-4 semanas',
      },
      progress: {
        title: '🌟 Memória evoluindo!',
        description: 'Boa evolução na memória. Manter atividades de recall.',
        steps: [
          { order: 1, instruction: 'Aumentar número de objetos no jogo de memória' },
          { order: 2, instruction: 'Pedir recall de eventos com mais detalhes' },
        ],
        frequency: 'Manter frequência atual',
        expectedOutcome: 'Consolidação do ganho',
      },
    },
  },
  teacher: {
    attention: {
      decline: {
        title: '🎯 Estratégia de foco em sala',
        description: 'Aluno com queda na atenção sustentada. Pequenas adaptações ajudam.',
        steps: [
          { order: 1, instruction: 'Sentar próximo ao professor e longe de distrações' },
          { order: 2, instruction: 'Usar atividade de foco de 2 min antes de iniciar a aula', duration: '2 min' },
          { order: 3, instruction: 'Dar instruções em passos curtos (máximo 2 por vez)' },
          { order: 4, instruction: 'Usar sinal visual para redirecionar atenção sem exposição' },
        ],
        frequency: 'Em todas as aulas',
        expectedOutcome: 'Melhoria no engajamento em 1-2 semanas',
      },
      progress: {
        title: '🌟 Atenção do aluno melhorando',
        description: 'O aluno está sustentando melhor a atenção. Manter apoio.',
        steps: [
          { order: 1, instruction: 'Manter posição próxima ao professor' },
          { order: 2, instruction: 'Gradualmente reduzir suportes visuais' },
        ],
        frequency: 'Manter',
        expectedOutcome: 'Autonomia progressiva',
      },
    },
    persistence: {
      decline: {
        title: '💪 Apoiar conclusão de tarefas',
        description: 'Aluno desistindo de atividades antes de concluir.',
        steps: [
          { order: 1, instruction: 'Oferecer versão reduzida da atividade (50% dos itens)' },
          { order: 2, instruction: 'Dividir atividades longas com marcadores de progresso' },
          { order: 3, instruction: 'Usar reforço verbal após cada bloco concluído' },
        ],
        frequency: 'Em atividades longas',
        expectedOutcome: 'Aumento na taxa de conclusão',
      },
      progress: {
        title: '🏆 Persistência melhorando',
        description: 'Aluno concluindo mais atividades. Bom progresso.',
        steps: [
          { order: 1, instruction: 'Aumentar gradualmente a extensão das atividades' },
          { order: 2, instruction: 'Elogiar o esforço de forma específica' },
        ],
        frequency: 'Manter',
        expectedOutcome: 'Estabilização',
      },
    },
  },
  therapist: {
    attention: {
      decline: {
        title: '📋 Ajuste clínico — Atenção',
        description: 'Queda de atenção sustentada detectada. Revisar plano de intervenção.',
        steps: [
          { order: 1, instruction: 'Revisar nível de dificuldade dos jogos de atenção' },
          { order: 2, instruction: 'Considerar bateria cognitiva focada em atenção' },
          { order: 3, instruction: 'Verificar correlação com sono/rotina via checkins' },
          { order: 4, instruction: 'Ajustar motor adaptativo para sessões mais curtas' },
        ],
        frequency: 'Próxima sessão',
        expectedOutcome: 'Identificação de causa e ajuste de plano',
      },
      progress: {
        title: '✅ Atenção — Progresso clínico',
        description: 'Progresso consistente em atenção. Registrar em prontuário.',
        steps: [
          { order: 1, instruction: 'Registrar evolução no prontuário eletrônico' },
          { order: 2, instruction: 'Considerar aumento gradual de dificuldade' },
          { order: 3, instruction: 'Compartilhar progresso com pais e escola' },
        ],
        frequency: 'Próxima revisão de plano',
        expectedOutcome: 'Documentação e avanço',
      },
    },
    memory: {
      decline: {
        title: '📋 Ajuste clínico — Memória',
        description: 'Regressão na memória operacional detectada.',
        steps: [
          { order: 1, instruction: 'Retornar ao último nível dominado no jogo Sequência Cósmica' },
          { order: 2, instruction: 'Avaliar span de memória com teste estruturado' },
          { order: 3, instruction: 'Incluir atividades de rehearsal na sessão' },
          { order: 4, instruction: 'Registrar em prontuário e gerar relatório de acompanhamento' },
        ],
        frequency: 'Próxima sessão',
        expectedOutcome: 'Estabilização e retomada do progresso',
      },
      progress: {
        title: '✅ Memória — Progresso clínico',
        description: 'Evolução na memória operacional detectada.',
        steps: [
          { order: 1, instruction: 'Documentar no prontuário' },
          { order: 2, instruction: 'Avançar para nível seguinte de complexidade' },
        ],
        frequency: 'Próxima sessão',
        expectedOutcome: 'Consolidação',
      },
    },
  },
};
