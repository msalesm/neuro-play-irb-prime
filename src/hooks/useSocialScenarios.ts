export function useSocialScenarios(..._args: any[]) {
  return {
    progress: {
      scenariosCompleted: 0,
      totalScenarios: 0,
      successRate: 0
    },
    scenarios: [],
    userProgress: {},
    userSessions: [],
    achievements: [],
    unlockedAchievements: [],
    loading: false,
    completeSession: async (..._args: any[]) => ({ success: true }),
    updateProgress: async (..._args: any[]) => ({ success: true }),
  };
}
