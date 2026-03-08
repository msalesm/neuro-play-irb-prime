/**
 * Centralized Game Engine
 * 
 * Unified interface for all cognitive games.
 * Handles session lifecycle, metrics collection, and adaptive difficulty.
 */

// ─── Types ────────────────────────────────────────────────

export interface GameMetrics {
  reactionTimeMs: number;
  accuracy: number; // 0-1
  errorsCount: number;
  correctAnswers: number;
  totalAttempts: number;
  omissionErrors: number;
  commissionErrors: number;
  reactionTimeVariability: number; // standard deviation
  maxSpan: number; // for memory tasks
  perseverationErrors: number; // for flexibility tasks
  averageDeviation: number; // for coordination tasks
  corrections: number;
  focusTimeSeconds: number;
  persistenceSeconds: number;
  postErrorLatencyMs: number;
  recoveryAfterError: boolean;
  blockPerformance: number[]; // per-block accuracy
}

export interface GameSessionConfig {
  gameId: string;
  gameName: string;
  cognitiveDomainsTargeted: CognitiveDomain[];
  difficulty: number; // 1-10
  maxDuration?: number; // seconds
  adaptiveEnabled?: boolean;
}

export type CognitiveDomain = 
  | 'attention'
  | 'inhibition'
  | 'memory'
  | 'flexibility'
  | 'coordination'
  | 'persistence'
  | 'emotional-regulation';

export interface GameEvent {
  type: 'trial_start' | 'trial_end' | 'correct' | 'error' | 'omission' | 'commission' | 'pause' | 'resume' | 'hint_used';
  timestamp: number;
  data?: Record<string, any>;
}

export interface SessionSummary {
  gameId: string;
  gameName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  difficulty: number;
  metrics: Partial<GameMetrics>;
  domains: CognitiveDomain[];
  adaptiveResult?: {
    newDifficulty: number;
    reason: string;
  };
}

// ─── Metrics Collector ────────────────────────────────────

export class GameMetricsCollector {
  private events: GameEvent[] = [];
  private trialStartTime: number | null = null;
  private reactionTimes: number[] = [];
  private correctCount = 0;
  private errorCount = 0;
  private omissionCount = 0;
  private commissionCount = 0;
  private blockScores: number[] = [];
  private blockCorrect = 0;
  private blockTotal = 0;
  private blockSize = 10;
  private sessionStartTime: number;
  private lastErrorTime: number | null = null;
  private postErrorLatencies: number[] = [];

  constructor(blockSize = 10) {
    this.blockSize = blockSize;
    this.sessionStartTime = Date.now();
  }

  recordEvent(event: GameEvent): void {
    this.events.push(event);

    switch (event.type) {
      case 'trial_start':
        this.trialStartTime = event.timestamp;
        break;
      case 'correct':
        this.correctCount++;
        this.blockCorrect++;
        this.blockTotal++;
        if (this.trialStartTime) {
          const rt = event.timestamp - this.trialStartTime;
          this.reactionTimes.push(rt);
          if (this.lastErrorTime) {
            this.postErrorLatencies.push(rt);
            this.lastErrorTime = null;
          }
        }
        this.checkBlock();
        break;
      case 'error':
        this.errorCount++;
        this.blockTotal++;
        this.lastErrorTime = event.timestamp;
        if (this.trialStartTime) {
          this.reactionTimes.push(event.timestamp - this.trialStartTime);
        }
        this.checkBlock();
        break;
      case 'omission':
        this.omissionCount++;
        this.blockTotal++;
        this.checkBlock();
        break;
      case 'commission':
        this.commissionCount++;
        this.blockTotal++;
        this.checkBlock();
        break;
    }
  }

  private checkBlock(): void {
    if (this.blockTotal >= this.blockSize) {
      this.blockScores.push(this.blockCorrect / this.blockTotal);
      this.blockCorrect = 0;
      this.blockTotal = 0;
    }
  }

