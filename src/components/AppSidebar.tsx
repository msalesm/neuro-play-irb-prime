import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, Gamepad2, FileText, GraduationCap, Settings, 
  User, Trophy, TrendingUp, Brain, Stethoscope,
  ChevronRight, Circle, Play, BookOpen, ClipboardCheck, Users, School, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

  const mainNavigation = [
    {
      title: t('nav.home'),
      path: '/',
      icon: Home,
    },
    {
      title: t('nav.today'),
      path: '/dashboard',
      icon: TrendingUp,
    },
    {
      title: 'Sistema Planeta Azul',
      path: '/sistema-planeta-azul',
      icon: Sparkles,
    },
    {
      title: 'Educação Parental',
      path: '/training',
      icon: BookOpen,
    },
  ];

  const neuroPlayEduNavigation = [
    {
      title: 'Triagem Gamificada',
      path: '/screening',
      icon: ClipboardCheck,
    },
    {
      title: 'Painel do Professor',
      path: '/teacher-dashboard',
      icon: Users,
    },
    {
      title: 'Capacitação Docente',
      path: '/training',
      icon: School,
    },
  ];

  const gamesNavigation = [
    {
      title: t('nav.games'),
      path: '/games',
      icon: Gamepad2,
    },
  ];

  const assessmentNavigation = [
    {
      title: t('nav.tests'),
      path: '/diagnostic-tests',
      icon: FileText,
    },
    {
      title: 'Dashboard Clínico',
      path: '/clinical',
      icon: Stethoscope,
    },
  ];

  const learningNavigation = [
    {
      title: t('nav.learning'),
      path: '/learning-dashboard',
      icon: GraduationCap,
    },
    {
      title: 'Neuroplasticidade',
      path: '/neuroplasticity',
      icon: Brain,
    },
  ];

  const settingsNavigation = [
    {
      title: 'Configurações',
      path: '/settings',
      icon: Settings,
    },
    {
      title: 'Perfil',
      path: '/profile',
      icon: User,
    },
  ];

  const navigationGroups = [
    {
      id: 'main',
      label: 'Principal',
      items: mainNavigation,
    },
    {
      id: 'neuroplay-edu',
      label: 'Neuro Play EDU',
      items: neuroPlayEduNavigation,
    },
    {
      id: 'games',
      label: 'Jogos',
      items: gamesNavigation,
    },
    {
      id: 'assessment',
      label: 'Avaliação',
      items: assessmentNavigation,
    },
    {
      id: 'learning',
      label: 'Aprendizado',
      items: learningNavigation,
    },
    {
      id: 'settings',
      label: 'Configurações',
      items: settingsNavigation,
    },
  ];

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