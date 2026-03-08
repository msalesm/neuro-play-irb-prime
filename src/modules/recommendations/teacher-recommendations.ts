/**
 * Teacher-Specific Recommendations
 * 
 * Practical classroom strategies based on cognitive profile.
 * Uses educational (non-clinical) language.
 */

import type { RoleRecommendation, RecommendationContext } from './recommendation-engine';

export function generateTeacherRecommendations(context: RecommendationContext): RoleRecommendation[] {
  const recs: RoleRecommendation[] = [];
  let id = 0;

  for (const domain of context.weakDomains) {
    const score = context.domainScores[domain] ?? 50;

    if (domain === 'attention' || domain === 'Atenção') {
      recs.push({
        id: `tc_${++id}`,
        category: 'attention',
        title: 'Apoio ao Foco em Sala',
        description: 'Aluno apresenta dificuldade em manter foco sustentado durante atividades longas.',
        actionSteps: [
          'Realizar atividade curta de foco (2-3min) antes da aula principal',
          'Dividir atividades em blocos de 10-15 minutos',
          'Posicionar o aluno próximo ao professor, longe de distrações',
          'Usar sinais visuais para redirecionar atenção sem exposição',
          'Alternar atividades de escuta com atividades práticas',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Melhora na participação e conclusão de tarefas em sala',
        frequency: 'Diariamente',
      });
    }

    if (domain === 'persistence' || domain === 'Persistência') {
      recs.push({
        id: `tc_${++id}`,
        category: 'persistence',
        title: 'Estratégias para Persistência',
        description: 'Aluno tende a desistir rapidamente de tarefas desafiadoras.',
        actionSteps: [
          'Fragmentar tarefas complexas em etapas menores e claras',
          'Celebrar pequenas conquistas durante a atividade',
          'Oferecer opções de "pedir ajuda" sem penalidade',
          'Usar timer visual para mostrar quanto falta',
          'Parear com colega-modelo para atividades em dupla',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Aumento na taxa de conclusão de atividades',
        frequency: 'Em toda atividade que exija persistência',
      });
    }

    if (domain === 'memory' || domain === 'Memória') {
      recs.push({
        id: `tc_${++id}`,
        category: 'memory',
        title: 'Apoio à Memória de Trabalho',
        description: 'Aluno demonstra dificuldade em reter instruções múltiplas.',
        actionSteps: [
          'Dar uma instrução de cada vez, verificando compreensão',
          'Disponibilizar instruções escritas ou em imagem no quadro',
          'Usar checklist visual na mesa do aluno',
          'Repetir informações-chave de formas diferentes',
        ],
        priority: 'medium',
        estimatedImpact: 'Maior autonomia na execução de atividades',
      });
    }

    if (domain === 'flexibility' || domain === 'Flexibilidade') {
      recs.push({
        id: `tc_${++id}`,
        category: 'flexibility',
        title: 'Apoio à Adaptação a Mudanças',
        description: 'Aluno apresenta dificuldade quando há mudanças na rotina ou regras.',
        actionSteps: [
          'Antecipar mudanças de rotina verbalmente e visualmente',
          'Usar "termômetro de mudanças" para preparar o aluno',
          'Introduzir pequenas variações graduais na rotina',
          'Validar o desconforto antes de pedir adaptação',
        ],
        priority: 'medium',
        estimatedImpact: 'Redução de resistência a mudanças e transições mais suaves',
      });
    }

    if (domain === 'inhibition' || domain === 'Controle Inibitório') {
      recs.push({
        id: `tc_${++id}`,
        category: 'attention',
        title: 'Estratégias de Autocontrole',
        description: 'Aluno tende a agir impulsivamente antes de processar a informação.',
        actionSteps: [
          'Ensinar estratégia "pare-pense-aja" com cartão visual',
          'Usar sistema de "mão levantada" antes de responder',
          'Elogiar publicamente quando o aluno espera sua vez',
          'Criar acordo individual sobre comportamento esperado',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Melhora no comportamento em sala e interações com colegas',
      });
    }
  }

  // Executive function recommendations
  if (context.domainScores['organization'] !== undefined && context.domainScores['organization'] < 50) {
    recs.push({
      id: `tc_${++id}`,
      category: 'executive',
      title: 'Organização e Planejamento',
      description: 'Aluno precisa de apoio na organização de materiais e tarefas.',
      actionSteps: [
        'Implementar rotina visual fixa na mesa do aluno',
        'Verificar organização do material no início da aula',
        'Usar código de cores para matérias/atividades',
      ],
      priority: 'medium',
      estimatedImpact: 'Maior independência na organização escolar',
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: `tc_${++id}`,
      category: 'general',
      title: 'Continuidade e Estímulo',
      description: 'Aluno com perfil adequado — manter desafios e estimulação.',
      actionSteps: [
        'Oferecer atividades de enriquecimento nos pontos fortes',
        'Usar como par-modelo para atividades em grupo',
        'Monitorar consistência ao longo do bimestre',
      ],
      priority: 'low',
      estimatedImpact: 'Manutenção do bom desempenho',
    });
  }

  return recs;
}
