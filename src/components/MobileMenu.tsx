import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Brain, Stethoscope, Settings, User, 
  Users, School, TrendingUp, Menu, Sparkles, Gamepad2,
  FileText, ClipboardCheck, GraduationCap, Heart, BookOpen,
  Trophy, BarChart3, Shield, UserCircle, Briefcase, Drama, CalendarCheck, Rocket, Mail, Folder
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { role, isAdmin } = useUserRole();
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
        { title: 'Hub do Aluno', path: '/student-hub', icon: Rocket },
        { title: 'Sistema de Planetas', path: '/sistema-planeta-azul', icon: Sparkles },
        { title: 'Minhas Rotinas', path: '/rotinas', icon: CalendarCheck },
        { title: 'Jogos Cognitivos', path: '/games', icon: Gamepad2 },
        { title: 'Histórias Sociais', path: '/social-stories', icon: Drama },
        { title: 'Comunidade', path: '/community', icon: Users },
        { title: 'Progresso', path: '/learning-dashboard', icon: TrendingUp },
      ],
    },
    {
      title: 'Planetas Terapêuticos',
      items: [
        { title: 'Aurora (TEA)', path: '/planeta/aurora', icon: Sparkles },
        { title: 'Vortex (TDAH)', path: '/planeta/vortex', icon: Sparkles },
        { title: 'Lumen (Dislexia)', path: '/planeta/lumen', icon: Sparkles },
        { title: 'Calm (Regulação)', path: '/planeta/calm', icon: Sparkles },
        { title: 'Order (Executivas)', path: '/planeta/order', icon: Sparkles },
      ],
    },
    {
      title: 'Avaliação & Triagem',
      items: [
        { title: 'Testes Diagnósticos', path: '/diagnostic-tests', icon: FileText },
        { title: 'Triagem TUNP', path: '/screening', icon: ClipboardCheck },
      ],
    },
  ];

  // Adiciona seções baseadas no papel do usuário
  // Admins veem TODOS os menus
  if (isAdmin || role === 'parent' || !role) {
    menuSections.push({
      title: 'Pais',
      items: [
        { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
        { title: 'Mensagens', path: '/messages', icon: Mail },
        { title: 'Microlearning', path: '/training', icon: BookOpen },
        { title: 'Histórico Emocional', path: '/emotional-history', icon: Heart },
        { title: 'Manual da Plataforma', path: '/platform-manual', icon: BookOpen },
      ],
    });
  }

  if (isAdmin || role === 'therapist') {
    menuSections.push({
      title: 'Terapeuta',
      items: [
        { title: 'Pacientes', path: '/therapist/patients', icon: Users },
        { title: 'Mensagens', path: '/messages', icon: Mail },
        { title: 'Relatórios', path: '/clinical', icon: FileText },
        { title: 'PEI Inteligente', path: '/pei', icon: Brain },
      ],
    });
  }

  if (isAdmin || role === 'parent' || !role) {
    menuSections.push({
      title: 'Escola',
      items: [
        { title: 'Turmas', path: '/teacher/classes', icon: School },
        { title: 'PEI Escolar', path: '/teacher-dashboard', icon: GraduationCap },
        { title: 'Estratégias', path: '/training', icon: BookOpen },
      ],
    });
  }

  if (isAdmin) {
    menuSections.push({
      title: 'Gestor Público',
      items: [
        { title: 'Dashboard Geral', path: '/admin/network', icon: BarChart3 },
        { title: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
        { title: 'Gerenciador de Conteúdo', path: '/content-manager', icon: Folder },
        { title: 'Mapas de Risco', path: '/admin/risk-maps', icon: TrendingUp },
        { title: 'IA Contextual', path: '/contextual-ai', icon: Brain },
        { title: 'Analytics Profissional', path: '/professional-analytics', icon: BarChart3 },
        { title: 'Editor de Histórias', path: '/admin/story-editor', icon: BookOpen },
        { title: 'Dashboard Institucional', path: '/institutional', icon: Briefcase },
      ],
    });
  }

  menuSections.push({
    title: 'Configurações',
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
        <SheetHeader className="p-6 pb-4 border-b space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Menu
          </SheetTitle>
          
          {/* Role Badge */}
          <div className="flex items-center">
            {role === 'admin' && (
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 gap-1.5">
                <Shield className="w-3 h-3" />
                Administrador
              </Badge>
            )}
            {role === 'therapist' && (
              <Badge className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 gap-1.5">
                <Briefcase className="w-3 h-3" />
                Terapeuta
              </Badge>
            )}
            {role === 'parent' && (
              <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 gap-1.5">
                <UserCircle className="w-3 h-3" />
                Pai/Mãe
              </Badge>
            )}
            {!role && (
              <Badge variant="secondary" className="gap-1.5">
                <User className="w-3 h-3" />
                Usuário
              </Badge>
            )}
          </div>
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
