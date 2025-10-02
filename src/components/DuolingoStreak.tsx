import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuolingoStreakProps {
  currentStreak: number;
  longestStreak: number;
  streakGoal?: number;
  className?: string;
}

export const DuolingoStreak: React.FC<DuolingoStreakProps> = ({
  currentStreak,
  longestStreak,
  streakGoal = 7,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentStreak > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  const progress = Math.min((currentStreak / streakGoal) * 100, 100);
  const isOnFire = currentStreak >= 3;
  const isNewRecord = currentStreak === longestStreak && currentStreak > 0;

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all duration-300",
      isOnFire ? "border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-red-500/10" : "border-muted",
      className
    )}>
      {/* Background glow effect */}
      {isOnFire && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 animate-pulse" />
      )}

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
              isOnFire 
                ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/50" 
                : "bg-muted"
            )}>
              <Flame 
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isOnFire ? "text-white animate-pulse" : "text-muted-foreground",
                  isAnimating && "scale-125"
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">
                  {currentStreak}
                </h3>
                {isOnFire && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Em Chamas!
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentStreak === 0 ? 'Comece sua sequência hoje!' : `dia${currentStreak > 1 ? 's' : ''} consecutivo${currentStreak > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {isNewRecord && (
            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/50 text-yellow-600">
              <Award className="w-3 h-3 mr-1" />
              Novo Recorde!
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Meta: {streakGoal} dias</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isOnFire 
                  ? "bg-gradient-to-r from-orange-500 to-red-500" 
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <div>
              <p className="font-semibold">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">Maior sequência</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-purple-500" />
            <div>
              <p className="font-semibold">{Math.max(0, streakGoal - currentStreak)}</p>
              <p className="text-xs text-muted-foreground">Dias para meta</p>
            </div>
          </div>
        </div>

        {/* Motivational messages */}
        {currentStreak > 0 && (
          <div className="pt-2 border-t border-muted">
            <p className="text-xs text-center text-muted-foreground italic">
              {currentStreak >= 7 && "🎉 Incrível! Você está dominando!"}
              {currentStreak >= 3 && currentStreak < 7 && "🔥 Continue assim! Está indo muito bem!"}
              {currentStreak >= 1 && currentStreak < 3 && "💪 Ótimo começo! Mantenha o ritmo!"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
