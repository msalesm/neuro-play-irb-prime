export interface ScreeningResult {
  id: string;
  type: string;
  score: number;
  percentile: number;
  recommended_action: string;
  gameData?: any;
  duration?: number;
}

export function useScreening() {
  return {
    loading: false,
    screenings: [],
    submitScreening: async (_type: string, _data: any, _score: number) => ({ success: true }),
    getScreening: async (_id: string) => null,
    startScreening: async (_type: string) => ({ success: true }),
    saveScreening: async (_data: any) => {},
  };
}
