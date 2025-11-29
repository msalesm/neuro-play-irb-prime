import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, Gamepad2, FileText, GraduationCap, Settings, 
  User, Trophy, TrendingUp, Brain, Stethoscope, Users,
  School, Sparkles, BarChart3, BookOpen, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
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
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const location = useLocation();
  const { open } = useSidebar();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  // NAVEGAÇÃO COMPARTILHADA (todos os usuários)
  const sharedNavigation = [
    {
      title: 'Sistema de Planetas',
      path: '/sistema-planeta-azul',
      icon: Sparkles,
    },
    {
      title: 'Jogos',
      path: '/games',
      icon: Gamepad2,
    },
  ];

  // NAVEGAÇÃO POR PAPEL DE USUÁRIO
  const roleNavigations: Record<string, Array<{ title: string; path: string; icon: any }>> = {
    parent: [
      {
        title: 'Dashboard Pais',
        path: '/dashboard-pais',
        icon: Home,
      },
      {
        title: 'Chat Terapêutico',
        path: '/therapeutic-chat',
        icon: MessageSquare,
      },
      {
        title: 'Microlearning',
        path: '/training',
        icon: BookOpen,
      },
      {
        title: 'Manual',
        path: '/platform-manual',
        icon: FileText,
      },
    ],
    therapist: [
      {
        title: 'Meus Pacientes',
        path: '/therapist/patients',
        icon: Users,
      },
      {
        title: 'Relatórios Clínicos',
        path: '/clinical',
        icon: FileText,
      },
      {
        title: 'PEI Inteligente',
        path: '/pei',
        icon: Brain,
      },
      {
        title: 'Chat Terapêutico',
        path: '/therapeutic-chat',
        icon: MessageSquare,
      },
    ],
    admin: [
      {
        title: 'Dashboard Rede',
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
    ],
  };

  // CONFIGURAÇÕES (todos)
  const settingsNavigation = [
    {
      title: 'Perfil',
      path: '/profile',
      icon: User,
    },
    {
      title: 'Configurações',
      path: '/settings',
      icon: Settings,
    },
  ];

  // ROLE BADGE MAP
  const roleBadges: Record<string, { label: string; color: string }> = {
    parent: { label: 'Pais', color: 'bg-blue-500' },
    therapist: { label: 'Terapeuta', color: 'bg-purple-500' },
    admin: { label: 'Gestor', color: 'bg-orange-500' },
  };

  const currentRoleBadge = role ? roleBadges[role] : null;

  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border">
      <SidebarContent className="px-2 bg-sidebar">
        {/* Header com Badge de Role */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/landing" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-sm text-sidebar-foreground">NeuroPlay 2.0</span>
                {currentRoleBadge && (
                  <Badge className={`${currentRoleBadge.color} text-white text-xs mt-1 w-fit`}>
                    {currentRoleBadge.label}
                  </Badge>
                )}
              </div>
            )}
          </Link>
        </div>

        {/* Navegação Compartilhada */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1">
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {sharedNavigation.map((item) => (
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

        {/* Navegação por Role */}
        {role && roleNavigations[role] && (
          <SidebarGroup>
            {open && (
              <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1">
                {currentRoleBadge?.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {roleNavigations[role].map((item) => (
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
        )}

        {/* Configurações */}
        <SidebarGroup className="mt-auto">
          {open && (
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1">
              Conta
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => (
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

        {/* User Info */}
        {open && (
          <div className="p-4 border-t border-sidebar-border">
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
