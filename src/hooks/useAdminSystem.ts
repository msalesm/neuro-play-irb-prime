export function useAdminSystem() {
  return {
    loading: false,
    isAdmin: false,
    isEducator: false,
    students: [],
    stats: {},
    notifications: [],
    clearNotification: () => {},
    getStudentDetail: async () => null,
  };
}
