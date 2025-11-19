import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Brain, Stethoscope, Settings, User, 
  Users, School, TrendingUp, Menu, X 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MobileMenu() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { title: t('nav.home'), path: '/', icon: Home },
        { title: t('nav.today'), path: '/dashboard', icon: TrendingUp },
      ],
    },
    {
      title: 'Avaliação',
      items: [
        { title: 'Dashboard Clínico', path: '/clinical', icon: Stethoscope },
        { title: 'Neuroplasticidade', path: '/neuroplasticity', icon: Brain },
      ],
    },
    {
      title: 'Neuro Play EDU',
      items: [
        { title: 'Painel do Professor', path: '/teacher-dashboard', icon: Users },
        { title: 'Capacitação Docente', path: '/training', icon: School },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { title: 'Configurações', path: '/settings', icon: Settings },
        { title: 'Perfil', path: '/profile', icon: User },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-card/95 backdrop-blur-sm border border-border md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Menu
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
