import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, Gamepad2, FileText, GraduationCap, Settings, 
  User, Trophy, TrendingUp, Brain, Stethoscope, Heart,
  ChevronRight, Circle, Play, BookOpen, ClipboardCheck, Users, School, Sparkles, BarChart3,
  Shield, UserCircle, Briefcase, Building2, Drama, CalendarCheck, Rocket, Mail, CreditCard, Folder, Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function AppSidebar() {
  const { user } = useAuth();
  const { role, isAdmin } = useUserRole();
  const { t } = useLanguage();
  const location = useLocation();
  const { open } = useSidebar();
  const [openGroups, setOpenGroups] = useState<string[]>(['main']);

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Principal - Navegação do aluno/criança
  const principalNavigation = [
    {
      title: 'Hub do Aluno',
      path: '/student-hub',
      icon: Rocket,
    },
    {
      title: 'Sistema de Planetas',
      path: '/sistema-planeta-azul',
      icon: Sparkles,
    },
    {
      title: 'Histórias Sociais',
      path: '/social-stories',
      icon: Drama,
    },
  ];

  // Home - Navegação clínica focada
  const homeNavigation = [
    {
      title: 'Avaliações Clínicas',
      path: '/diagnostic-tests',
      icon: ClipboardCheck,
    },
    {
      title: t('nav.progress'),
      path: '/learning-dashboard',
      icon: TrendingUp,
    },
    {
      title: t('nav.profile'),
      path: '/profile',
      icon: User,
    },
  ];

  // Pais
  const parentsNavigation = [
    {
      title: 'Dashboard',
      path: '/dashboard-pais',
      icon: Home,
    },
    {
      title: 'Minhas Teleconsultas',
      path: '/minhas-teleconsultas',
      icon: Stethoscope,
    },
    {
      title: 'Mensagens',
      path: '/messages',
      icon: Mail,
    },
    {
      title: 'Relatórios Inteligentes',
      path: '/reports',
      icon: BarChart3,
    },
    {
      title: 'Microlearning',
      path: '/training',
      icon: BookOpen,
    },
    {
      title: 'Histórico Emocional',
      path: '/emotional-history',
      icon: Heart,
    },
    {
      title: 'Minha Assinatura',
      path: '/subscription',
      icon: CreditCard,
    },
    {
      title: 'Manual da Plataforma',
      path: '/platform-manual',
      icon: BookOpen,
    },
  ];

  // Terapeuta
  const therapistNavigation = [
    {
      title: 'Agenda Clínica',
      path: '/agenda',
      icon: Calendar,
    },
    {
      title: 'Teleconsultas',
      path: '/teleconsultas',
      icon: Stethoscope,
    },
    {
      title: 'Pacientes',
      path: '/therapist/patients',
      icon: Users,
    },
    {
      title: 'Prontuário Eletrônico',
      path: '/clinical',
      icon: FileText,
    },
    {
      title: 'PEI Inteligente',
      path: '/pei',
      icon: Brain,
    },
    {
      title: 'Mensagens',
      path: '/messages',
      icon: Mail,
    },
    {
      title: 'Analytics Profissional',
      path: '/professional-analytics',
      icon: BarChart3,
    },
  ];

  // Escola
  const teacherNavigation = [
    {
      title: 'Turmas',
      path: '/teacher/classes',
      icon: School,
    },
    {
      title: 'Relatórios Pedagógicos',
      path: '/reports',
      icon: BarChart3,
    },
    {
      title: 'PEI Escolar',
      path: '/teacher-dashboard',
      icon: GraduationCap,
    },
    {
      title: 'Estratégias',
      path: '/training',
      icon: BookOpen,
    },
  ];

  // Gestor Público / Admin
  const adminNavigation = [
    {
      title: 'IA Contextual',
      path: '/contextual-ai',
      icon: Brain,
    },
    {
      title: 'Centro de Operações',
      path: '/operations',
      icon: TrendingUp,
    },
    {
      title: 'Dashboard Institucional',
      path: '/institutional',
      icon: Building2,
    },
    {
      title: 'Dashboard Geral',
      path: '/admin/network',
      icon: BarChart3,
    },
    {
      title: 'Gerenciar Usuários',
      path: '/admin/users',
      icon: Users,
    },
    {
      title: 'Gerenciador de Conteúdo',
      path: '/content-manager',
      icon: Folder,
    },
    {
      title: 'Relacionamentos',
      path: '/admin/relationships',
      icon: Heart,
    },
    {
      title: 'Analytics Profissional',
      path: '/professional-analytics',
      icon: TrendingUp,
    },
    {
      title: 'Editor de Histórias',
      path: '/admin/story-editor',
      icon: BookOpen,
    },
    {
      title: 'Mapas de Risco',
      path: '/admin/risk-maps',
      icon: TrendingUp,
    },
    {
      title: 'Gestão de Rede',
      path: '/admin/network-management',
      icon: Settings,
    },
  ];

  // Configurações (para todos)
  const settingsNavigation = [
    {
      title: 'Configurações',
      path: '/settings',
      icon: Settings,
    },
  ];

  // Organize navigation groups based on role
  // Admins can see ALL menus
  const navigationGroups = [];

  // Always show Principal section first (student-facing)
  navigationGroups.push({
    id: 'principal',
    label: 'Principal',
    items: principalNavigation,
  });

  // Always show Home section
  navigationGroups.push({
    id: 'home',
    label: 'Home',
    items: homeNavigation,
  });

  // Show Parents section if user is admin, parent, or no role defined
  if (isAdmin || role === 'parent' || !role) {
    navigationGroups.push({
      id: 'parents',
      label: 'Pais',
      items: parentsNavigation,
    });
  }

  // Show Therapist section if user is admin or therapist
  if (isAdmin || role === 'therapist') {
    navigationGroups.push({
      id: 'therapist',
      label: 'Terapeuta',
      items: therapistNavigation,
    });
  }

  // Show School section if user is admin, parent, or no role defined
  if (isAdmin || role === 'parent' || !role) {
    navigationGroups.push({
      id: 'teacher',
      label: 'Escola',
      items: teacherNavigation,
    });
  }

  // Show Admin section if user is admin
  if (isAdmin) {
    navigationGroups.push({
      id: 'admin',
      label: 'Gestor Público',
      items: adminNavigation,
    });
  }

  // Always show Settings
  navigationGroups.push({
    id: 'settings',
    label: 'Configurações',
    items: settingsNavigation,
  });

  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border">
      <SidebarContent className="px-2 bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/landing" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-sidebar-foreground">Neuro IRB Prime</span>
                <span className="text-xs text-sidebar-foreground/60">Plataforma Clínica</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.id}>
            {open && (
              <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.path}
                        className={`text-sidebar-foreground ${isActive(item.path) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'}`}
                      >
                        <item.icon className="w-4 h-4" />
                        {open && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* User Info with Role Indicator */}
        {open && (
          <div className="mt-auto p-4 border-t border-sidebar-border space-y-3">
            {/* Role Badge */}
            <div className="flex items-center gap-2">
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
            
            {/* User Email */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</span>
                <span className="text-xs text-sidebar-foreground/60">
                  {isAdmin ? 'Acesso Total' : 'Usuário Ativo'}
                </span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}