import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, Gamepad2, FileText, GraduationCap, Settings, 
  User, Trophy, TrendingUp, Brain, Stethoscope, Heart,
  ChevronRight, Circle, Play, BookOpen, ClipboardCheck, Users, School, Sparkles, BarChart3,
  Shield, UserCircle, Briefcase, Building2, Drama, CalendarCheck, Rocket, Mail, CreditCard, Folder, Calendar, ClipboardList, Gem
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
  const { role, isAdmin, isTherapist } = useUserRole();
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

  // ========== PACIENTE (criança/adolescente) ==========
  const patientNavigation = [
    {
      title: 'Meu Dia',
      path: '/student-hub',
      icon: Home,
    },
    {
      title: 'Planeta Azul',
      path: '/sistema-planeta-azul',
      icon: Sparkles,
    },
    {
      title: 'Histórias Sociais',
      path: '/social-stories',
      icon: Drama,
    },
    {
      title: 'Minhas Conquistas',
      path: '/learning-dashboard',
      icon: Trophy,
    },
    {
      title: 'Meu Perfil',
      path: '/profile',
      icon: User,
    },
    {
      title: 'Histórico Emocional',
      path: '/emotional-history',
      icon: Heart,
    },
  ];

  // ========== PAIS/RESPONSÁVEIS ==========
  const parentsNavigation = [
    {
      title: 'Dashboard',
      path: '/dashboard-pais',
      icon: Home,
    },
    {
      title: 'Agendar Consultas',
      path: '/agenda',
      icon: CalendarCheck,
      badge: 'Novo',
    },
    {
      title: 'Minhas Teleconsultas',
      path: '/minhas-teleconsultas',
      icon: Stethoscope,
      badge: 'Novo',
    },
    {
      title: 'Relatório Familiar',
      path: '/reports',
      icon: FileText,
    },
    {
      title: 'Progresso dos Filhos',
      path: '/learning-dashboard',
      icon: TrendingUp,
    },
    {
      title: 'Mensagens',
      path: '/messages',
      icon: Mail,
      badge: 'Novo',
    },
    {
      title: 'Clube dos Pais',
      path: '/clube-pais',
      icon: Gem,
      badge: 'Novo',
    },
    {
      title: 'Microlearning',
      path: '/training',
      icon: BookOpen,
    },
    {
      title: 'Minha Assinatura',
      path: '/subscription',
      icon: CreditCard,
      badge: 'Novo',
    },
  ];

  // ========== TERAPEUTA ==========
  // Menu simplificado do terapeuta - PACIENTES como foco central
  const therapistNavigation = [
    {
      title: 'Pacientes',
      path: '/therapist/patients',
      icon: Users,
      description: 'Prontuário, PEI e acompanhamento',
    },
    {
      title: 'Agenda',
      path: '/agenda',
      icon: Calendar,
    },
    {
      title: 'Teleconsultas',
      path: '/teleconsultas',
      icon: Stethoscope,
    },
    {
      title: 'Avaliações',
      path: '/diagnostic-tests',
      icon: ClipboardCheck,
    },
    {
      title: 'Inventário de Habilidades',
      path: '/inventario-habilidades',
      icon: ClipboardCheck,
    },
    {
      title: 'Anamnese',
      path: '/anamnese',
      icon: ClipboardList,
      badge: 'Novo',
    },
    {
      title: 'Relatório Clínico',
      path: '/reports',
      icon: FileText,
    },
    {
      title: 'Mensagens',
      path: '/messages',
      icon: Mail,
    },
  ];

  // ========== PROFESSOR ==========
  const teacherNavigation = [
    {
      title: 'Neuro Play Educação',
      path: '/educacao',
      icon: School,
      description: 'Turmas, check-in e relatórios',
    },
    {
      title: 'Mensagens',
      path: '/messages',
      icon: Mail,
    },
  ];

  // ========== ADMIN ==========
  const adminNavigation = [
    {
      title: 'Dashboard Institucional',
      path: '/institutional',
      icon: Building2,
    },
    {
      title: 'Centro de Operações',
      path: '/operations',
      icon: TrendingUp,
    },
    {
      title: 'Neuro Play Educação',
      path: '/educacao',
      icon: School,
    },
    {
      title: 'Secretaria Municipal',
      path: '/secretaria-educacao',
      icon: Building2,
    },
    {
      title: 'Gerenciar Usuários',
      path: '/admin/users',
      icon: Users,
    },
    {
      title: 'Clube dos Pais',
      path: '/admin/clube-pais',
      icon: Gem,
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

  // ========== BUILD NAVIGATION BY ROLE ==========
  const navigationGroups = [];

  // PACIENTE - vê apenas seu próprio menu
  if (role === 'patient') {
    navigationGroups.push({
      id: 'patient',
      label: 'Meu Espaço',
      items: patientNavigation,
    });
  }

  // PAIS - vê dashboard dos filhos e clube
  if (role === 'parent' || (!role && !isAdmin)) {
    navigationGroups.push({
      id: 'parents',
      label: 'Área dos Pais',
      items: parentsNavigation,
    });
  }

  // TERAPEUTA - vê agenda, pacientes, teleconsultas
  if (role === 'therapist') {
    navigationGroups.push({
      id: 'therapist',
      label: 'Área Clínica',
      items: therapistNavigation,
    });
  }

  // PROFESSOR - vê módulo educação
  if (role === 'teacher') {
    navigationGroups.push({
      id: 'teacher',
      label: 'Área do Professor',
      items: teacherNavigation,
    });
  }

  // ADMIN - vê tudo
  if (isAdmin) {
    navigationGroups.push({
      id: 'admin-patients',
      label: 'Pacientes',
      items: patientNavigation,
    });
    navigationGroups.push({
      id: 'admin-parents',
      label: 'Pais',
      items: parentsNavigation,
    });
    navigationGroups.push({
      id: 'admin-therapist',
      label: 'Terapeuta',
      items: therapistNavigation,
    });
    navigationGroups.push({
      id: 'admin',
      label: 'Administração',
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
                {group.items.map((item: any) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.path}
                        className={`text-sidebar-foreground ${item.highlight ? 'bg-primary/10 border border-primary/30' : ''} ${isActive(item.path) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'}`}
                      >
                        <item.icon className={`w-4 h-4 ${item.highlight ? 'text-primary' : ''}`} />
                        {open && (
                          <span className="flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground">
                                {item.badge}
                              </Badge>
                            )}
                          </span>
                        )}
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