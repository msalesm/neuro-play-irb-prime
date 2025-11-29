import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, Gamepad2, FileText, GraduationCap, Settings, 
  User, Trophy, TrendingUp, Brain, Stethoscope, Heart,
  ChevronRight, Circle, Play, BookOpen, ClipboardCheck, Users, School, Sparkles, BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { role } = useUserRole();
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

  // Home - Criança/Usuário Principal
  const homeNavigation = [
    {
      title: 'Sistema de Planetas',
      path: '/sistema-planeta-azul',
      icon: Sparkles,
    },
    {
      title: 'Missão do Dia',
      path: '/dashboard',
      icon: Trophy,
    },
    {
      title: 'Jogos Cognitivos',
      path: '/games',
      icon: Gamepad2,
    },
    {
      title: 'Progresso',
      path: '/learning-dashboard',
      icon: TrendingUp,
    },
    {
      title: 'Perfil',
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
      title: 'Microlearning',
      path: '/training',
      icon: BookOpen,
    },
    {
      title: 'Atividades Parent-Child',
      path: '/parent-child-activities',
      icon: Users,
    },
    {
      title: 'Histórico Emocional',
      path: '/emotional-history',
      icon: Heart,
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
      title: 'Pacientes',
      path: '/therapist/patients',
      icon: Users,
    },
    {
      title: 'Relatórios',
      path: '/clinical',
      icon: FileText,
    },
    {
      title: 'PEI Inteligente',
      path: '/pei',
      icon: Brain,
    },
    {
      title: 'Jogos Terapêuticos',
      path: '/games',
      icon: Gamepad2,
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

  // Gestor Público
  const adminNavigation = [
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
  const navigationGroups = [];

  // Always show Home section
  navigationGroups.push({
    id: 'home',
    label: 'Home',
    items: homeNavigation,
  });

  // Show Parents section if user is a parent or no role defined
  if (role === 'parent' || !role) {
    navigationGroups.push({
      id: 'parents',
      label: 'Pais',
      items: parentsNavigation,
    });
  }

  // Show Therapist section if user is a therapist
  if (role === 'therapist') {
    navigationGroups.push({
      id: 'therapist',
      label: 'Terapeuta',
      items: therapistNavigation,
    });
  }

  // Show School section if user is a teacher or no role defined
  if (role === 'parent' || !role) {
    navigationGroups.push({
      id: 'teacher',
      label: 'Escola',
      items: teacherNavigation,
    });
  }

  // Show Admin section if user is admin
  if (role === 'admin') {
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-sidebar-foreground">NeuroPlay</span>
                <span className="text-xs text-sidebar-foreground/60">Forge</span>
              </div>
            )}
          </div>
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

        {/* User Info */}
        {open && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</span>
                <span className="text-xs text-sidebar-foreground/60">Usuário Ativo</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}