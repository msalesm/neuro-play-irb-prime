/**
 * ProtectedRoute — Role-based route guard
 * 
 * Wraps routes that require authentication and/or specific roles.
 * Redirects unauthenticated users to /auth and unauthorized users to their home.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type AppRole } from '@/hooks/useUserRole';
import { getHomeRoute } from '@/core/roles';
import { Loading } from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. If empty/undefined, any authenticated user can access. */
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) return <Loading />;

  // Not authenticated → login
  if (!user) return <Navigate to="/auth" replace />;

  // No role restriction → any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) return <>{children}</>;

  // Admin bypasses all role checks
  if (isAdmin) return <>{children}</>;

  // Check if user's role is allowed
  if (role && allowedRoles.includes(role)) return <>{children}</>;

  // Unauthorized → redirect to their home
  return <Navigate to={getHomeRoute(role || 'user')} replace />;
}
