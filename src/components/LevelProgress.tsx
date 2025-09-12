import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Zap } from 'lucide-react';

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNext: number;
  levelProgress: number; // 0-100
  recentGain?: number;
  showLevelUp?: boolean;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentLevel,
  currentXP,
  xpToNext,
  levelProgress,
  recentGain = 0,
  showLevelUp = false
}) => {
  return (
    <Card className={`transition-all duration-300 ${showLevelUp ? 'shadow-glow animate-pulse' : 'shadow-soft'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-lg">Nível {currentLevel}</span>
            </div>
            {showLevelUp && (
              <Badge variant="default" className="animate-bounce bg-gradient-primary">
                <TrendingUp className="w-3 h-3 mr-1" />
                SUBIU!
              </Badge>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {currentXP} / {xpToNext} XP
            </div>
            {recentGain > 0 && (
              <div className="text-xs text-green-600 font-medium animate-fade-in">
                <Zap className="w-3 h-3 inline mr-1" />
                +{recentGain} XP
              </div>
            )}
          </div>
        </div>
        
        <Progress 
          value={levelProgress} 
          className="h-3 mb-2"
        />
        
        <div className="text-xs text-center text-muted-foreground">
          {Math.round(levelProgress)}% para o próximo nível
        </div>
      </CardContent>
    </Card>
  );
};