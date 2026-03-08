/**
 * 🎯 Adaptive Intervention Module
 * 
 * Analyzes child performance and automatically adjusts:
 * - Game difficulty
 * - Activity frequency
 * - Intervention type
 * - Positive reinforcement triggers
 */

export {
  type AdaptiveProfile,
  type InterventionPlan,
  type FrustrationState,
  analyzePerformance,
  generateInterventionPlan,
  detectFrustration,
  shouldApplyReinforcement,
} from './adaptive-engine';

export {
  type DifficultyDecision,
  calculateNextDifficulty,
  calculateSessionDifficulty,
} from './difficulty-controller';

export {
  type InterventionRecommendation,
  generateInterventionRecommendations,
} from './intervention-recommender';
