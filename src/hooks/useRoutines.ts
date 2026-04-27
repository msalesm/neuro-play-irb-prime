// EDU stub
export interface Routine {
  id: string;
  title: string;
  description?: string;
  steps?: any[];
  routine_type?: string;
  icon?: string;
  is_template?: boolean;
}
export function useRoutines() { return { routines: [] as Routine[], loading: false }; }
export default useRoutines;
