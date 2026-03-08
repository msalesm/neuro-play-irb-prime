/**
 * Professional Layout (Therapists + Teachers + Admin)
 * 
 * Data-dense, clinical interface with sidebar navigation.
 * Shows: ABA programs, cognitive profiles, evolution charts, reports, medical records.
 */

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Badge } from '@/components/ui/badge';
import { ROLE_BADGES } from '@/core/navigation';

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

export function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const { user } = useAuth();
  const { role } = useUserRole();

  const roleBadge = role ? ROLE_BADGES[role] : null;

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Professional header with role indicator */}
          <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger 
                className="hover:bg-accent hover:text-accent-foreground" 
                aria-label="Menu"
              />
              {roleBadge && (
                <Badge variant="outline" className={`text-[10px] py-0.5 px-2 ${roleBadge.gradient}`}>
                  {roleBadge.label}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector variant="icon" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[11px] text-muted-foreground">Online</span>
              </div>
            </div>
          </header>

          {/* Content area — full width for data-dense views */}
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
