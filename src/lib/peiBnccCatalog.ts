/**
 * Catálogo BNCC pré-definido para geração determinística de metas no PEI.
 * Cada área devolve metas pedagógicas com objetivo, estratégias e recomendações,
 * alinhadas a habilidades da BNCC. Sem IA — escolhas do professor.
 */

export interface BnccGoalTemplate {
  area: string;
  bnccCode: string;
  objective: string;
  strategies: string[];
  recommendations: string[];
  suggestedTimeline: string;
}

export const PEI_BNCC_AREAS = [
  'Linguagem',
  'Matemática',
  'Atenção',
  'Memória',
  'Socioemocional',
  'Função Executiva',
] as const;

export type PeiBnccArea = typeof PEI_BNCC_AREAS[number];

export const PEI_BNCC_CATALOG: Record<PeiBnccArea, BnccGoalTemplate[]> = {
  Linguagem: [
    {
      area: 'Linguagem',
      bnccCode: 'EF01LP06',
      objective: 'Segmentar oralmente palavras em sílabas com 80% de acerto.',
      strategies: [
        'Bater palmas a cada sílaba durante a leitura',
        'Jogo de cartões com sílabas separadas',
        'Leitura compartilhada de parlendas',
      ],
      recommendations: [
        'Usar palavras do cotidiano do aluno',
        'Repetir o exercício em sessões curtas (10 min) 3x por semana',
      ],
      suggestedTimeline: '8 semanas',
    },
    {
      area: 'Linguagem',
      bnccCode: 'EF02LP01',
      objective: 'Ler palavras novas com correspondência fonema-grafema regular.',
      strategies: [
        'Atividades de pareamento letra-som',
        'Leitura guiada com apoio visual',
      ],
      recommendations: [
        'Disponibilizar fichas com alfabeto móvel',
        'Reduzir a quantidade de texto por página',
      ],
      suggestedTimeline: '12 semanas',
    },
  ],
  Matemática: [
    {
      area: 'Matemática',
      bnccCode: 'EF01MA02',
      objective: 'Contar de forma exata até 50 utilizando estratégias variadas.',
      strategies: [
        'Uso de material concreto (tampinhas, blocos)',
        'Linha numérica visual no caderno',
        'Jogos de tabuleiro com dados',
      ],
      recommendations: [
        'Iniciar pelas quantidades já dominadas (até 20)',
        'Avaliar progresso semanalmente',
      ],
      suggestedTimeline: '6 semanas',
    },
    {
      area: 'Matemática',
      bnccCode: 'EF02MA05',
      objective: 'Resolver problemas simples de adição e subtração com suporte visual.',
      strategies: [
        'Problemas contextualizados em situações reais',
        'Esquemas pictóricos para representar a operação',
      ],
      recommendations: [
        'Permitir o uso de calculadora para verificação',
        'Conceder tempo adicional na avaliação',
      ],
      suggestedTimeline: '10 semanas',
    },
  ],
  Atenção: [
    {
      area: 'Atenção',
      bnccCode: 'EF01LP01',
      objective: 'Manter a atenção sustentada em uma atividade dirigida por 15 minutos.',
      strategies: [
        'Dividir a tarefa em blocos curtos com pausas',
        'Usar timer visual (ampulheta ou Pomodoro infantil)',
        'Eliminar distratores da mesa',
      ],
      recommendations: [
        'Posicionar o aluno próximo ao professor',
        'Reforçar verbalmente cada bloco concluído',
      ],
      suggestedTimeline: '8 semanas',
    },
  ],
  Memória: [
    {
      area: 'Memória',
      bnccCode: 'EF01MA01',
      objective: 'Recuperar 5 itens em sequência após instrução verbal.',
      strategies: [
        'Jogos de memória visual',
        'Repetição espaçada de instruções',
        'Associação imagem + palavra',
      ],
      recommendations: [
        'Fragmentar instruções longas em até 3 passos',
        'Disponibilizar lista de apoio escrita',
      ],
      suggestedTimeline: '6 semanas',
    },
  ],
  Socioemocional: [
    {
      area: 'Socioemocional',
      bnccCode: 'EF01LP15',
      objective: 'Identificar e nomear 4 emoções básicas em si e nos colegas.',
      strategies: [
        'Roda de conversa com cartões de emoção',
        'Diário emocional ilustrado',
        'Histórias sociais sobre conflitos comuns',
      ],
      recommendations: [
        'Validar a emoção antes de propor regulação',
        'Combinar sinal silencioso para sair quando sobrecarregado',
      ],
      suggestedTimeline: '10 semanas',
    },
  ],
  'Função Executiva': [
    {
      area: 'Função Executiva',
      bnccCode: 'EF02LP05',
      objective: 'Planejar e executar uma tarefa de 3 etapas sem reorientação.',
      strategies: [
        'Checklist visual da tarefa',
        'Modelagem da etapa pelo professor antes da execução',
        'Auto-monitoramento com carinhas de feedback',
      ],
      recommendations: [
        'Antecipar transições com 2 minutos de aviso',
        'Combinar rotina visual fixa na sala',
      ],
      suggestedTimeline: '12 semanas',
    },
  ],
};

export function getBnccGoalsForArea(area: string): BnccGoalTemplate[] {
  return PEI_BNCC_CATALOG[area as PeiBnccArea] ?? [];
}

export function getAllBnccGoals(): BnccGoalTemplate[] {
  return PEI_BNCC_AREAS.flatMap((a) => PEI_BNCC_CATALOG[a]);
}