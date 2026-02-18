import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Loading } from '@/components/Loading';

export default function Home() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Wait for both auth and role to load
    if (authLoading || roleLoading) return;

    // If not authenticated, show landing page
    if (!user) {
      navigate('/landing', { replace: true });
      return;
    }

    // If user has no role, redirect to onboarding
    if (!role) {
      navigate('/onboarding', { replace: true });
      return;
    }

    // Redirect based on user role
    switch (role) {
      case 'admin':
        navigate('/admin/network', { replace: true });
        break;
      case 'therapist':
        navigate('/therapist/patients', { replace: true });
        break;
      case 'teacher':
        navigate('/educacao', { replace: true });
        break;
      case 'patient':
        navigate('/student-hub', { replace: true });
        break;
      case 'parent':
      case 'user':
      default:
        navigate('/dashboard-pais', { replace: true });
        break;
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  // Show loading while determining where to redirect
  return <Loading />;
}
