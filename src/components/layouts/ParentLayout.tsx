/**
 * Parent Layout
 * 
 * Warm, informative but not clinical.
 * Mobile: compact header + bottom tab bar. Desktop: sidebar.
 */

import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomTabBar } from '@/components/mobile/MobileBottomTabBar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LanguageSelector } from '@/components/LanguageSelector';

interface ParentLayoutProps {
  children: React.ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50 px-4 py-2">
          <div className="flex items-center justify-between max-w-[430px] mx-auto">
            <div className="flex flex-col">
              <span className="font-bold text-base text-foreground">NeuroPlay</span>
              <span className="text-[10px] text-muted-foreground">Área dos Pais</span>
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
        <MobileBottomTabBar fabRoute="/agenda" />
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
              <SidebarTrigger className="hover:bg-accent" aria-label="Menu" />
              <span className="text-sm font-medium text-muted-foreground">Área dos Pais</span>
            </div>
            <LanguageSelector variant="icon" />
          </header>
          <main id="main-content" className="flex-1 overflow-auto" role="main">
            <div className="container mx-auto px-4 py-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
