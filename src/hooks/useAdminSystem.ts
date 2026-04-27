// EDU stub - expanded
export interface StudentData {
  id: string;
  name: string;
  student_id: string;
  student_name: string;
  total_sessions: number;
  avg_accuracy: number;
  total_xp: number;
  needs_attention: boolean;
  progress_trend: 'excellent' | 'good' | 'average' | 'needs_improvement' | string;
  last_session_date: string | null;
}
export interface StudentDetail extends StudentData {
  performance_metrics: {
    total_xp: number;
    avg_accuracy: number;
    total_sessions: number;
    active_days: number;
  };
  learning_trails: any[];
  recent_sessions: any[];
}
export function useAdminSystem() {
  return {
    users: [] as any[],
    students: [] as StudentData[],
    notifications: [] as any[],
    metrics: { totalUsers: 0, activeUsers: 0, classes: 0 },
    loading: false,
    isAdmin: false,
    isEducator: false,
    refresh: () => {},
    getStudentDetail: async (_id: string): Promise<StudentDetail | null> => null,
    addStudentToEducator: async (_email: string, _educatorId?: string): Promise<boolean> => false,
    removeStudentFromEducator: async (_studentId: string, _educatorId?: string): Promise<boolean> => false,
    markNotificationAsRead: async (_id: string) => {},
    getAllStudents: async (): Promise<StudentData[]> => [],
    exportStudentData: async (_id?: string) => null,
  };
}
export default useAdminSystem;
