/**
 * Child/Patient Layout
 * 
 * Playful, game-like interface with minimal chrome.
 * Mobile: bottom tab bar with FAB + compact header.
 */

import { Link } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomTabBar } from '@/components/mobile/MobileBottomTabBar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChildLayoutProps {
  children: React.ReactNode;
}

export function ChildLayout({ children }: ChildLayoutProps) {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Jogador';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Compact top bar with profile access */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50 px-4 py-2">
        <div className="flex items-center justify-between max-w-[430px] mx-auto">
          <span className="font-bold text-base text-foreground">NeuroPlay</span>
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

      <MobileBottomTabBar fabRoute="/games" />
    </div>
  );
}
