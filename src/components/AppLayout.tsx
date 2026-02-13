import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MobileMenu } from '@/components/MobileMenu';
import { MobileTour } from '@/components/MobileTour';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  ScreenReaderAnnouncer, 
  SkipLinks, 
  VisualNotificationProvider,
  KeyboardNavigationProvider,
  AccessibilityQuickPanel,
  HighVisibilityMode,
  SensoryReducedMode
} from '@/components/accessibility';
import { FloatingAIAssistant } from '@/components/ai/FloatingAIAssistant';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  if (!user) {
    return (
      <VisualNotificationProvider>
        <div className="min-h-screen bg-background">
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
          <div className="min-h-screen bg-background">
            <ScreenReaderAnnouncer />
            <SkipLinks />
            <MobileMenu />
            <main id="main-content" className="pt-16 pb-24">
              {children}
            </main>
            <BottomNavigation />
            <MobileTour />
            <AccessibilityQuickPanel />
            <FloatingAIAssistant />
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
          <div className="min-h-screen flex w-full bg-background">
            <ScreenReaderAnnouncer />
            <SkipLinks />
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              {/* Top Bar */}
              <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                  <SidebarTrigger 
                    className="hover:bg-accent hover:text-accent-foreground" 
                    aria-label="Abrir/fechar menu lateral"
                  />
                  
                  <nav id="main-navigation" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Neuro IRB Prime</span>
                    <span aria-hidden="true">•</span>
                    <span>Plataforma Clínica Digital</span>
                  </nav>
                </div>

                <div className="flex items-center gap-4">
                  <LanguageSelector variant="icon" />
                  
                  <div className="hidden md:flex items-center gap-2">
                    <div 
                      className="w-2 h-2 bg-green-500 rounded-full" 
                      role="status"
                      aria-label={t('common.loading')}
                    />
                    <span className="text-xs text-muted-foreground">{t('nav.online') || 'Online'}</span>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main id="main-content" className="flex-1 overflow-auto bg-muted/30" role="main">
                <div className="container mx-auto px-6 py-6">
                  {children}
                </div>
              </main>
            </div>
            
            <AccessibilityQuickPanel />
            <FloatingAIAssistant />
          </div>
        </SidebarProvider>
      </KeyboardNavigationProvider>
    </VisualNotificationProvider>
  );
}