import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Brain, Stethoscope, Settings, User, 
  Users, TrendingUp, Menu, Sparkles, Gamepad2,
  FileText, ClipboardCheck, Heart, BookOpen,
  Trophy, BarChart3, Shield, UserCircle, Briefcase, Drama, Calendar, Mail, Folder, Gem, CreditCard, CalendarCheck, Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/LanguageSelector';
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

  // ========== BUILD MENU BY ROLE ==========
  const menuSections: { title: string; items: { title: string; path: string; icon: any; badge?: string }[] }[] = [];

  // PACIENTE - vê apenas seu próprio menu
  if (role === 'patient') {
    menuSections.push({
      title: 'Meu Espaço',
      items: [
        { title: 'Meu Dia', path: '/student-hub', icon: Home },
        { title: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
        { title: 'Histórias Sociais', path: '/social-stories', icon: Drama },
        { title: 'Minhas Conquistas', path: '/learning-dashboard', icon: Trophy },
        { title: 'Meu Perfil', path: '/profile', icon: User },
      ],
    });
  }

  // PAIS - vê dashboard dos filhos e clube
  if (role === 'parent' || (!role && !isAdmin)) {
    menuSections.push({
      title: 'Área dos Pais',
      items: [
        { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
        { title: 'Agendar Consultas', path: '/agenda', icon: CalendarCheck, badge: 'Novo' },
        { title: 'Minhas Teleconsultas', path: '/minhas-teleconsultas', icon: Stethoscope, badge: 'Novo' },
        { title: 'Relatórios', path: '/reports', icon: BarChart3 },
        { title: 'Progresso dos Filhos', path: '/learning-dashboard', icon: TrendingUp },
        { title: 'Histórico Emocional', path: '/emotional-history', icon: Heart },
        { title: 'Mensagens', path: '/messages', icon: Mail, badge: 'Novo' },
        { title: 'Clube dos Pais', path: '/clube-pais', icon: Gem, badge: 'Novo' },
        { title: 'Microlearning', path: '/training', icon: BookOpen },
        { title: 'Minha Assinatura', path: '/subscription', icon: CreditCard, badge: 'Novo' },
      ],
    });
  }

  // TERAPEUTA - vê agenda, pacientes, teleconsultas
  if (role === 'therapist') {
    menuSections.push({
      title: 'Área Clínica',
      items: [
        { title: 'Agenda do Dia', path: '/agenda', icon: Calendar, badge: 'Novo' },
        { title: 'Meus Pacientes', path: '/therapist/patients', icon: Users },
        { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
        { title: 'Prontuário Eletrônico', path: '/clinical', icon: FileText },
        { title: 'PEI Inteligente', path: '/pei', icon: Brain },
        { title: 'Avaliações Clínicas', path: '/diagnostic-tests', icon: ClipboardCheck },
        { title: 'Inventário de Habilidades', path: '/inventario-habilidades', icon: ClipboardCheck, badge: 'Novo' },
        { title: 'Relatórios', path: '/reports', icon: BarChart3 },
        { title: 'Mensagens', path: '/messages', icon: Mail, badge: 'Novo' },
      ],
    });
  }

  // ADMIN - vê tudo
  if (isAdmin) {
    menuSections.push({
      title: 'Pacientes',
      items: [
        { title: 'Meu Dia', path: '/student-hub', icon: Home },
        { title: 'Planeta Azul', path: '/sistema-planeta-azul', icon: Sparkles },
        { title: 'Histórias Sociais', path: '/social-stories', icon: Drama },
        { title: 'Conquistas', path: '/learning-dashboard', icon: Trophy },
      ],
    });
    menuSections.push({
      title: 'Pais',
      items: [
        { title: 'Dashboard', path: '/dashboard-pais', icon: Home },
        { title: 'Agendar Consultas', path: '/agenda', icon: CalendarCheck },
        { title: 'Teleconsultas', path: '/minhas-teleconsultas', icon: Stethoscope },
        { title: 'Relatórios', path: '/reports', icon: BarChart3 },
        { title: 'Histórico Emocional', path: '/emotional-history', icon: Heart },
        { title: 'Clube dos Pais', path: '/clube-pais', icon: Gem },
      ],
    });
    menuSections.push({
      title: 'Terapeuta',
      items: [
        { title: 'Agenda do Dia', path: '/agenda', icon: Calendar },
        { title: 'Pacientes', path: '/therapist/patients', icon: Users },
        { title: 'Teleconsultas', path: '/teleconsultas', icon: Stethoscope },
        { title: 'Prontuário Eletrônico', path: '/clinical', icon: FileText },
        { title: 'Avaliações Clínicas', path: '/diagnostic-tests', icon: ClipboardCheck },
      ],
    });
    menuSections.push({
      title: 'Administração',
      items: [
        { title: 'Centro de Operações', path: '/operations', icon: TrendingUp, badge: 'Novo' },
        { title: 'Dashboard Institucional', path: '/institutional', icon: Building2, badge: 'Novo' },
        { title: 'Dashboard Geral', path: '/admin/network', icon: BarChart3 },
        { title: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
        { title: 'Gerenciador de Conteúdo', path: '/content-manager', icon: Folder },
        { title: 'Clube dos Pais (Admin)', path: '/admin/clube-pais', icon: Gem },
      ],
    });
  }

  // Always show Settings
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
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Menu
            </SheetTitle>
            <LanguageSelector variant="minimal" />
          </div>
          
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
            {role === 'patient' && (
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 gap-1.5">
                <Gamepad2 className="w-3 h-3" />
                Paciente
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
                        key={item.path + item.title}
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
                        {item.badge && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground ml-auto">
                            {item.badge}
                          </Badge>
                        )}
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
