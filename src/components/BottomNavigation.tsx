import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, FileText, GraduationCap, ClipboardCheck, Sparkles, Users, Calendar, Stethoscope, Heart, Trophy, TrendingUp, Building2, School } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function BottomNavigation() {
  const { user } = useAuth();
  const { role, isAdmin } = useUserRole();
  const location = useLocation();
  const { t } = useLanguage();

  // Detect if user is a teacher (has classes assigned)
  const { data: isTeacher } = useQuery({
    queryKey: ['is-teacher', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { count } = await supabase
        .from('school_classes')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id);
      return (count ?? 0) > 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (!user) return null;

  // Role-based navigation items
  const getNavigationItems = () => {
    if (role === 'patient') {
      return [
        { name: 'Meu Dia', path: '/student-hub', icon: Home },
        { name: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
        { name: 'Conquistas', path: '/learning-dashboard', icon: Trophy },
        { name: 'Emoções', path: '/emotional-history', icon: Heart },
      ];
    }

    if (role === 'parent') {
      return [
        { name: 'Dashboard', path: '/dashboard-pais', icon: Home },
        { name: 'Agenda', path: '/agenda', icon: Calendar },
        { name: 'Progresso', path: '/learning-dashboard', icon: TrendingUp },
        { name: 'Relatórios', path: '/reports', icon: FileText },
      ];
    }

    if (role === 'therapist') {
      return [
        { name: 'Pacientes', path: '/therapist/patients', icon: Users },
        { name: 'Agenda', path: '/agenda', icon: Calendar },
        { name: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
        { name: 'Avaliações', path: '/diagnostic-tests', icon: ClipboardCheck },
      ];
    }

    if (isTeacher) {
      return [
        { name: 'Educação', path: '/educacao', icon: School },
        { name: 'Turmas', path: '/teacher/classes', icon: Users },
        { name: 'Avaliações', path: '/screening', icon: ClipboardCheck },
        { name: 'Relatórios', path: '/reports', icon: FileText },
      ];
    }

    if (isAdmin) {
      return [
        { name: 'Institucional', path: '/institutional', icon: Building2 },
        { name: 'Operações', path: '/operations', icon: TrendingUp },
        { name: 'Usuários', path: '/admin/users', icon: Users },
        { name: 'Agenda', path: '/agenda', icon: Calendar },
      ];
    }

    // Default (no role / user)
    return [
      { name: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
      { name: t('nav.games'), path: '/games', icon: Gamepad2 },
      { name: t('nav.learning'), path: '/learning-dashboard', icon: GraduationCap },
      { name: 'Relatórios', path: '/reports', icon: FileText },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom"
      role="navigation"
      aria-label="Navegação principal"
      data-mobile-tour="bottom-nav"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center py-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-smooth min-w-[64px] min-h-[48px] ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.name}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${active ? 'text-primary' : ''}`} aria-hidden="true" />
              <span className={`text-[11px] font-medium leading-tight ${active ? 'text-primary' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
