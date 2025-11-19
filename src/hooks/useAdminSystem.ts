export interface StudentData {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActive: string;
  student_id?: string;
  student_name?: string;
  total_sessions?: number;
  avg_accuracy?: number;
  total_xp?: number;
  needs_attention?: boolean;
  progress_trend?: string;
  last_session_date?: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  progress: number;
  sessions: any[];
  performance: any;
  performance_metrics?: any;
  learning_trails?: any[];
  recent_sessions?: any[];
}

export function useAdminSystem() {
  return {
    loading: false,
    isAdmin: false,
    isEducator: false,
    students: [] as StudentData[],
    stats: {},
    notifications: [],
    clearNotification: () => {},
    getStudentDetail: async (_id: string) => null as StudentDetail | null,
    addStudentToEducator: async (_studentId: string) => ({ success: true }),
    removeStudentFromEducator: async (_studentId: string) => ({ success: true }),
    markNotificationAsRead: async (_id: string) => ({ success: true }),
    getAllStudents: async () => [] as StudentData[],
    exportStudentData: async (_studentId: string) => ({ success: true }),
  };
}
