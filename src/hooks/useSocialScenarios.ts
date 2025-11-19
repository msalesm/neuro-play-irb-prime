export function useSocialScenarios() {
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
    completeSession: async (_data: any) => {},
    updateProgress: async (_scenarioId: string) => {},
  };
}
