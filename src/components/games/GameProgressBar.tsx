import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameProgressBarProps {
  current: number;
  total: number;
  showSteps?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning';
}

export const GameProgressBar: React.FC<GameProgressBarProps> = ({
  current,
  total,
  showSteps = true,
  showPercentage = false,
  label = 'Progresso',
  className,
  variant = 'default'
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  const isComplete = current >= total;

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-success/20',
          fill: 'bg-success',
          text: 'text-success'
        };
      case 'warning':
        return {
          bg: 'bg-warning/20',
          fill: 'bg-warning',
          text: 'text-warning'
        };
      default:
        return {
          bg: 'bg-primary/20',
          fill: 'bg-primary',
          text: 'text-primary'
        };
    }
  };

  const colors = getVariantColors();

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete && <Star className="w-4 h-4 text-warning fill-warning" />}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {showSteps && (
            <Badge variant="outline" className="text-xs">
              {current}/{total}
            </Badge>
          )}
          {showPercentage && (
            <span className={cn("text-sm font-semibold", colors.text)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className={cn("h-2 rounded-full overflow-hidden", colors.bg)}>
          <div 
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              colors.fill,
              isComplete && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Step indicators */}
        {showSteps && total <= 10 && (
          <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
            {Array.from({ length: total }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  index < current
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : "bg-background border-muted scale-90"
                )}
              >
                {index < current ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Circle className="w-2 h-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion message */}
      {isComplete && (
        <p className="text-xs text-center text-success font-semibold animate-fade-in">
          🎉 Completo!
        </p>
      )}
    </div>
  );
};
