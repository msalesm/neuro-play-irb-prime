/**
 * Mobile Bottom Tab Bar with FAB
 * 
 * Role-based bottom navigation with a central floating action button.
 * Supports safe-area-inset-bottom for notch devices.
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, type LucideIcon } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { getBottomNavItems } from '@/core/navigation';
import { cn } from '@/lib/utils';

interface TabItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MobileBottomTabBarProps {
  fabAction?: () => void;
  fabRoute?: string;
}

/** Determine the FAB route based on role */
function getFabRoute(role: string | null): string {
  switch (role) {
    case 'therapist': return '/diagnostico-completo';
    case 'teacher': return '/pei';
    case 'parent': return '/agenda';
    case 'patient': return '/games';
    case 'admin': return '/admin/users';
    default: return '/games';
  }
}

export function MobileBottomTabBar({ fabAction, fabRoute }: MobileBottomTabBarProps) {
  const { role, isAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  const allItems = getBottomNavItems(role, isAdmin);
  // Split into left 2 + right 2 around the FAB
  const leftItems = allItems.slice(0, 2);
  const rightItems = allItems.slice(2, 4);

  const resolvedFabRoute = fabRoute || getFabRoute(role);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/student-hub' && location.pathname === '/') return true;
    if (path === '/dashboard-pais' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const handleFabClick = () => {
    if (fabAction) {
      fabAction();
    } else {
      navigate(resolvedFabRoute);
    }
  };

  const renderTab = (item: TabItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        key={item.name}
        to={item.path}
        className={cn(
          'flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[56px] min-h-[48px] tap-feedback',
          active
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label={item.name}
        aria-current={active ? 'page' : undefined}
      >
        <Icon
          className={cn('h-5 w-5 mb-0.5', active && 'text-primary')}
          strokeWidth={active ? 2.5 : 2}
          aria-hidden="true"
        />
        <span className={cn(
          'text-[10px] leading-tight',
          active ? 'font-bold text-primary' : 'font-medium'
        )}>
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 no-print"
      role="navigation"
      aria-label="Navegação principal"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="bg-card/95 backdrop-blur-xl shadow-tab border-t border-border/50">
        <div className="flex items-end justify-around max-w-[430px] mx-auto h-16">
          {/* Left tabs */}
          {leftItems.map(renderTab)}

          {/* FAB central */}
          <div className="flex flex-col items-center -mt-5">
            <button
              onClick={handleFabClick}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-fab flex items-center justify-center animate-fab-pulse tap-feedback"
              aria-label="Ação rápida"
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </button>
          </div>

          {/* Right tabs */}
          {rightItems.map(renderTab)}
        </div>
      </div>
    </nav>
  );
}
