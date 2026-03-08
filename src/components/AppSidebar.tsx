import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Brain, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
import { getSidebarSections, getRoleBadge } from '@/core/navigation';
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
  const { role, isAdmin } = useUserRole();
  const location = useLocation();
  const { open } = useSidebar();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const navigationGroups = getSidebarSections(role, isAdmin);
  const roleBadge = getRoleBadge(role);

  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border">
      <SidebarContent className="px-2 bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-sidebar-foreground">NeuroPlay</span>
                <span className="text-xs text-sidebar-foreground/60">Aprendizado Cognitivo</span>
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

        {/* User Info */}
        {open && (
          <div className="mt-auto p-4 border-t border-sidebar-border space-y-3">
            {/* Role Badge */}
            <div className="flex items-center gap-2">
              {roleBadge ? (
                <Badge className={`${roleBadge.gradient} gap-1.5`}>
                  <roleBadge.icon className="w-3 h-3" />
                  {roleBadge.label}
                </Badge>
              ) : (
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
