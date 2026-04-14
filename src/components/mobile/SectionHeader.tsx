/**
 * Section Header
 * 
 * Simple section title with optional "ver mais" link.
 */

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionRoute?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  actionLabel = 'Ver mais',
  actionRoute,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-1 mb-3', className)}>
      <h2 className="text-lg-mobile font-bold text-foreground">{title}</h2>
      {actionRoute && (
        <Link
          to={actionRoute}
          className="text-sm-mobile font-medium text-primary tap-feedback"
        >
          {actionLabel}
        </Link>
      )}
      {onAction && !actionRoute && (
        <button
          onClick={onAction}
          className="text-sm-mobile font-medium text-primary tap-feedback"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
