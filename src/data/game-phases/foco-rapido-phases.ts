import { GamePhase } from '@/types/game-phase';

export const focoRapidoPhases: GamePhase[] = [
  {
    id: 'rapido-phase-1',
    phaseNumber: 1,
    name: 'Reflexos Iniciais',
    description: 'Desenvolva velocidade básica de resposta',
    difficulty: 1,
    objectives: [
      'Reagir em menos de 1000ms',
      'Acertar 15 alvos',
      'Precisão > 75%'
    ],
    isLocked: false,
    isCompleted: false,
    stars: 0,
    gameConfig: {
      duration: 120,
      targetCount: 15,
      speedMultiplier: 0.6,
      rulesEnabled: ['basic-speed']
    },
    rewards: {
      xp: 50,
      coins: 10,
      badge: 'Relâmpago Iniciante'
    }
  },
  {
    id: 'rapido-phase-2',
    phaseNumber: 2,
    name: 'Velocidade Crescente',
    description: 'Aumente a rapidez das suas respostas',
    difficulty: 2,
    objectives: [
      'Tempo médio < 800ms',
      'Acertar 20 alvos',
      'Precisão > 80%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'rapido-phase-1',
      minStars: 1
    },
    gameConfig: {
      duration: 150,
      targetCount: 20,
      speedMultiplier: 0.8,
      rulesEnabled: ['medium-speed']
    },
    rewards: {
      xp: 75,
      coins: 15
    }
  },
  {
    id: 'rapido-phase-3',
    phaseNumber: 3,
    name: 'Foco Laser',
    description: 'Combine velocidade com precisão',
    difficulty: 3,
    objectives: [
      'Tempo médio < 600ms',
      'Acertar 25 alvos móveis',
      'Precisão > 85%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'rapido-phase-2',
      minStars: 2
    },
    gameConfig: {
      duration: 180,
      targetCount: 25,
      speedMultiplier: 1.0,
      rulesEnabled: ['moving-targets', 'precision']
    },
    rewards: {
      xp: 100,
      coins: 20,
      avatarItem: 'Óculos de Velocidade'
    }
  },
  {
    id: 'rapido-phase-4',
    phaseNumber: 4,
    name: 'Processamento Rápido',
    description: 'Tome decisões em frações de segundo',
    difficulty: 4,
    objectives: [
      'Tempo médio < 500ms',
      'Acertar 30 alvos complexos',
      'Precisão > 88%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'rapido-phase-3',
      minStars: 2,
      minAccuracy: 85
    },
    gameConfig: {
      duration: 180,
      targetCount: 30,
      speedMultiplier: 1.2,
      rulesEnabled: ['complex-targets', 'rapid-decision']
    },
    rewards: {
      xp: 125,
      coins: 25,
      badge: 'Processador Relâmpago'
    }
  },
  {
    id: 'rapido-phase-5',
    phaseNumber: 5,
    name: 'Velocidade Extrema',
    description: 'Atinja o limite da velocidade humana',
    difficulty: 4,
    objectives: [
      'Tempo médio < 400ms',
      'Acertar 35 alvos',
      'Precisão > 90%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'rapido-phase-4',
      minStars: 2
    },
    gameConfig: {
      duration: 200,
      targetCount: 35,
      speedMultiplier: 1.4,
      rulesEnabled: ['extreme-speed', 'multiple-stimuli']
    },
    rewards: {
      xp: 150,
      coins: 30,
      avatarItem: 'Luvas Supersônicas'
    }
  },
  {
    id: 'rapido-phase-6',
    phaseNumber: 6,
    name: 'Desafio Final: Velocidade da Luz',
    description: 'O teste definitivo de processamento rápido',
    difficulty: 5,
    objectives: [
      'Tempo médio < 350ms',
      'Acertar 40 alvos imprevisíveis',
      'Precisão > 92%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'rapido-phase-5',
      minStars: 3,
      minAccuracy: 90
    },
    gameConfig: {
      duration: 240,
      targetCount: 40,
      speedMultiplier: 1.6,
      rulesEnabled: ['maximum-speed', 'unpredictable', 'master-challenge']
    },
    rewards: {
      xp: 200,
      coins: 50,
      badge: 'Campeão da Velocidade',
      avatarItem: 'Coroa do Relâmpago'
    }
  }
];
