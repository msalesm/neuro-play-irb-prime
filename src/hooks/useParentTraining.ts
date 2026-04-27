// EDU stub
export function useParentTraining() {
  return {
    modules: [] as any[],
    trainings: [] as any[],
    progress: {} as Record<string, any>,
    loading: false,
    getCompletedModules: () => [] as any[],
    getTotalScore: () => 0,
  };
}
export default useParentTraining;
