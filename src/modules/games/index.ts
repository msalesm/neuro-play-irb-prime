/**
 * 🎮 Games Module
 * 
 * Domain: Cognitive games, game engine, sessions, metrics, adaptive difficulty.
 */

// ── Engine (local) ────────────────────────────────────────
export { 
  type GameMetrics, 
  type GameSessionConfig, 
  type CognitiveDomain,
} from './engine';

// ── Hooks ─────────────────────────────────────────────────
export { useGameEngine } from '@/hooks/useGameEngine';
export { useGameSession } from '@/hooks/useGameSession';
export { useGameProfile } from '@/hooks/useGameProfile';
export { useGameHistory } from '@/hooks/useGameHistory';
export { useGamePhaseProgress } from '@/hooks/useGamePhaseProgress';
export { useGameRecommendations } from '@/hooks/useGameRecommendations';

// ── Services (local) ─────────────────────────────────────
export { 
  findGameBySlug, 
  getChildProfile,
} from './service';

// ── Types ─────────────────────────────────────────────────
export type { GamePhase } from '@/types/game-phase';
export type { Vector2D, PlayerState, GameControls } from '@/types/game';

// ── Components (re-export barrel) ─────────────────────────
export { 
  GameCategories,
  GameOnboarding,
  GameExitButton,
  GameProgressBar,
  GameResultsDashboard,
  ModernGameCard,
  ModernMetricCard,
  GamePhaseSelector,
  GameAchievements,
} from '@/components/games';
