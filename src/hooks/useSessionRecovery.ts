export function useSessionRecovery(_gameId: string) {
  return {
    currentSession: null,
    startSession: async (_gameType?: string, _initialLevel?: number) => ({ success: true, sessionId: 'mock-session' }),
    updateSession: async (_gameType?: string, _data?: any, _perfData?: any) => ({ success: true }),
    completeSession: async (_gameType?: string, _data?: any, _perfData?: any) => ({ success: true }),
    abandonSession: async (_reason: string) => ({ success: true }),
    unfinishedSessions: [],
    hasUnfinishedSessions: false,
    resumeSession: async (_sessionId: string) => null,
    discardSession: async (_sessionId: string) => ({ success: true }),
    loading: false,
  };
}
