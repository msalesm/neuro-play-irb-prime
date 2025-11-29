import { GamePhase } from '@/types/game-phase';

export const focusForestPhases: GamePhase[] = [
  {
    id: 'forest-phase-1',
    phaseNumber: 1,
    name: 'Semente do Foco',
    description: 'Plante sua primeira árvore da atenção',
    difficulty: 1,
    objectives: [
      'Manter foco por 5 minutos',
      'Sem distrações',
      'Cultivar primeira árvore'
    ],
    isLocked: false,
    isCompleted: false,
    stars: 0,
    gameConfig: {
      duration: 300,
      customSettings: {
        treeType: 'sapling',
        distractionLevel: 'low'
      }
    },
    rewards: {
      xp: 50,
      coins: 10,
      badge: 'Jardineiro Iniciante'
    }
  },
  {
    id: 'forest-phase-2',
    phaseNumber: 2,
    name: 'Brotos de Atenção',
    description: 'Cultive múltiplas árvores jovens',
    difficulty: 2,
    objectives: [
      'Focar por 10 minutos',
      'Cultivar 3 árvores',
      'Taxa de conclusão > 80%'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'forest-phase-1',
      minStars: 1
    },
    gameConfig: {
      duration: 600,
      customSettings: {
        treeType: 'young',
        forestSize: 3,
        distractionLevel: 'medium'
      }
    },
    rewards: {
      xp: 75,
      coins: 15,
      avatarItem: 'Regador Mágico'
    }
  },
  {
    id: 'forest-phase-3',
    phaseNumber: 3,
    name: 'Bosque em Crescimento',
    description: 'Desenvolva um pequeno bosque',
    difficulty: 2,
    objectives: [
      'Sessão de 15 minutos',
      'Cultivar 5 árvores maduras',
      'Manter streak de 3 dias'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'forest-phase-2',
      minStars: 2
    },
    gameConfig: {
      duration: 900,
      customSettings: {
        treeType: 'mature',
        forestSize: 5,
        distractionLevel: 'medium'
      }
    },
    rewards: {
      xp: 100,
      coins: 20,
      badge: 'Guardião do Bosque'
    }
  },
  {
    id: 'forest-phase-4',
    phaseNumber: 4,
    name: 'Floresta da Concentração',
    description: 'Crie uma floresta densa e próspera',
    difficulty: 3,
    objectives: [
      'Sessão de 20 minutos',
      'Cultivar 8 árvores',
      'Desbloquear árvores especiais'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'forest-phase-3',
      minStars: 2
    },
    gameConfig: {
      duration: 1200,
      customSettings: {
        treeType: 'special',
        forestSize: 8,
        distractionLevel: 'high',
        specialTrees: true
      }
    },
    rewards: {
      xp: 125,
      coins: 25,
      avatarItem: 'Machado de Ouro'
    }
  },
  {
    id: 'forest-phase-5',
    phaseNumber: 5,
    name: 'Santuário Verde',
    description: 'Construa um refúgio de tranquilidade',
    difficulty: 4,
    objectives: [
      'Sessão de 30 minutos',
      'Cultivar 12 árvores variadas',
      'Streak de 7 dias'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'forest-phase-4',
      minStars: 2
    },
    gameConfig: {
      duration: 1800,
      customSettings: {
        treeType: 'ancient',
        forestSize: 12,
        distractionLevel: 'high',
        specialTrees: true,
        weatherEffects: true
      }
    },
    rewards: {
      xp: 150,
      coins: 30,
      badge: 'Sábio da Floresta'
    }
  },
  {
    id: 'forest-phase-6',
    phaseNumber: 6,
    name: 'Desafio Final: Floresta Mística',
    description: 'Cultive a floresta lendária',
    difficulty: 5,
    objectives: [
      'Sessão de 45 minutos',
      'Cultivar 20 árvores místicas',
      'Desbloquear todas as espécies'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'forest-phase-5',
      minStars: 3
    },
    gameConfig: {
      duration: 2700,
      customSettings: {
        treeType: 'legendary',
        forestSize: 20,
        distractionLevel: 'extreme',
        allFeatures: true
      }
    },
    rewards: {
      xp: 200,
      coins: 50,
      badge: 'Arqui-Druida do Foco',
      avatarItem: 'Coroa da Floresta Eterna'
    }
  }
];
