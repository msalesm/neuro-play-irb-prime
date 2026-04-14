/**
 * Mobile Bottom Tab Bar with FAB
 * 
 * Role-based bottom navigation with a central floating action button.
 * 5 positions: 2 left tabs + FAB + 2 right tabs.
 * Admin gets a "Mais" tab that opens a full navigation sheet.
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, X, type LucideIcon } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { getBottomNavItems, getAdminMobileSections } from '@/core/navigation';
import { cn } from '@/lib/utils';

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
  const [moreOpen, setMoreOpen] = useState(false);

  const allItems = getBottomNavItems(role, isAdmin);
  
  // For admin: use first 3 items + "Mais" tab
  const leftItems = allItems.slice(0, 2);
  const rightItems = isAdmin ? [allItems[2]] : allItems.slice(2, 4);

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

  const adminSections = isAdmin ? getAdminMobileSections() : [];

  const renderTab = (item: { name: string; path: string; icon: LucideIcon }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        key={item.name}
        to={item.path}
        className={cn(
          'flex flex-col items-center justify-center flex-1 py-2 transition-all min-h-[48px] tap-feedback',
          active ? 'text-primary' : 'text-muted-foreground'
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
    <>
      {/* Admin "More" bottom sheet overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Navegação Completa</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-full hover:bg-muted tap-feedback"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-4">
              {adminSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    {section.label}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                            active
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 no-print"
        role="navigation"
        aria-label="Navegação principal"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="bg-card border-t border-border/50" style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-around h-16 relative">
            {/* Left tabs */}
            {leftItems.map(renderTab)}

            {/* FAB central */}
            <div className="flex flex-col items-center justify-center flex-1 relative">
              <button
                onClick={handleFabClick}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center tap-feedback absolute -top-7"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                aria-label="Ação rápida"
              >
                <Plus className="h-7 w-7" strokeWidth={2.5} />
              </button>
              <div className="h-5 w-5 mb-0.5 invisible" />
              <span className="text-[10px] font-medium text-muted-foreground leading-tight invisible">+</span>
            </div>

            {/* Right tabs */}
            {rightItems.map(renderTab)}

            {/* Admin "Mais" tab */}
            {isAdmin && (
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 transition-all min-h-[48px] tap-feedback',
                  moreOpen ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-label="Mais opções"
              >
                <MoreHorizontal
                  className={cn('h-5 w-5 mb-0.5', moreOpen && 'text-primary')}
                  strokeWidth={moreOpen ? 2.5 : 2}
                />
                <span className={cn(
                  'text-[10px] leading-tight',
                  moreOpen ? 'font-bold text-primary' : 'font-medium'
                )}>
                  Mais
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
