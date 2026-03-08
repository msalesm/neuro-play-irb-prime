import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { getBottomNavItems } from '@/core/navigation';

export function BottomNavigation() {
  const { user } = useAuth();
  const { role, isAdmin } = useUserRole();
  const location = useLocation();

  if (!user) return null;

  const navigationItems = getBottomNavItems(role, isAdmin);

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
