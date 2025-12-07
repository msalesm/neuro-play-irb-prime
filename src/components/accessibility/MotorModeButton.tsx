import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface MotorModeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  children: React.ReactNode;
}

// Button optimized for users with motor difficulties
export const MotorModeButton = forwardRef<HTMLButtonElement, MotorModeButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const { profile } = useAccessibility();
    
    const baseStyles = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      'select-none touch-manipulation',
    );

    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      outline: 'border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
      ghost: 'text-foreground hover:bg-muted active:bg-muted/80',
    };

    // Motor mode sizes are larger by default
    const sizeStyles = {
      sm: 'min-h-12 min-w-12 px-4 py-3 text-sm gap-2',
      default: 'min-h-14 min-w-14 px-6 py-4 text-base gap-3',
      lg: 'min-h-16 min-w-16 px-8 py-5 text-lg gap-3',
      xl: 'min-h-20 min-w-20 px-10 py-6 text-xl gap-4',
    };

    // Apply touch target size from accessibility profile
    const touchTargetStyle = {
      minHeight: `${Math.max(profile.touchTargetSizePx, 48)}px`,
      minWidth: `${Math.max(profile.touchTargetSizePx, 48)}px`,
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        style={touchTargetStyle}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MotorModeButton.displayName = 'MotorModeButton';
