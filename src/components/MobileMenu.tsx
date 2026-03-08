import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, User, Menu, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/LanguageSelector';
import { getMobileMenuSections, getRoleBadge } from '@/core/navigation';
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
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const menuSections = getMobileMenuSections(role, isAdmin);
  const roleBadge = getRoleBadge(role);

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
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {menuSections.map((section) => (
              <div key={section.id}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {section.label}
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
