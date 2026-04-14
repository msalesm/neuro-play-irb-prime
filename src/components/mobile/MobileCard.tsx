/**
 * Mobile Card
 * 
 * Standard card with 20px radius and soft shadow.
 * Replaces generic Card for mobile-optimized layouts.
 */

import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  padding?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function MobileCard({
  children,
  className,
  onClick,
  padding = 'md',
  animated = true,
}: MobileCardProps) {
  const paddingMap = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const classes = cn(
    'bg-card rounded-[20px] shadow-card',
    paddingMap[padding],
    animated && 'slide-up',
    onClick && 'cursor-pointer tap-feedback',
    className
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(classes, 'text-left w-full')}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}
