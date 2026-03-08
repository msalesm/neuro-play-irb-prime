// Level progression system for NeuroPlay
export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
  color: string;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1, title: 'Explorador Iniciante', xpRequired: 0, icon: '🌱', color: 'hsl(var(--accent))' },
  { level: 2, title: 'Descobridor', xpRequired: 100, icon: '🔍', color: 'hsl(var(--accent))' },
  { level: 3, title: 'Aventureiro Cognitivo', xpRequired: 250, icon: '🧭', color: 'hsl(var(--neuroplay-blue))' },
  { level: 4, title: 'Viajante Estelar', xpRequired: 500, icon: '🚀', color: 'hsl(var(--neuroplay-blue))' },
  { level: 5, title: 'Mestre da Atenção', xpRequired: 800, icon: '🎯', color: 'hsl(var(--neuroplay-purple))' },
  { level: 6, title: 'Guardião da Memória', xpRequired: 1200, icon: '🧠', color: 'hsl(var(--neuroplay-purple))' },
  { level: 7, title: 'Herói da Persistência', xpRequired: 1800, icon: '💪', color: 'hsl(var(--neuroplay-orange))' },
  { level: 8, title: 'Mago dos Padrões', xpRequired: 2500, icon: '✨', color: 'hsl(var(--neuroplay-orange))' },
  { level: 9, title: 'Lenda Neurocognitiva', xpRequired: 3500, icon: '👑', color: 'hsl(var(--neuroplay-yellow))' },
  { level: 10, title: 'Guardião do NeuroPlay', xpRequired: 5000, icon: '🌟', color: 'hsl(var(--neuroplay-yellow))' },
];

