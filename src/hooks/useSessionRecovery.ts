export function useSessionRecovery(_gameId: string) {
  return {
    currentSession: null,
    startSession: async (_gameType?: string, _initialLevel?: number) => {},
    updateSession: async (_gameType?: string, _data?: any, _perfData?: any) => {},
    completeSession: async (_gameType?: string, _data?: any, _perfData?: any) => {},
    abandonSession: async (_reason: string) => {},
    unfinishedSessions: [],
    hasUnfinishedSessions: false,
    resumeSession: async (_sessionId: string) => null,
    discardSession: async (_sessionId: string) => {},
    loading: false,
  };
}
