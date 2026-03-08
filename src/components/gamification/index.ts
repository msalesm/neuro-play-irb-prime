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

// Still at root level
export { default as IslandMap } from '../IslandMap';

// Stub components (were deleted as orphans but still referenced in dashboards)
export const DailyMissionSection = (_props: any) => null;
export const DuolingoStreak = (_props: any) => null;
export const AchievementsList = (_props: any) => null;
export const BadgeUnlockModal = (_props: any) => null;
export const LearningTrails = (_props: any) => null;
