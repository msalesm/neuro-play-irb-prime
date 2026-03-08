/**
 * Gamification Module - Barrel Export
 */

// Avatar system
export { AvatarCustomization } from './AvatarCustomization';
export { AvatarEvolutionCard } from './AvatarEvolutionCard';
export { AvatarSelection } from './AvatarSelection';
export { AvatarSelectionModal } from './AvatarSelectionModal';
export { ChildAvatarDisplay } from './ChildAvatarDisplay';
export { EvolutionaryAvatar } from './EvolutionaryAvatar';

// Progress & Achievements
export { LevelProgress } from './LevelProgress';
export { ProgressPath } from './ProgressPath';
export { default as ProgressTrail } from './ProgressTrail';
export { TourAchievementModal } from './TourAchievementModal';
export { TourAchievementsPanel } from './TourAchievementsPanel';

// Gamification Widgets (real implementations)
export { DailyMissionSection, DuolingoStreak, AchievementsList, BadgeUnlockModal } from './GamificationWidgets';

// Legacy stubs removed — all components are now real implementations
export const LearningTrails = (_props: any) => null;
