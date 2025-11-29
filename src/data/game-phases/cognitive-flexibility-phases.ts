import { GamePhase } from '@/types/game-phase';

export const cognitiveFlexibilityPhases: GamePhase[] = [
  // FASE 1: Introdução - Aprender as Regras Básicas
  {
    id: 'flex-phase-1',
    phaseNumber: 1,
    name: 'Despertar das Regras',
    description: 'Aprenda a combinar cartas por cor. Regra única e simples para começar.',
    difficulty: 1,
    objectives: [
      'Complete 10 tentativas',
      'Alcance 70% de precisão',
      'Compreenda a regra de combinação por cor'
    ],
    isLocked: false,
    isCompleted: false,
    stars: 0,
    gameConfig: {
      duration: 120,
      targetCount: 10,
      speedMultiplier: 0.8,
      rulesEnabled: ['color'],
      customSettings: {
        showHints: true,
        allowRetry: true,
        maxErrors: 5
      }
    },
    rewards: {
      xp: 50,
      coins: 10,
      badge: 'iniciante-flex'
    }
  },

  // FASE 2: Duas Regras Alternadas
  {
    id: 'flex-phase-2',
    phaseNumber: 2,
    name: 'Dança das Formas',
    description: 'Agora combine por cor OU forma. A regra alterna a cada 5 acertos.',
    difficulty: 2,
    objectives: [
      'Complete 15 tentativas',
      'Alcance 70% de precisão',
      'Adapte-se a 2 mudanças de regra'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'flex-phase-1',
      minStars: 1
    },
    gameConfig: {
      duration: 180,
      targetCount: 15,
      speedMultiplier: 0.9,
      rulesEnabled: ['color', 'shape'],
      customSettings: {
        showHints: true,
        ruleChangeAfter: 5,
        maxErrors: 7
      }
    },
    rewards: {
      xp: 75,
      coins: 15,
      badge: 'adaptador'
    }
  },

  // FASE 3: Três Regras - Ritmo Acelerado
  {
    id: 'flex-phase-3',
    phaseNumber: 3,
    name: 'Trio de Transformação',
    description: 'Combine por cor, forma OU número. Mudanças mais frequentes!',
    difficulty: 3,
    objectives: [
      'Complete 20 tentativas',
      'Alcance 75% de precisão',
      'Adapte-se a 4 mudanças de regra',
      'Mantenha menos de 3 erros consecutivos'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'flex-phase-2',
      minStars: 2,
      minAccuracy: 0.7
    },
    gameConfig: {
      duration: 240,
      targetCount: 20,
      speedMultiplier: 1.0,
      rulesEnabled: ['color', 'shape', 'number'],
      customSettings: {
        showHints: false,
        ruleChangeAfter: 4,
        maxErrors: 8
      }
    },
    rewards: {
      xp: 100,
      coins: 25,
      badge: 'mestre-mudanca',
      avatarItem: 'capa-flexivel'
    }
  },

  // FASE 4: Desafio Sem Aviso
  {
    id: 'flex-phase-4',
    phaseNumber: 4,
    name: 'Tempestade Cognitiva',
    description: 'Regras mudam sem aviso prévio. Confie apenas no feedback!',
    difficulty: 4,
    objectives: [
      'Complete 25 tentativas',
      'Alcance 80% de precisão',
      'Adapte-se a 6 mudanças de regra',
      'Menos de 20% de erros perseverativos'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'flex-phase-3',
      minStars: 2,
      minAccuracy: 0.75
    },
    gameConfig: {
      duration: 300,
      targetCount: 25,
      speedMultiplier: 1.1,
      rulesEnabled: ['color', 'shape', 'number'],
      customSettings: {
        showHints: false,
        silentRuleChanges: true,
        ruleChangeAfter: 3,
        maxErrors: 10
      }
    },
    rewards: {
      xp: 150,
      coins: 40,
      badge: 'navegador-caos'
    }
  },

  // FASE 5: Mestre da Flexibilidade
  {
    id: 'flex-phase-5',
    phaseNumber: 5,
    name: 'Vórtice Supremo',
    description: 'Teste final: 30 tentativas, mudanças rápidas, pressão temporal!',
    difficulty: 5,
    objectives: [
      'Complete 30 tentativas',
      'Alcance 85% de precisão',
      'Adapte-se a 8 mudanças de regra',
      'Custo de troca < 150ms',
      'Zero erros perseverativos no final'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'flex-phase-4',
      minStars: 3,
      minAccuracy: 0.8
    },
    gameConfig: {
      duration: 360,
      targetCount: 30,
      speedMultiplier: 1.3,
      rulesEnabled: ['color', 'shape', 'number'],
      customSettings: {
        showHints: false,
        silentRuleChanges: true,
        rapidChanges: true,
        ruleChangeAfter: 2,
        maxErrors: 10,
        timeLimit: true
      }
    },
    rewards: {
      xp: 250,
      coins: 75,
      badge: 'mestre-vortex',
      avatarItem: 'coroa-cognitiva'
    }
  },

  // FASE 6: Desafio Infinito (Opcional)
  {
    id: 'flex-phase-6',
    phaseNumber: 6,
    name: 'Infinitude Adaptativa',
    description: 'Modo desafio: quanto tempo você aguenta? Dificuldade progressiva!',
    difficulty: 5,
    objectives: [
      'Sobreviva o máximo de tempo possível',
      'Mantenha 90% de precisão',
      'Estabeleça novo recorde pessoal'
    ],
    isLocked: true,
    isCompleted: false,
    stars: 0,
    unlockRequirement: {
      previousPhase: 'flex-phase-5',
      minStars: 3
    },
    gameConfig: {
      duration: -1, // infinite
      targetCount: -1,
      speedMultiplier: 1.5,
      rulesEnabled: ['color', 'shape', 'number'],
      customSettings: {
        showHints: false,
        silentRuleChanges: true,
        adaptiveDifficulty: true,
        survivalMode: true,
        maxErrors: 3 // game over after 3 errors
      }
    },
    rewards: {
      xp: 500,
      coins: 150,
      badge: 'imortal-flex',
      avatarItem: 'aura-infinita'
    }
  }
];
