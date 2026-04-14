/**
 * Professional Layout (Therapists + Teachers + Admin)
 * 
 * Mobile: bottom tab bar with FAB, no sidebar.
 * Desktop: sidebar with data-dense clinical view.
 */

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Badge } from '@/components/ui/badge';
import { ROLE_BADGES } from '@/core/navigation';
import { MobileBottomTabBar } from '@/components/mobile/MobileBottomTabBar';

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

/** FAB route based on professional role */
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <main id="main-content" className="pb-tab-bar min-h-[100dvh]">
          <div className="mobile-container px-4 py-4">
            {children}
          </div>
        </main>
        <MobileBottomTabBar fabRoute={getProfessionalFabRoute(role)} />
      </div>
    );
  }

  // Desktop: sidebar
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
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
