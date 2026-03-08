/**
 * Games Module - Barrel Export
 * 
 * Re-exports game components from various locations for clean imports.
 * Usage: import { GameResultsDashboard } from '@/components/games'
 */

// Game-specific components in this folder
export { SimonAchievements } from './SimonAchievements';
export { SimonButton } from './SimonButton';
export { SimonDisplay } from './SimonDisplay';

// Game UI components (root-level, re-exported here for module cohesion)
export { GameExitButton } from '../GameExitButton';
export { GameResultsDashboard } from '../GameResultsDashboard';
export { GameOnboarding } from '../GameOnboarding';
export { EnhancedGameOnboarding } from '../EnhancedGameOnboarding';
export { GameProgressBar } from '../GameProgressBar';
export { GamePhaseSelector } from '../GamePhaseSelector';
export { GameCompatibilityCheck } from '../GameCompatibilityCheck';
export { GameCategories } from '../GameCategories';
export { GameIllustration } from '../GameIllustration';
export { default as GameMap } from '../GameMap';
export { ModernGameCard } from '../ModernGameCard';
export { DailyGameSection } from '../DailyGameSection';
export { BiofeedbackGameCard } from '../BiofeedbackGameCard';
export { CooperativeGameLobby } from '../CooperativeGameLobby';
