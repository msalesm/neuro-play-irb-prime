import { memo } from 'react';
import { cn } from '@/lib/utils';

interface EmotionalEnergyBarProps {
  energy: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export const EmotionalEnergyBar = memo<EmotionalEnergyBarProps>(({ 
  energy, 
  className, 
  showLabel = false 
}) => {
  const getEnergyColor = () => {
    if (energy <= 30) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (energy <= 70) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    return 'bg-gradient-to-r from-orange-500 to-red-500';
  };

  const getEnergyState = () => {
    if (energy <= 30) return 'Calmo';
    if (energy <= 70) return 'Ativado';
    return 'Agitado';
  };

  const shouldPulse = energy > 70;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground min-w-[60px]">
          {getEnergyState()}
        </span>
      )}
      
      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden shadow-inner">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            getEnergyColor(),
            shouldPulse && "animate-pulse"
          )}
          style={{ width: `${Math.min(energy, 100)}%` }}
        />
      </div>
      
      {showLabel && (
        <span className="text-xs text-muted-foreground min-w-[30px]">
          {Math.round(energy)}%
        </span>
      )}
    </div>
  );
});

EmotionalEnergyBar.displayName = 'EmotionalEnergyBar';