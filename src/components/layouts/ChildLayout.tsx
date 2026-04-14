/**
 * Child/Patient Layout
 * 
 * Playful, game-like interface with minimal chrome.
 * Mobile: bottom tab bar with FAB. Desktop: same bottom nav.
 */

import { useAuth } from '@/hooks/useAuth';
import { MobileBottomTabBar } from '@/components/mobile/MobileBottomTabBar';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

interface ChildLayoutProps {
  children: React.ReactNode;
}

export function ChildLayout({ children }: ChildLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main id="main-content" className="pb-tab-bar min-h-[100dvh]">
        <div className="mobile-container px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom tab bar with FAB */}
      <MobileBottomTabBar fabRoute="/games" />
    </div>
  );
}
