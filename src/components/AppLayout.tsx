import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ScreenReaderAnnouncer, 
  SkipLinks, 
  VisualNotificationProvider,
  KeyboardNavigationProvider,
  HighVisibilityMode,
  SensoryReducedMode
} from '@/components/accessibility';
import { FloatingAIAssistant } from '@/components/ai/FloatingAIAssistant';
import { ClinicalDisclaimerModal } from '@/components/clinical/ClinicalDisclaimerModal';
import { OfflineIndicator, PWAInstallPrompt, ServiceWorkerStatus } from '@/components/pwa/PWAComponents';
import { AccessibilityQuickPanel } from '@/components/accessibility';
import { MobileTour } from '@/components/MobileTour';

// Role-specific layouts
import { ChildLayout } from '@/components/layouts/ChildLayout';
import { ProfessionalLayout } from '@/components/layouts/ProfessionalLayout';
import { ParentLayout } from '@/components/layouts/ParentLayout';

// Fallback layout components (for unauthenticated or loading)
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileMenu } from '@/components/MobileMenu';
import { BottomNavigation } from '@/components/BottomNavigation';
import { LanguageSelector } from '@/components/LanguageSelector';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const isMobile = useIsMobile();

  // Unauthenticated — minimal shell
  if (!user) {
    return (
      <VisualNotificationProvider>
        <div className="min-h-screen bg-background">
          <ScreenReaderAnnouncer />
          <SkipLinks />
          <main id="main-content">{children}</main>
        </div>
      </VisualNotificationProvider>
    );
  }

  // Determine which layout to use based on role
  const getLayoutContent = () => {
    // While loading role, show a neutral fallback
    if (roleLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
        </div>
      );
    }

    switch (role) {
      case 'patient':
        return <ChildLayout>{children}</ChildLayout>;
      
      case 'parent':
        return <ParentLayout>{children}</ParentLayout>;
      
      case 'therapist':
      case 'teacher':
      case 'admin':
        return <ProfessionalLayout>{children}</ProfessionalLayout>;
      
      default:
        // Fallback: use the original generic layout
        return isMobile ? (
          <div className="min-h-screen bg-background">
            <MobileMenu />
            <main id="main-content" className="pt-16 pb-24">{children}</main>
            <BottomNavigation />
          </div>
        ) : (
          <SidebarProvider defaultOpen>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" aria-label="Menu" />
                    <span className="font-semibold text-foreground">NeuroPlay</span>
                  </div>
                  <LanguageSelector variant="icon" />
                </header>
                <main id="main-content" className="flex-1 overflow-auto bg-muted/30">
                  <div className="container mx-auto px-6 py-6">{children}</div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        );
    }
  };

  return (
    <VisualNotificationProvider>
      <KeyboardNavigationProvider>
        <HighVisibilityMode />
        <SensoryReducedMode />
        <ScreenReaderAnnouncer />
        <SkipLinks />
        
        {getLayoutContent()}
        
        {/* Shared overlays — always present regardless of role */}
        <ClinicalDisclaimerModal />
        <FloatingAIAssistant />
        <AccessibilityQuickPanel />
        {isMobile && <MobileTour />}
        <OfflineIndicator />
        <PWAInstallPrompt />
        <ServiceWorkerStatus />
      </KeyboardNavigationProvider>
    </VisualNotificationProvider>
  );
}
