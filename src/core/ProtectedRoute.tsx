/**
 * ProtectedRoute — Role-based route guard (NeuroPlay EDU)
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type AppRole } from '@/hooks/useUserRole';
import { getHomeRoute, normalizeRole } from '@/core/roles';
import { Loading } from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;

  if (!allowedRoles || allowedRoles.length === 0) return <>{children}</>;
  if (isAdmin) return <>{children}</>;

  // Normalize legacy roles (parent/therapist → teacher; patient → student)
  const normalized = normalizeRole(role);
  if (normalized && (allowedRoles as string[]).includes(normalized)) return <>{children}</>;
  if (role && allowedRoles.includes(role)) return <>{children}</>;

  return <Navigate to={getHomeRoute(role)} replace />;
}
