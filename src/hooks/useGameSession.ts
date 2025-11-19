export function useGameSession(_gameId: string) {
  return {
    sessionId: null,
    startSession: async (_data?: any, _initialDifficulty?: number) => ({ success: true }),
    endSession: async (_data?: any) => {},
    updateSession: async (_data?: any) => {},
    isActive: false,
    currentDifficulty: 1,
    recordMetric: async (_event: string, _metric: any) => {},
  };
}
