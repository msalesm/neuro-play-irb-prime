/**
 * Hooks Domain Index
 * 
 * Organizes all hooks by functional domain for clean imports.
 * Usage: import { useGameEngine } from '@/hooks/games'
 */

// ========== GAMES ==========
export { useGameEngine } from './useGameEngine';
export { useGameSession } from './useGameSession';
export { useGameProfile } from './useGameProfile';
export { useGameHistory } from './useGameHistory';
export { useGamePhaseProgress } from './useGamePhaseProgress';
export { useGameRecommendations } from './useGameRecommendations';
