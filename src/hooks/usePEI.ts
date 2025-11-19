export function usePEI() {
  return {
    loading: false,
    peiPlan: null,
    createPlan: async (_screeningId: string) => ({ success: true }),
    updatePlan: async (_id: string, _data: any) => {},
    currentPlan: null,
    getPEIByScreening: async (_screeningId: string) => null,
    updatePEI: async (_id: string, _data: any) => {},
  };
}
