// EDU stub
export interface Routine {
  id: string;
  title: string;
  description?: string;
  steps?: any[];
}
export function useRoutines() { return { routines: [] as Routine[], loading: false }; }
export default useRoutines;
