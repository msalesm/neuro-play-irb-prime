/**
 * ProtectedRoute — Role-based route guard with LGPD onboarding enforcement
 * 
 * Wraps routes that require authentication and/or specific roles.
 * Redirects unauthenticated users to /auth, users who haven't completed
 * onboarding to /onboarding, and unauthorized users to their home.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type AppRole } from '@/hooks/useUserRole';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { getHomeRoute } from '@/core/roles';
import { Loading } from '@/components/Loading';

/** Routes accessible without completing onboarding */
const ONBOARDING_EXEMPT_PATHS = ['/onboarding', '/auth', '/privacy', '/terms'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. If empty/undefined, any authenticated user can access. */
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const location = useLocation();

  const isExemptPath = ONBOARDING_EXEMPT_PATHS.some(
    path => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  if (authLoading || roleLoading) return <Loading />;

  // Not authenticated → login
  if (!user) return <Navigate to="/auth" replace />;

  // For non-exempt paths, enforce onboarding completion
  if (!isExemptPath) {
    if (onboardingLoading) return <Loading />;
    if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  }

  // No role restriction → any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) return <>{children}</>;

  // Admin bypasses all role checks
  if (isAdmin) return <>{children}</>;

  // Check if user's role is allowed
  if (role && allowedRoles.includes(role)) return <>{children}</>;

  // Unauthorized → redirect to their home
  return <Navigate to={getHomeRoute(role || 'user')} replace />;
}
