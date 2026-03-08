/**
 * 🎮 Games Module
 * 
 * Domain: Cognitive games, game engine, sessions, metrics, adaptive difficulty.
 * 
 * Structure:
 *   modules/games/
 *     ├── engine/        → game-engine.ts, cognitive-engine.ts
 *     ├── components/    → UI components for games
 *     ├── hooks/         → useGameEngine, useGameSession, etc.
 *     ├── services/      → game-service.ts
 *     ├── types/         → game.ts, game-phase.ts
 *     └── index.ts       → this file (public API)
 */

// ── Engine ────────────────────────────────────────────────
export { 
  type GameMetrics, 
  type GameSessionConfig, 
  type CognitiveDomain,
  type AdaptiveDifficultyConfig,
} from '@/core/game-engine';

// ── Hooks ─────────────────────────────────────────────────
export { useGameEngine } from '@/hooks/useGameEngine';
export { useGameSession } from '@/hooks/useGameSession';
export { useGameProfile } from '@/hooks/useGameProfile';
export { useGameHistory } from '@/hooks/useGameHistory';
export { useGamePhaseProgress } from '@/hooks/useGamePhaseProgress';
export { useGameRecommendations } from '@/hooks/useGameRecommendations';

// ── Services ──────────────────────────────────────────────
export { 
  findGameBySlug, 
  getChildProfile,
} from '@/services/game-service';

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
  GameAchievement,
} from '@/components/games';
