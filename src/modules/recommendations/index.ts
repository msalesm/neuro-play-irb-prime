/**
 * 💡 Recommendations Module
 * 
 * Role-specific practical recommendations for teachers, parents, and therapists.
 */

export {
  type RoleRecommendation,
  type RecommendationContext,
  generateRoleRecommendations,
} from './recommendation-engine';

export {
  generateTeacherRecommendations,
} from './teacher-recommendations';

export {
  generateParentRecommendations,
} from './parent-recommendations';
