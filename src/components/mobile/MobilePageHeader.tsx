/**
 * Mobile Page Header
 * 
 * Contextual header with avatar, greeting, and notification badge.
 * Replaces the global sticky header on mobile views.
 */

import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MobilePageHeaderProps {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobilePageHeader({
  title,
  subtitle,
  showGreeting = false,
  showNotifications = true,
  notificationCount = 0,
  rightAction,
  className,
}: MobilePageHeaderProps) {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className={cn('px-5 pt-5 pb-2', className)}>
      <div className="flex items-center justify-between">
        {/* Left: Avatar + greeting or title */}
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback className="bg-primary-light text-primary font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            {showGreeting && (
              <span className="text-sm-mobile text-muted-foreground">
                Olá, {displayName} 👋
              </span>
            )}
            {title && (
              <h1 className="text-xl-mobile font-bold text-foreground leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <span className="text-sm-mobile text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: notifications or custom action */}
        <div className="flex items-center gap-2">
          {rightAction}
          {showNotifications && (
            <Link
              to="/notifications"
              className="relative p-2 rounded-full hover:bg-muted transition-colors tap-feedback"
              aria-label={`Notificações${notificationCount > 0 ? ` (${notificationCount} novas)` : ''}`}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
