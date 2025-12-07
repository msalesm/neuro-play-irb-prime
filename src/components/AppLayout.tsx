import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MobileMenu } from '@/components/MobileMenu';
import { MobileTour } from '@/components/MobileTour';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ScreenReaderAnnouncer, 
  SkipLinks, 
  VisualNotificationProvider,
  KeyboardNavigationProvider,
  AccessibilityQuickPanel,
  HighVisibilityMode,
  SensoryReducedMode
} from '@/components/accessibility';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return (
      <VisualNotificationProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <ScreenReaderAnnouncer />
          <SkipLinks />
          <main id="main-content">
            {children}
          </main>
        </div>
      </VisualNotificationProvider>
    );
  }

  if (isMobile) {
    return (
      <VisualNotificationProvider>
        <KeyboardNavigationProvider>
          <HighVisibilityMode />
          <SensoryReducedMode />
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <ScreenReaderAnnouncer />
            <SkipLinks />
            <MobileMenu />
            <main id="main-content">
              {children}
            </main>
            <BottomNavigation />
            <MobileTour />
            <AccessibilityQuickPanel />
          </div>
        </KeyboardNavigationProvider>
      </VisualNotificationProvider>
    );
  }

  return (
    <VisualNotificationProvider>
      <KeyboardNavigationProvider>
        <HighVisibilityMode />
        <SensoryReducedMode />
        <SidebarProvider defaultOpen>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <ScreenReaderAnnouncer />
            <SkipLinks />
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              {/* Top Bar */}
              <header className="h-14 flex items-center justify-between px-6 border-b border-border/20 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <SidebarTrigger 
                    className="hover:bg-accent hover:text-accent-foreground" 
                    aria-label="Abrir/fechar menu lateral"
                  />
                  
                  <nav id="main-navigation" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <span>NeuroPlay</span>
                    <span aria-hidden="true">•</span>
                    <span>Plataforma de Desenvolvimento Cognitivo</span>
                  </nav>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quick Actions */}
                  <div className="hidden md:flex items-center gap-2">
                    <div 
                      className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                      role="status"
                      aria-label="Sistema online"
                    />
                    <span className="text-xs text-muted-foreground">Sistema Online</span>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main id="main-content" className="flex-1 overflow-auto" role="main">
                <div className="container mx-auto px-6 py-6">
                  {children}
                </div>
              </main>
            </div>
            
            <AccessibilityQuickPanel />
          </div>
        </SidebarProvider>
      </KeyboardNavigationProvider>
    </VisualNotificationProvider>
  );
}