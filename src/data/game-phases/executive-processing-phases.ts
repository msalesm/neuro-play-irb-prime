import { GamePhase } from '@/types/game-phase';

export const executiveProcessingPhases: GamePhase[] = [
  {
    id: 'executive-phase-1',
    phaseNumber: 1,
    name: 'Controle Básico',
    description: 'Aprenda a inibir respostas automáticas',
    difficulty: 1,
    objectives: [
      'Responder corretamente a 10 sinais',
      'Evitar 3 erros impulsivos',
      'Completar em menos de 2 minutos'
    ],
    isLocked: false,
    isCompleted: false,
    stars: 0,
    gameConfig: {
      duration: 120,
      targetCount: 10,
      speedMultiplier: 0.7,
      rulesEnabled: ['go-nogo-basic']
    },
    rewards: {
      xp: 50,
      coins: 10,
      badge: 'Controlador Iniciante'
    }
  },
  {
    id: 'executive-phase-2',
    phaseNumber: 2,
    name: 'Inibição Intermediária',
    description: 'Aumente a complexidade das decisões',
    difficulty: 2,
    objectives: [
      'Taxa de acerto > 85%',
      'Tempo de reação < 700ms',
      'Máximo 2 respostas impulsivas'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'executive-phase-1',
      minStars: 1
    },
    gameConfig: {
      duration: 180,
      targetCount: 15,
      speedMultiplier: 0.85,
      rulesEnabled: ['go-nogo-intermediate']
    },
    rewards: {
      xp: 75,
      coins: 15
    }
  },
  {
    id: 'executive-phase-3',
    phaseNumber: 3,
    name: 'Controle Avançado',
    description: 'Gerencie múltiplas regras de resposta',
    difficulty: 3,
    objectives: [
      'Alternar entre 2 regras',
      'Precisão de 88%',
      'Sem pausas ou hesitações'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'executive-phase-2',
      minStars: 2
    },
    gameConfig: {
      duration: 240,
      targetCount: 20,
      speedMultiplier: 1.0,
      rulesEnabled: ['rule-switching', 'conflicting-stimuli']
    },
    rewards: {
      xp: 100,
      coins: 20,
      avatarItem: 'Escudo Inibitório'
    }
  },
  {
    id: 'executive-phase-4',
    phaseNumber: 4,
    name: 'Inibição sob Pressão',
    description: 'Mantenha controle com estímulos rápidos',
    difficulty: 4,
    objectives: [
      'Velocidade aumentada 50%',
      'Taxa de acerto > 90%',
      'Máximo 1 erro impulsivo'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'executive-phase-3',
      minStars: 2,
      minAccuracy: 88
    },
    gameConfig: {
      duration: 180,
      targetCount: 30,
      speedMultiplier: 1.3,
      rulesEnabled: ['high-speed', 'conflicting-stimuli']
    },
    rewards: {
      xp: 125,
      coins: 25,
      badge: 'Inibidor Expert'
    }
  },
  {
    id: 'executive-phase-5',
    phaseNumber: 5,
    name: 'Maestria Executiva',
    description: 'Domine múltiplas dimensões de controle',
    difficulty: 4,
    objectives: [
      'Gerenciar 3 regras simultâneas',
      'Precisão de 92%',
      'Tempo médio < 500ms'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'executive-phase-4',
      minStars: 2
    },
    gameConfig: {
      duration: 300,
      targetCount: 35,
      speedMultiplier: 1.2,
      rulesEnabled: ['triple-rule', 'conflicting-stimuli', 'variable-timing']
    },
    rewards: {
      xp: 150,
      coins: 30,
      avatarItem: 'Cetro do Controle'
    }
  },
  {
    id: 'executive-phase-6',
    phaseNumber: 6,
    name: 'Desafio Final: Controle Supremo',
    description: 'O teste definitivo de controle inibitório',
    difficulty: 5,
    objectives: [
      'Precisão de 95%',
      'Responder a estímulos complexos',
      'Zero erros impulsivos'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'executive-phase-5',
      minStars: 3,
      minAccuracy: 92
    },
    gameConfig: {
      duration: 360,
      targetCount: 40,
      speedMultiplier: 1.4,
      rulesEnabled: ['master-challenge', 'all-distractors', 'adaptive-difficulty']
    },
    rewards: {
      xp: 200,
      coins: 50,
      badge: 'Mestre do Controle Executivo',
      avatarItem: 'Coroa da Inibição Perfeita'
    }
  }
];
