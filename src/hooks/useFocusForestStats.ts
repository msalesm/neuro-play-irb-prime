export function useFocusForestStats() {
  return {
    stats: {
      totalTrees: 0,
      forestLevel: 1,
      longestStreak: 0,
      achievements: [],
      totalSessions: 0,
      bestAccuracy: 0,
      totalTreesGrown: 0,
      currentStreak: 0,
      bestAccuracyPerLevel: {},
      recentSessions: []
    },
    achievements: [],
    loading: false,
    saveGameSession: async (_data: any) => {},
    updateStats: async (_levelData?: any, _perfData?: any) => {},
  };
}