  getSummary(): Partial<GameMetrics> {
    const totalAttempts = this.correctCount + this.errorCount + this.omissionCount + this.commissionCount;
    const accuracy = totalAttempts > 0 ? this.correctCount / totalAttempts : 0;
    const avgReactionTime = this.reactionTimes.length > 0
      ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
      : 0;

    // Calculate reaction time variability (std dev)
    let rtVariability = 0;
    if (this.reactionTimes.length > 1) {
      const mean = avgReactionTime;
      const variance = this.reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / this.reactionTimes.length;
      rtVariability = Math.sqrt(variance);
    }

    const avgPostErrorLatency = this.postErrorLatencies.length > 0
      ? this.postErrorLatencies.reduce((a, b) => a + b, 0) / this.postErrorLatencies.length
      : 0;

    // Finalize remaining block
    if (this.blockTotal > 0) {
      this.blockScores.push(this.blockCorrect / this.blockTotal);
    }

    return {
      reactionTimeMs: Math.round(avgReactionTime),
      accuracy,
      errorsCount: this.errorCount,
      correctAnswers: this.correctCount,
      totalAttempts,
      omissionErrors: this.omissionCount,
      commissionErrors: this.commissionCount,
      reactionTimeVariability: Math.round(rtVariability),
      postErrorLatencyMs: Math.round(avgPostErrorLatency),
      recoveryAfterError: this.postErrorLatencies.length > 0 && avgPostErrorLatency < avgReactionTime * 1.5,
      blockPerformance: this.blockScores.map(s => Math.round(s * 100)),
      persistenceSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
    };
  }

  getEventCount(): number {
    return this.events.length;
  }
}

// ─── Adaptive Engine ──────────────────────────────────────

export interface AdaptiveConfig {
  targetAccuracyMin: number; // default 0.65
  targetAccuracyMax: number; // default 0.85
  minDifficulty: number; // default 1
  maxDifficulty: number; // default 10
  stepSize: number; // default 1
  windowSize: number; // number of recent trials to consider
}

const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  targetAccuracyMin: 0.65,
  targetAccuracyMax: 0.85,
  minDifficulty: 1,
  maxDifficulty: 10,
  stepSize: 1,
  windowSize: 20,
};

export function calculateAdaptiveDifficulty(
  currentDifficulty: number,
  accuracy: number,
  config: Partial<AdaptiveConfig> = {}
): { newDifficulty: number; reason: string } {
  const cfg = { ...DEFAULT_ADAPTIVE_CONFIG, ...config };

  if (accuracy > cfg.targetAccuracyMax) {
    const newDiff = Math.min(cfg.maxDifficulty, currentDifficulty + cfg.stepSize);
    return {
      newDifficulty: newDiff,
      reason: `Desempenho alto (${(accuracy * 100).toFixed(0)}%) — dificuldade aumentada`,
    };
  }

  if (accuracy < cfg.targetAccuracyMin) {
    const newDiff = Math.max(cfg.minDifficulty, currentDifficulty - cfg.stepSize);
    return {
      newDifficulty: newDiff,
      reason: `Desempenho baixo (${(accuracy * 100).toFixed(0)}%) — dificuldade reduzida`,
    };
  }

  return {
    newDifficulty: currentDifficulty,
    reason: `Desempenho na faixa ideal (${(accuracy * 100).toFixed(0)}%) — dificuldade mantida`,
  };
}

// ─── Game Registry ────────────────────────────────────────

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  domains: CognitiveDomain[];
  minAge: number;
  maxAge: number;
  isPartOfBattery: boolean;
  isStimulationOnly: boolean;
  abaSkillCategories?: string[];
}

