/**
 * Parent-Specific Recommendations
 * 
 * Practical home strategies in accessible language.
 */

import type { RoleRecommendation, RecommendationContext } from './recommendation-engine';

export function generateParentRecommendations(context: RecommendationContext): RoleRecommendation[] {
  const recs: RoleRecommendation[] = [];
  let id = 0;

  for (const domain of context.weakDomains) {
    const score = context.domainScores[domain] ?? 50;

    if (domain === 'attention' || domain === 'Atenção') {
      recs.push({
        id: `pa_${++id}`,
        category: 'attention',
        title: 'Melhorar o Foco em Casa',
        description: 'Seu filho(a) pode se beneficiar de atividades que treinam a concentração.',
        actionSteps: [
          'Criar um "cantinho de foco" silencioso para tarefas escolares',
          'Usar timer de 10 minutos — estudar com intervalos curtos',
          'Reduzir telas e estímulos visuais durante o estudo',
          'Brincar de jogos de tabuleiro que exigem atenção (memória, damas)',
          'Elogiar quando seu filho(a) mantiver o foco, mesmo por pouco tempo',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Melhora gradual na concentração em 2-4 semanas',
        frequency: 'Diariamente, 10-15 minutos',
      });
    }

    if (domain === 'persistence' || domain === 'Persistência') {
      recs.push({
        id: `pa_${++id}`,
        category: 'persistence',
        title: 'Fortalecer a Persistência',
        description: 'Seu filho(a) pode desistir rápido de atividades difíceis. Isso é normal e pode ser trabalhado!',
        actionSteps: [
          'Começar com atividades que ele(a) gosta e são fáceis',
          'Aumentar a dificuldade aos poucos — não pular etapas',
          'Valorizar o esforço ("Que legal que você tentou!"), não só o resultado',
          'Quando frustrado(a), ajudar a fazer junto em vez de fazer por ele(a)',
          'Criar rotina visual com 3 passos simples para tarefas do dia',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Maior tolerância à dificuldade e frustração',
        frequency: 'Sempre que surgir uma tarefa desafiadora',
      });
    }

    if (domain === 'memory' || domain === 'Memória') {
      recs.push({
        id: `pa_${++id}`,
        category: 'memory',
        title: 'Treinar a Memória em Casa',
        description: 'Atividades simples podem ajudar a fortalecer a memória do seu filho(a).',
        actionSteps: [
          'Brincar de "o que sumiu?" com objetos na mesa',
          'Contar histórias e pedir para recontar',
          'Dar 2-3 tarefas simples e ver se lembra todas',
          'Usar a plataforma NeuroPlay 10 minutos por dia',
        ],
        priority: 'medium',
        estimatedImpact: 'Melhora na retenção de informações',
        frequency: '3-4x por semana, 10 minutos',
      });
    }

    if (domain === 'flexibility' || domain === 'Flexibilidade') {
      recs.push({
        id: `pa_${++id}`,
        category: 'flexibility',
        title: 'Lidar Melhor com Mudanças',
        description: 'Seu filho(a) pode ficar irritado quando as coisas mudam. Veja como ajudar.',
        actionSteps: [
          'Avisar com antecedência quando algo vai mudar na rotina',
          'Fazer pequenas mudanças controladas para treinar adaptação',
          'Validar o sentimento ("Eu sei que é difícil quando muda")',
          'Usar histórias sociais sobre situações de mudança',
        ],
        priority: 'medium',
        estimatedImpact: 'Mais tranquilidade em situações inesperadas',
      });
    }

    if (domain === 'inhibition' || domain === 'Controle Inibitório') {
      recs.push({
        id: `pa_${++id}`,
        category: 'attention',
        title: 'Ajudar no Autocontrole',
        description: 'Criança com dificuldade em esperar a vez ou pensar antes de agir.',
        actionSteps: [
          'Brincar de "estátua" ou "semáforo" para treinar parar e esperar',
          'Usar cartões de "espere" e "agora pode" durante brincadeiras',
          'Praticar jogos de turno (cada um joga uma vez)',
          'Respiração profunda quando perceber que está ficando impulsivo(a)',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Melhora no autocontrole e convivência',
      });
    }
  }

  // Executive function — task initiation
  if (context.domainScores['taskInitiation'] !== undefined && context.domainScores['taskInitiation'] < 50) {
    recs.push({
      id: `pa_${++id}`,
      category: 'executive',
      title: 'Ajudar a Iniciar Tarefas',
      description: 'Seu filho(a) tem dificuldade em começar tarefas sozinho(a).',
      actionSteps: [
        'Criar rotina visual com 3 passos: O que fazer → Como fazer → Quando terminar',
        'Começar a tarefa junto e depois deixar continuar sozinho(a)',
        'Usar um "despertador de tarefa" — ao tocar, é hora de começar',
        'Celebrar quando iniciar sem precisar pedir',
      ],
      priority: 'medium',
      estimatedImpact: 'Maior autonomia para iniciar atividades',
      frequency: 'Diariamente nas tarefas de casa',
    });
  }

  // Emotional regulation
  if (context.frustrationLevel === 'high' || context.frustrationLevel === 'moderate') {
    recs.push({
      id: `pa_${++id}`,
      category: 'emotional',
      title: 'Lidar com a Frustração',
      description: 'Seu filho(a) tem se frustrado com frequência durante atividades.',
      actionSteps: [
        'Quando chorar ou ficar com raiva, primeiro acolher o sentimento',
        'Ensinar respiração: "Vamos respirar juntos — 4 vezes devagar"',
        'Reduzir expectativas momentaneamente e rebuildar confiança',
        'Após a crise, conversar sobre o que sentiu e o que pode fazer diferente',
        'Na plataforma, escolher atividades mais fáceis por alguns dias',
      ],
      priority: 'high',
      estimatedImpact: 'Redução de crises e melhor regulação emocional',
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: `pa_${++id}`,
      category: 'general',
      title: 'Seu Filho(a) Está Indo Bem! 🎉',
      description: 'O desempenho está adequado. Continue incentivando!',
      actionSteps: [
        'Manter rotina de atividades na plataforma (10min/dia)',
        'Variar os jogos para estimular diferentes habilidades',
        'Elogiar o esforço e a dedicação regularmente',
      ],
      priority: 'low',
      estimatedImpact: 'Manutenção do bom desenvolvimento',
    });
  }

  return recs;
}
