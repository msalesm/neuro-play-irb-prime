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
      navigate('/index', { replace: true });
      return;
    }

    // If user has no role, redirect to onboarding
    if (!role) {
      navigate('/onboarding', { replace: true });
      return;
    }

    // Redirect based on user role (NeuroPlay EDU)
    switch (role) {
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'student':
        navigate('/student-hub', { replace: true });
        break;
      case 'teacher':
      default:
        navigate('/educacao', { replace: true });
        break;
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  // Show loading while determining where to redirect
  return <Loading />;
}