// Registry of all platform games with their cognitive domains
export const GAME_REGISTRY: GameDefinition[] = [
  {
    id: 'attention-sustained',
    name: 'Foco Contínuo',
    description: 'Tarefa de atenção sustentada tipo CPT',
    domains: ['attention'],
    minAge: 4, maxAge: 16,
    isPartOfBattery: true,
    isStimulationOnly: false,
  },
  {
    id: 'inhibitory-control',
    name: 'Controle Inibitório',
    description: 'Tarefa Go/No-Go de controle inibitório',
    domains: ['inhibition'],
    minAge: 4, maxAge: 16,
    isPartOfBattery: true,
    isStimulationOnly: false,
  },
  {
    id: 'working-memory',
    name: 'Memória de Trabalho',
    description: 'Tarefa de span de memória de trabalho',
    domains: ['memory'],
    minAge: 4, maxAge: 16,
    isPartOfBattery: true,
    isStimulationOnly: false,
  },
  {
    id: 'cognitive-flexibility',
    name: 'Flexibilidade Cognitiva',
    description: 'Tarefa de alternância de conjuntos',
    domains: ['flexibility'],
    minAge: 5, maxAge: 16,
    isPartOfBattery: true,
    isStimulationOnly: false,
  },
  {
    id: 'visuomotor-coordination',
    name: 'Coordenação Visomotora',
    description: 'Tarefa de coordenação visomotora',
    domains: ['coordination'],
    minAge: 4, maxAge: 16,
    isPartOfBattery: true,
    isStimulationOnly: false,
  },
  {
    id: 'behavioral-persistence',
    name: 'Persistência Comportamental',
    description: 'Tarefa de persistência e tolerância à frustração',
    domains: ['persistence'],
    minAge: 4, maxAge: 16,
    isPartOfBattery: true,
    isStimulationOnly: false,
  },
  {
    id: 'SimonSays',
    name: 'Siga o Mestre',
    description: 'Jogo de memória sequencial',
    domains: ['memory', 'attention'],
    minAge: 4, maxAge: 12,
    isPartOfBattery: false,
    isStimulationOnly: false,
    abaSkillCategories: ['imitation', 'joint_attention'],
  },
  {
    id: 'CosmicSequence',
    name: 'Sequência Cósmica',
    description: 'Ordenação de padrões espaciais',
    domains: ['memory', 'flexibility'],
    minAge: 5, maxAge: 14,
    isPartOfBattery: false,
    isStimulationOnly: false,
  },
  {
    id: 'VisualTreasureHunt',
    name: 'Caça ao Tesouro Visual',
    description: 'Busca visual e atenção seletiva',
    domains: ['attention', 'coordination'],
    minAge: 4, maxAge: 12,
    isPartOfBattery: false,
    isStimulationOnly: false,
    abaSkillCategories: ['joint_attention'],
  },
  {
    id: 'EmotionLab',
    name: 'Laboratório de Emoções',
    description: 'Reconhecimento e regulação emocional',
    domains: ['emotional-regulation'],
    minAge: 4, maxAge: 14,
    isPartOfBattery: false,
    isStimulationOnly: true,
    abaSkillCategories: ['social_emotional'],
  },
  {
    id: 'SocialScenarios',
    name: 'Cenários Sociais',
    description: 'Simulação de situações sociais',
    domains: ['emotional-regulation', 'flexibility'],
    minAge: 5, maxAge: 14,
    isPartOfBattery: false,
    isStimulationOnly: true,
    abaSkillCategories: ['social_emotional', 'social_skills'],
  },
  {
    id: 'StackTower',
    name: 'Torre de Blocos',
    description: 'Coordenação motora fina e planejamento',
    domains: ['coordination', 'persistence'],
    minAge: 4, maxAge: 10,
    isPartOfBattery: false,
    isStimulationOnly: true,
    abaSkillCategories: ['motor_skills'],
  },
];

/**
 * Find games by cognitive domain
 */
export function findGamesByDomain(domain: CognitiveDomain): GameDefinition[] {
  return GAME_REGISTRY.filter(g => g.domains.includes(domain));
}

/**
 * Find games by ABA skill category
 */
export function findGamesByAbaCategory(category: string): GameDefinition[] {
  return GAME_REGISTRY.filter(g => g.abaSkillCategories?.includes(category));
}

/**
 * Get battery-only games (used for formal assessment)
 */
export function getBatteryGames(): GameDefinition[] {
  return GAME_REGISTRY.filter(g => g.isPartOfBattery);
}

/**
 * Get games appropriate for a given age
 */
export function getGamesForAge(age: number): GameDefinition[] {
  return GAME_REGISTRY.filter(g => age >= g.minAge && age <= g.maxAge);
}
