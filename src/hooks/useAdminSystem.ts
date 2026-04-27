// EDU stub
export interface StudentData { id: string; name: string; }
export interface StudentDetail extends StudentData {}
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
    addStudentToEducator: async (_studentId: string, _educatorId: string) => {},
    removeStudentFromEducator: async (_studentId: string, _educatorId: string) => {},
    markNotificationAsRead: async (_id: string) => {},
    getAllStudents: async (): Promise<StudentData[]> => [],
    exportStudentData: async (_id?: string) => null,
  };
}
export default useAdminSystem;
