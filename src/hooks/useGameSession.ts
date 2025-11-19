export function useGameSession(_gameId: string, _childProfileId?: string) {
  return {
    sessionId: 'mock-session-id',
    startSession: async (_data?: any, _initialDifficulty?: number) => {
      return { success: true, sessionId: 'mock-session-id' };
    },
    endSession: async (_data?: any) => ({ success: true }),
    updateSession: async (_data?: any) => ({ success: true }),
    isActive: false,
    currentDifficulty: 1,
    recordMetric: async (_metricData: any) => ({ success: true }),
  };
}
