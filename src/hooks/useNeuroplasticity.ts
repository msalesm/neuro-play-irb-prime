import { useState } from 'react';

export function useNeuroplasticity() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    scores: {},
    updateScores: async () => {},
    neuroplasticityData: {
      overallProgress: 0,
      cognitiveSkills: [],
      recentActivity: [],
      overall_score: 0,
      games_completed: 0,
      total_sessions: 0
    },
    skillMetrics: {},
    history: [],
    getCategoryProgress: (_category: string) => 0,
    getSkillProgress: (_skill: string) => 0,
    getCategoryTrend: (_category: string) => 'stable' as const,
  };
}
