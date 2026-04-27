// EDU stub: admin advanced system removed.
export function useAdminSystem() {
  return {
    users: [],
    metrics: { totalUsers: 0, activeUsers: 0, classes: 0 },
    loading: false,
    refresh: () => {},
  };
}
export default useAdminSystem;
