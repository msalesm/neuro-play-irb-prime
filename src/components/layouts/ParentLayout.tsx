/**
 * Parent Layout
 * 
 * Intermediate interface: warm, informative but not clinical.
 * Shows: child progress, recommendations, routines, simplified reports.
 */

import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Calendar, BookOpen, User, Heart, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface ParentLayoutProps {
  children: React.ReactNode;
}

const PARENT_BOTTOM_NAV = [
  { name: 'Início', path: '/dashboard-pais', icon: Home },
  { name: 'Progresso', path: '/learning-dashboard', icon: TrendingUp },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Relatórios', path: '/relatorios', icon: BookOpen },
  { name: 'Perfil', path: '/profile', icon: User },
];

export function ParentLayout({ children }: ParentLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === '/dashboard-pais' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-background to-orange-50/20 dark:from-amber-950/10 dark:via-background dark:to-orange-950/5">
        {/* Warm, welcoming header */}
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/dashboard-pais" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">NeuroPlay</span>
                <span className="text-[10px] text-muted-foreground">Área dos Pais</span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelector variant="icon" />
            </div>
          </div>
        </header>

        <main id="main-content" className="pb-24 min-h-[calc(100vh-120px)]">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {children}
          </div>
        </main>

        {/* Bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom"
          role="navigation"
          aria-label="Menu principal"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex justify-around items-center py-1.5">
            {PARENT_BOTTOM_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all min-w-[56px] ${
                    active
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={item.name}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`h-5 w-5 mb-0.5 ${active ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                  <span className={`text-[10px] font-medium leading-tight ${active ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop: sidebar layout
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-amber-50/30 via-background to-background dark:from-amber-950/5 dark:via-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-accent" aria-label="Menu" />
              <span className="text-sm font-medium text-muted-foreground">Área dos Pais</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector variant="icon" />
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-auto" role="main">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
