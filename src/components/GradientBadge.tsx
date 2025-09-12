import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GradientBadgeProps {
  children: React.ReactNode;
  gradient?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GradientBadge({ 
  children, 
  gradient = 'from-purple-500 to-blue-500',
  variant = 'default',
  className,
  size = 'md'
}: GradientBadgeProps) {
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  if (variant === 'outline') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'border-transparent bg-gradient-to-r text-white border-white/30 hover:shadow-lg',
          gradient,
          sizeClasses[size],
          className
        )}
      >
        {children}
      </Badge>
    );
  }

  return (
    <Badge 
      className={cn(
        'border-transparent bg-gradient-to-r text-white hover:shadow-lg transition-all duration-200',
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Badge>
  );
}