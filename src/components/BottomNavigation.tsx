import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, FileText, GraduationCap, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNavigation() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  
  const navigationItems = [
    {
      name: t('nav.games'),
      path: '/games',
      icon: Gamepad2,
    },
    {
      name: t('nav.tests'),
      path: '/diagnostic-tests',
      icon: FileText,
    },
    {
      name: t('nav.screening'),
      path: '/screening',
      icon: ClipboardCheck,
    },
    {
      name: t('nav.learning'),
      path: '/learning-dashboard',
      icon: GraduationCap,
    },
  ];

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-smooth min-w-[60px] ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium ${active ? 'text-primary' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}