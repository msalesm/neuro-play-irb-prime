/**
 * Activity List Item
 * 
 * Standard list item for tasks, activities, and appointments.
 * Icon left, text center, metadata right. No dividers — gap-based.
 */

import { cn } from '@/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityListItemProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  rightText?: string;
  rightIcon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ActivityListItem({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  rightText,
  rightIcon: RightIcon = ChevronRight,
  href,
  onClick,
  className,
}: ActivityListItemProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-2xl bg-card shadow-card tap-feedback',
        className
      )}
    >
      {/* Left icon */}
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>

      {/* Center text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm-mobile font-semibold text-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-xs-mobile text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {/* Right metadata */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {rightText && (
          <span className="text-xs-mobile font-medium text-muted-foreground">{rightText}</span>
        )}
        <RightIcon className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }

  if (onClick) {
    return <button onClick={onClick} className="block w-full text-left">{content}</button>;
  }

  return content;
}
