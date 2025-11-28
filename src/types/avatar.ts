export interface AvatarBase {
  id: string;
  name: string;
  emoji: string;
  category: 'animals' | 'robots' | 'heroes';
}

export interface AvatarAccessory {
  id: string;
  name: string;
  emoji: string;
  type: 'hat' | 'glasses' | 'badge' | 'wings' | 'aura' | 'crown';
  unlockCondition: {
    type: 'planets_completed' | 'missions_completed' | 'score_reached' | 'streak_days';
    value: number;
    planetId?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AvatarLevel {
  level: number;
  name: string;
  planetsRequired: number;
  visualEffects: {
    glow: boolean;
    particles: boolean;
    animation: 'none' | 'pulse' | 'float' | 'spin';
    glowColor: string;
  };
  unlockedAccessories: string[];
}

export interface AvatarEvolution {
  childId: string;
  baseAvatar: AvatarBase;
  currentLevel: number;
  equippedAccessories: string[];
  unlockedAccessories: string[];
  totalPlanetsCompleted: number;
  totalMissionsCompleted: number;
  totalScore: number;
  evolutionHistory: {
    date: string;
    level: number;
    trigger: string;
  }[];
}

export const AVATAR_LEVELS: AvatarLevel[] = [
  {
    level: 1,
    name: 'Explorador Iniciante',
    planetsRequired: 0,
    visualEffects: {
      glow: false,
      particles: false,
      animation: 'none',
      glowColor: '#ffffff',
    },
    unlockedAccessories: [],
  },
  {
    level: 2,
    name: 'Explorador Estelar',
    planetsRequired: 1,
    visualEffects: {
      glow: true,
      particles: false,
      animation: 'pulse',
      glowColor: '#60a5fa',
    },
    unlockedAccessories: ['basic-badge', 'star-glasses'],
  },
  {
    level: 3,
    name: 'Navegador Cósmico',
    planetsRequired: 2,
    visualEffects: {
      glow: true,
      particles: true,
      animation: 'float',
      glowColor: '#a78bfa',
    },
    unlockedAccessories: ['cosmic-hat', 'nebula-aura'],
  },
  {
    level: 4,
    name: 'Guardião Galáctico',
    planetsRequired: 3,
    visualEffects: {
      glow: true,
      particles: true,
      animation: 'float',
      glowColor: '#f59e0b',
    },
    unlockedAccessories: ['guardian-wings', 'golden-crown'],
  },
  {
    level: 5,
    name: 'Mestre do Universo',
    planetsRequired: 5,
    visualEffects: {
      glow: true,
      particles: true,
      animation: 'spin',
      glowColor: '#c7923e',
    },
    unlockedAccessories: ['master-crown', 'universe-aura', 'legendary-wings'],
  },
];

export const AVATAR_ACCESSORIES: AvatarAccessory[] = [
  // Level 2 Accessories
  {
    id: 'basic-badge',
    name: 'Estrela de Bronze',
    emoji: '🥉',
    type: 'badge',
    unlockCondition: { type: 'planets_completed', value: 1 },
    rarity: 'common',
  },
  {
    id: 'star-glasses',
    name: 'Óculos Estelares',
    emoji: '🕶️',
    type: 'glasses',
    unlockCondition: { type: 'planets_completed', value: 1 },
    rarity: 'common',
  },
  
  // Level 3 Accessories
  {
    id: 'cosmic-hat',
    name: 'Chapéu Cósmico',
    emoji: '🎩',
    type: 'hat',
    unlockCondition: { type: 'planets_completed', value: 2 },
    rarity: 'rare',
  },
  {
    id: 'nebula-aura',
    name: 'Aura de Nebulosa',
    emoji: '✨',
    type: 'aura',
    unlockCondition: { type: 'planets_completed', value: 2 },
    rarity: 'rare',
  },
  
  // Level 4 Accessories
  {
    id: 'guardian-wings',
    name: 'Asas do Guardião',
    emoji: '🦅',
    type: 'wings',
    unlockCondition: { type: 'planets_completed', value: 3 },
    rarity: 'epic',
  },
  {
    id: 'golden-crown',
    name: 'Coroa Dourada',
    emoji: '👑',
    type: 'crown',
    unlockCondition: { type: 'planets_completed', value: 3 },
    rarity: 'epic',
  },
  
  // Level 5 Accessories
  {
    id: 'master-crown',
    name: 'Coroa do Mestre',
    emoji: '💎',
    type: 'crown',
    unlockCondition: { type: 'planets_completed', value: 5 },
    rarity: 'legendary',
  },
  {
    id: 'universe-aura',
    name: 'Aura Universal',
    emoji: '🌟',
    type: 'aura',
    unlockCondition: { type: 'planets_completed', value: 5 },
    rarity: 'legendary',
  },
  {
    id: 'legendary-wings',
    name: 'Asas Lendárias',
    emoji: '🦋',
    type: 'wings',
    unlockCondition: { type: 'planets_completed', value: 5 },
    rarity: 'legendary',
  },
  
  // Special Planet Achievements
  {
    id: 'aurora-badge',
    name: 'Guardião de Aurora',
    emoji: '🌈',
    type: 'badge',
    unlockCondition: { type: 'planets_completed', value: 1, planetId: 'aurora' },
    rarity: 'epic',
  },
  {
    id: 'vortex-badge',
    name: 'Mestre do Vortex',
    emoji: '🌀',
    type: 'badge',
    unlockCondition: { type: 'planets_completed', value: 1, planetId: 'vortex' },
    rarity: 'epic',
  },
  {
    id: 'lumen-badge',
    name: 'Sábio de Lumen',
    emoji: '📚',
    type: 'badge',
    unlockCondition: { type: 'planets_completed', value: 1, planetId: 'lumen' },
    rarity: 'epic',
  },
];
