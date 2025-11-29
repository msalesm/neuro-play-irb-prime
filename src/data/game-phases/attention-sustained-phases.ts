import { GamePhase } from '@/types/game-phase';

export const attentionSustainedPhases: GamePhase[] = [
  {
    id: 'attention-phase-1',
    phaseNumber: 1,
    name: 'Introdução ao Foco',
    description: 'Aprenda o básico da atenção sustentada com tarefas simples',
    difficulty: 1,
    objectives: [
      'Manter atenção por 2 minutos',
      'Identificar alvos básicos',
      'Completar 10 tentativas'
    ],
    isLocked: false,
    isCompleted: false,
    stars: 0,
    gameConfig: {
      duration: 120,
      targetCount: 10,
      speedMultiplier: 0.6,
      rulesEnabled: ['basic-target']
    },
    rewards: {
      xp: 50,
      coins: 10,
      badge: 'Iniciante Focado'
    }
  },
  {
    id: 'attention-phase-2',
    phaseNumber: 2,
    name: 'Atenção Prolongada',
    description: 'Mantenha o foco por períodos mais longos',
    difficulty: 2,
    objectives: [
      'Manter atenção por 3 minutos',
      'Acertar 80% dos alvos',
      'Evitar 3 erros consecutivos'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'attention-phase-1',
      minStars: 1
    },
    gameConfig: {
      duration: 180,
      targetCount: 15,
      speedMultiplier: 0.8
    },
    rewards: {
      xp: 75,
      coins: 15
    }
  },
  {
    id: 'attention-phase-3',
    phaseNumber: 3,
    name: 'Foco Seletivo',
    description: 'Diferencie alvos corretos de distratores',
    difficulty: 2,
    objectives: [
      'Ignorar distratores',
      'Precisão de 85%',
      'Tempo de reação < 800ms'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'attention-phase-2',
      minStars: 2
    },
    gameConfig: {
      duration: 180,
      targetCount: 20,
      speedMultiplier: 0.9,
      rulesEnabled: ['distractors']
    },
    rewards: {
      xp: 100,
      coins: 20,
      avatarItem: 'Óculos de Foco'
    }
  },
  {
    id: 'attention-phase-4',
    phaseNumber: 4,
    name: 'Concentração Intensa',
    description: 'Mantenha atenção máxima sob pressão',
    difficulty: 3,
    objectives: [
      'Duração de 5 minutos',
      'Precisão de 90%',
      'Sem pausas'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'attention-phase-3',
      minStars: 2
    },
    gameConfig: {
      duration: 300,
      targetCount: 30,
      speedMultiplier: 1.0,
      rulesEnabled: ['distractors', 'speed-variation']
    },
    rewards: {
      xp: 125,
      coins: 25,
      badge: 'Mestre da Atenção'
    }
  },
  {
    id: 'attention-phase-5',
    phaseNumber: 5,
    name: 'Vigilância Avançada',
    description: 'Detecte padrões sutis em sequências longas',
    difficulty: 4,
    objectives: [
      'Identificar alvos raros',
      'Manter vigilância por 7 minutos',
      'Taxa de acerto > 92%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'attention-phase-4',
      minStars: 2,
      minAccuracy: 90
    },
    gameConfig: {
      duration: 420,
      targetCount: 40,
      speedMultiplier: 1.1,
      rulesEnabled: ['rare-targets', 'distractors']
    },
    rewards: {
      xp: 150,
      coins: 30,
      avatarItem: 'Capacete de Concentração'
    }
  },
  {
    id: 'attention-phase-6',
    phaseNumber: 6,
    name: 'Desafio Final: Foco Supremo',
    description: 'O teste definitivo de atenção sustentada',
    difficulty: 5,
    objectives: [
      'Manter atenção por 10 minutos',
      'Precisão de 95%',
      'Completar sem erros críticos'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'attention-phase-5',
      minStars: 3,
      minAccuracy: 92
    },
    gameConfig: {
      duration: 600,
      targetCount: 50,
      speedMultiplier: 1.2,
      rulesEnabled: ['rare-targets', 'distractors', 'speed-variation', 'pattern-shift']
    },
    rewards: {
      xp: 200,
      coins: 50,
      badge: 'Campeão da Atenção Sustentada',
      avatarItem: 'Coroa de Foco Inabalável'
    }
  }
];
