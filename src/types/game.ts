// Game types and interfaces

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vector2D;
  velocity: Vector2D;
  grounded: boolean;
  facing: 'left' | 'right';
  animation: 'idle' | 'run' | 'jump' | 'fall';
  health: number;
  maxHealth: number;
}

export interface GameControls {
  left: boolean;
  right: boolean;
  jump: boolean;
  action: boolean;
}

export interface Checkpoint {
  id: string;
  position: Vector2D;
  activated: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'platform' | 'hazard';
}

export interface Level {
  id: string;
  name: string;
  world: number;
  stage: number;
  platforms: Platform[];
  checkpoints: Checkpoint[];
  collectibles: Vector2D[];
  startPosition: Vector2D;
  endPosition: Vector2D;
  backgroundColor: string;
  theme: string;
}

export interface GameState {
  currentWorld: number;
  currentStage: number;
  player: PlayerState;
  activeCheckpoint: string | null;
  score: number;
  timeElapsed: number;
  paused: boolean;
  gameOver: boolean;
  victory: boolean;
}

export const GAME_CONFIG = {
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 320,
  TARGET_FPS: 60,
  ANIMATION_FPS: 12,
  GRAVITY: 0.5,
  PLAYER_SPEED: 3,
  JUMP_FORCE: -10,
  PLAYER_WIDTH: 16,
  PLAYER_HEIGHT: 24,
  CHECKPOINT_INTERVAL: 30, // seconds
} as const;
