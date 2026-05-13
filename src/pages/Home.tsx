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
      navigate('/', { replace: true });
      return;
    }

    // If user has no role, send to student hub by default
    if (!role) {
      navigate('/student-hub', { replace: true });
      return;
    }

    // Redirect based on user role (NeuroPlay EDU)
    switch (role) {
      case 'admin':
        navigate('/escola-dashboard', { replace: true });
        break;
      case 'student':
      case 'patient':
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
