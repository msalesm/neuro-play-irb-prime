/**
 * Professional Layout (Therapists + Teachers + Admin)
 * 
 * Mobile: compact header with profile + bottom tab bar. Desktop: sidebar.
 */

import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_BADGES } from '@/core/navigation';
import { MobileBottomTabBar } from '@/components/mobile/MobileBottomTabBar';

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

function getProfessionalFabRoute(role: string | null): string {
  switch (role) {
    case 'therapist': return '/diagnostico-completo';
    case 'teacher': return '/pei';
    case 'admin': return '/admin/users';
    default: return '/diagnostico-completo';
  }
}

export function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const { user } = useAuth();
  const { role } = useUserRole();
  const isMobile = useIsMobile();

  const roleBadge = role ? ROLE_BADGES[role] : null;
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50 px-4 py-2">
          <div className="flex items-center justify-between max-w-[430px] mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-foreground">NeuroPlay</span>
              {roleBadge && (
                <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${roleBadge.gradient}`}>
                  {roleBadge.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/settings" className="p-2 rounded-full hover:bg-muted tap-feedback">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/profile" className="tap-feedback">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>
        <main id="main-content" className="pb-24 min-h-[calc(100dvh-56px)]">
          <div className="max-w-[430px] mx-auto px-4 py-4">
            {children}
          </div>
        </main>
        <MobileBottomTabBar fabRoute={getProfessionalFabRoute(role)} />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" aria-label="Menu" />
              {roleBadge && (
                <Badge variant="outline" className={`text-[10px] py-0.5 px-2 ${roleBadge.gradient}`}>
                  {roleBadge.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector variant="icon" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                <span className="text-[11px] text-muted-foreground">Online</span>
              </div>
            </div>
          </header>
          <main id="main-content" className="flex-1 overflow-auto bg-muted/20" role="main">
            <div className="p-4 lg:p-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
