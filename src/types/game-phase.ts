export interface GamePhase {
  id: string;
  phaseNumber: number;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  objectives: string[];
  isLocked: boolean;
  isCompleted: boolean;
  stars: number; // 0-3 stars based on performance
  bestScore?: number;
  unlockRequirement?: {
    previousPhase?: string;
    minStars?: number;
    minAccuracy?: number;
  };
  gameConfig: {
    duration?: number; // seconds
    targetCount?: number;
    speedMultiplier?: number;
    rulesEnabled?: string[];
    customSettings?: Record<string, any>;
  };
  rewards: {
    xp: number;
    coins?: number;
    badge?: string;
    avatarItem?: string;
  };
}

export interface GamePhaseProgress {
  gameId: string;
  childProfileId: string;
  phases: {
    [phaseId: string]: {
      completed: boolean;
      stars: number;
      bestScore: number;
      attempts: number;
      lastPlayedAt: string;
    };
  };
  currentPhase: string;
  totalStars: number;
  totalXP: number;
}
