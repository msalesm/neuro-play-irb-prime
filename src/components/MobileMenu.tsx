import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Brain, Settings, User, 
  Users, TrendingUp, Menu, Sparkles, Gamepad2,
  FileText, BookOpen, Trophy, BarChart3, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
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
  const { role } = useUserRole();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  // ROLE BADGE MAP
  const roleBadges: Record<string, { label: string; color: string }> = {
    parent: { label: 'Pais', color: 'bg-blue-500' },
    therapist: { label: 'Terapeuta', color: 'bg-purple-500' },
    admin: { label: 'Gestor', color: 'bg-orange-500' },
  };

  const currentRoleBadge = role ? roleBadges[role] : null;

  // ESTRUTURA DE MENU
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { title: 'Sistema de Planetas', path: '/sistema-planeta-azul', icon: Sparkles },
        { title: 'Jogos Cognitivos', path: '/games', icon: Gamepad2 },
      ],
    },
  ];

  // ADICIONA MENU POR ROLE
  if (role === 'parent') {
    menuSections.push({
      title: 'Pais',
      items: [
        { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
        { title: 'Chat Terapêutico', path: '/therapeutic-chat', icon: MessageSquare },
        { title: 'Microlearning', path: '/training', icon: BookOpen },
        { title: 'Manual', path: '/platform-manual', icon: FileText },
      ],
    });
  }

  if (role === 'therapist') {
    menuSections.push({
      title: 'Terapeuta',
      items: [
        { title: 'Meus Pacientes', path: '/therapist/patients', icon: Users },
        { title: 'Relatórios Clínicos', path: '/clinical', icon: FileText },
        { title: 'PEI Inteligente', path: '/pei', icon: Brain },
        { title: 'Chat Terapêutico', path: '/therapeutic-chat', icon: MessageSquare },
      ],
    });
  }

  if (role === 'admin') {
    menuSections.push({
      title: 'Gestor Público',
      items: [
        { title: 'Dashboard Rede', path: '/admin/network', icon: BarChart3 },
        { title: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
        { title: 'Mapas de Risco', path: '/admin/risk-maps', icon: TrendingUp },
      ],
    });
  }

  // CONFIGURAÇÕES (todos)
  menuSections.push({
    title: 'Conta',
    items: [
      { title: 'Perfil', path: '/profile', icon: User },
      { title: 'Configurações', path: '/settings', icon: Settings },
    ],
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-card/95 backdrop-blur-sm border border-border md:hidden"
          data-mobile-tour="menu-button"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>NeuroPlay 2.0</span>
            </div>
            {currentRoleBadge && (
              <Badge className={`${currentRoleBadge.color} text-white text-xs`}>
                {currentRoleBadge.label}
              </Badge>
            )}
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
