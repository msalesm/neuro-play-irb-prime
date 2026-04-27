// EDU stub
export function useTourAchievements() {
  return {
    achievements: [] as any[],
    unlocked: [] as any[],
    unlock: (_k?: string) => {},
    loading: false,
    getProgress: () => ({ completed: 0, total: 0, percentage: 0 }),
  };
}
export default useTourAchievements;
