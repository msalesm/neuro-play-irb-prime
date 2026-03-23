/**
 * Child/Patient Layout
 * 
 * Playful, game-like interface with minimal chrome.
 * Shows only: games, stories, routines, rewards, progression.
 * No reports, clinical data, or technical metrics.
 */

import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Gamepad2, Trophy, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChildLayoutProps {
  children: React.ReactNode;
}

const CHILD_NAV = [
  { name: 'Início', path: '/student-hub', icon: Home },
  { name: 'Mapa', path: '/sistema-planeta-azul', icon: Sparkles },
  { name: 'Jogos', path: '/games', icon: Gamepad2 },
  { name: 'Conquistas', path: '/conquistas', icon: Trophy },
  { name: 'Perfil', path: '/profile', icon: User },
];

export function ChildLayout({ children }: ChildLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/student-hub' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Child-friendly top bar */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50 px-4 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link to="/student-hub" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base text-foreground">
              NeuroPlay
            </span>
          </Link>
          <Link to="/profile" className="p-2 rounded-full hover:bg-accent transition-colors">
            <User className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </header>

      {/* Main content — wider padding for games */}
      <main id="main-content" className="pb-24 min-h-[calc(100vh-120px)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom navigation — rounded pill style */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
        role="navigation"
        aria-label="Menu principal"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-3 mb-2 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg">
          <div className="flex justify-around items-center py-1.5">
            {CHILD_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[56px] ${
                    active
                      ? 'text-primary bg-primary/10 scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={item.name}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`h-5 w-5 mb-0.5 ${active ? 'text-primary' : ''}`} />
                  <span className={`text-[10px] font-semibold leading-tight ${active ? 'text-primary' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
