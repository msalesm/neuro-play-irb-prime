/**
 * Parent Layout
 * 
 * Warm, informative but not clinical.
 * Mobile: bottom tab bar with FAB. Desktop: sidebar.
 */

import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomTabBar } from '@/components/mobile/MobileBottomTabBar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LanguageSelector } from '@/components/LanguageSelector';

interface ParentLayoutProps {
  children: React.ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <main id="main-content" className="pb-tab-bar min-h-[100dvh]">
          <div className="mobile-container px-4 py-4">
            {children}
          </div>
        </main>
        <MobileBottomTabBar fabRoute="/agenda" />
      </div>
    );
  }

  // Desktop: sidebar layout
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-accent" aria-label="Menu" />
              <span className="text-sm font-medium text-muted-foreground">Área dos Pais</span>
            </div>
            <LanguageSelector variant="icon" />
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