export function getLevelInfo(xp: number): LevelInfo {
  let current = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (xp >= tier.xpRequired) {
      current = tier;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevelInfo(xp: number): LevelInfo | null {
  for (const tier of LEVEL_TIERS) {
    if (xp < tier.xpRequired) {
      return tier;
    }
  }
  return null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevelInfo(xp);
  const next = getNextLevelInfo(xp);
  if (!next) return 100;
  const range = next.xpRequired - current.xpRequired;
  const progress = xp - current.xpRequired;
  return Math.min(100, (progress / range) * 100);
}

// Cognitive Worlds
export interface CognitiveWorld {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradient: string;
  domain: string;
  requiredLevel: number;
  games: string[];
}

export const COGNITIVE_WORLDS: CognitiveWorld[] = [
  {
    id: 'floresta-atencao',
    name: 'Floresta da Atenção',
    icon: '🌳',
    description: 'Treine o foco e a atenção sustentada',
    gradient: 'from-green-500 to-emerald-600',
    domain: 'attention',
    requiredLevel: 1,
    games: ['cosmic-sequence', 'logica-rapida'],
  },
  {
    id: 'planeta-memoria',
    name: 'Planeta da Memória',
    icon: '🌌',
    description: 'Exercite a memória de trabalho e visual',
    gradient: 'from-purple-500 to-violet-600',
    domain: 'memory',
    requiredLevel: 1,
    games: ['memoria-colorida', 'sensory-flow'],
  },
  {
    id: 'cidade-logica',
    name: 'Cidade da Lógica',
    icon: '🏙️',
    description: 'Resolva problemas e encontre padrões',
    gradient: 'from-blue-500 to-cyan-600',
    domain: 'logic',
    requiredLevel: 2,
    games: ['aventura-numeros', 'pattern-recognition'],
  },
  {
    id: 'vale-persistencia',
    name: 'Vale da Persistência',
    icon: '⛰️',
    description: 'Desenvolva flexibilidade cognitiva',
    gradient: 'from-orange-500 to-amber-600',
    domain: 'flexibility',
    requiredLevel: 3,
    games: ['social-scenarios'],
  },
  {
    id: 'oceano-emocoes',
    name: 'Oceano das Emoções',
    icon: '🌊',
    description: 'Explore e compreenda sentimentos',
    gradient: 'from-pink-500 to-rose-600',
    domain: 'emotional',
    requiredLevel: 2,
    games: ['emotion-lab', 'ritmo-musical'],
  },
];

// Weekly missions templates
export interface WeeklyMission {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  icon: string;
}

export const WEEKLY_MISSION_TEMPLATES: Omit<WeeklyMission, 'current'>[] = [
  { id: 'weekly-games-10', title: 'Jogue 10 partidas', target: 10, xpReward: 100, icon: '🎮' },
  { id: 'weekly-stories-3', title: 'Complete 3 histórias', target: 3, xpReward: 75, icon: '📖' },
  { id: 'weekly-routine-5', title: 'Complete 5 dias de rotina', target: 5, xpReward: 120, icon: '✅' },
  { id: 'weekly-perfect-3', title: '3 jogos com 80%+ acerto', target: 3, xpReward: 80, icon: '🎯' },
];

// Badge / collectible definitions
export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'performance' | 'exploration' | 'social' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: BadgeDefinition[] = [
  { key: 'first_game', name: 'Primeiro Passo', description: 'Complete seu primeiro jogo', icon: '🎮', category: 'milestone', rarity: 'common' },
  { key: 'games_10', name: 'Jogador Dedicado', description: 'Complete 10 jogos', icon: '🏅', category: 'milestone', rarity: 'common' },
  { key: 'games_50', name: 'Veterano', description: 'Complete 50 jogos', icon: '🎖️', category: 'milestone', rarity: 'rare' },
  { key: 'games_100', name: 'Centurião', description: 'Complete 100 jogos', icon: '🏆', category: 'milestone', rarity: 'epic' },
  { key: 'accuracy_85', name: 'Precisão Afiada', description: '85% de acerto em um jogo', icon: '🎯', category: 'performance', rarity: 'common' },
  { key: 'accuracy_95', name: 'Quase Perfeito', description: '95% de acerto em um jogo', icon: '💎', category: 'performance', rarity: 'rare' },
  { key: 'perfect_score', name: 'Perfeição', description: '100% de acerto em um jogo', icon: '⭐', category: 'performance', rarity: 'epic' },
  { key: 'speed_demon', name: 'Velocidade Mental', description: 'Tempo de reação < 500ms', icon: '⚡', category: 'performance', rarity: 'rare' },
  { key: 'consistent', name: 'Consistente', description: '5 jogos seguidos com 80%+', icon: '📈', category: 'performance', rarity: 'rare' },
  { key: 'night_owl', name: 'Coruja Noturna', description: 'Jogue depois das 20h', icon: '🦉', category: 'exploration', rarity: 'common' },
  { key: 'early_bird', name: 'Madrugador', description: 'Jogue antes das 8h', icon: '🐦', category: 'exploration', rarity: 'common' },
  { key: 'streak_3', name: 'Sequência de 3', description: '3 dias seguidos', icon: '🔥', category: 'streak', rarity: 'common' },
  { key: 'streak_7', name: 'Semana Perfeita', description: '7 dias seguidos', icon: '🔥', category: 'streak', rarity: 'rare' },
  { key: 'streak_30', name: 'Mês Imbatível', description: '30 dias seguidos', icon: '🔥', category: 'streak', rarity: 'legendary' },
  { key: 'tour_first', name: 'Curioso', description: 'Complete seu primeiro tour', icon: '🗺️', category: 'exploration', rarity: 'common' },
  { key: 'tour_master', name: 'Mestre Explorador', description: 'Complete todos os tours', icon: '🧭', category: 'exploration', rarity: 'epic' },
];

export function getBadgeRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'border-muted-foreground/30 bg-muted/50';
    case 'rare': return 'border-primary/50 bg-primary/10';
    case 'epic': return 'border-secondary/50 bg-secondary/10';
    case 'legendary': return 'border-[hsl(var(--neuroplay-orange))]/50 bg-[hsl(var(--neuroplay-orange))]/10';
    default: return 'border-border bg-card';
  }
}

export function getBadgeRarityLabel(rarity: string): string {
  switch (rarity) {
    case 'common': return 'Comum';
    case 'rare': return 'Raro';
    case 'epic': return 'Épico';
    case 'legendary': return 'Lendário';
    default: return rarity;
  }
}
