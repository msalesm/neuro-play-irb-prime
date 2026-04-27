import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { OfflineIndicator, PWAInstallPrompt, ServiceWorkerStatus } from '@/components/pwa/PWAComponents';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LanguageSelector } from '@/components/LanguageSelector';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const { loading: roleLoading } = useUserRole();
  const isMobile = useIsMobile();

  // Unauthenticated — minimal shell (landing, auth, public)
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main id="main-content">{children}</main>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  // Mobile: bottom tab bar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <main id="main-content" className="pb-20 min-h-[100dvh]">
          <div className="px-4 py-4">{children}</div>
        </main>
        <BottomNavigation />
        <OfflineIndicator />
        <PWAInstallPrompt />
        <ServiceWorkerStatus />
      </div>
    );
  }

  // Desktop: sidebar
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" aria-label="Menu" />
              <span className="font-semibold text-foreground">NeuroPlay EDU</span>
            </div>
            <LanguageSelector variant="icon" />
          </header>
          <main id="main-content" className="flex-1 overflow-auto bg-muted/30">
            <div className="container mx-auto px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
      <OfflineIndicator />
      <PWAInstallPrompt />
      <ServiceWorkerStatus />
    </SidebarProvider>
  );
}
