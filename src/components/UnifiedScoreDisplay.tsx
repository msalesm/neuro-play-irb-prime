import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Zap, Coins, TrendingUp, Trophy } from 'lucide-react';

interface ScoreData {
  xp: number;
  xpGained?: number;
  level: number;
  levelProgress: number;
  stars: number;
  coins: number;
  accuracy?: number;
  timeBonus?: number;
  difficultyMultiplier?: number;
}

interface UnifiedScoreDisplayProps {
  scoreData: ScoreData;
  showAnimation?: boolean;
  detailed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UnifiedScoreDisplay({ 
  scoreData, 
  showAnimation = false, 
  detailed = true,
  size = 'md' 
}: UnifiedScoreDisplayProps) {
  const [animatedXP, setAnimatedXP] = useState(scoreData.xp - (scoreData.xpGained || 0));
  const [showXPGain, setShowXPGain] = useState(false);

  useEffect(() => {
    if (showAnimation && scoreData.xpGained) {
      setShowXPGain(true);
      const timer = setTimeout(() => {
        setAnimatedXP(scoreData.xp);
        setTimeout(() => setShowXPGain(false), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, scoreData.xpGained, scoreData.xp]);

  const sizeClasses = {
    sm: 'text-sm p-3',
    md: 'text-base p-4',
    lg: 'text-lg p-6'
  };

  const getLevelName = (level: number) => {
    if (level <= 1) return 'Iniciante';
    if (level <= 3) return 'Praticante';
    if (level <= 5) return 'Hábil';
    if (level <= 7) return 'Expert';
    return 'Mestre';
  };

  const getLevelColor = (level: number) => {
    if (level <= 1) return 'text-muted-foreground';
    if (level <= 3) return 'text-blue-500';
    if (level <= 5) return 'text-green-500';
    if (level <= 7) return 'text-purple-500';
    return 'text-yellow-500';
  };

  return (
    <Card className="shadow-card">
      <CardContent className={sizeClasses[size]}>
        <div className="space-y-4">
          {/* Level and XP Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${getLevelColor(scoreData.level)}`} />
              <div>
                <div className="font-semibold">Nível {scoreData.level}</div>
                <div className={`text-xs ${getLevelColor(scoreData.level)}`}>
                  {getLevelName(scoreData.level)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">{animatedXP} XP</span>
                {showXPGain && scoreData.xpGained && (
                  <Badge variant="secondary" className="animate-bounce">
                    +{scoreData.xpGained} XP
                  </Badge>
                )}
              </div>
              {detailed && (
                <div className="text-xs text-muted-foreground">
                  Experiência de aprendizado
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={scoreData.levelProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso do nível</span>
              <span>{Math.round(scoreData.levelProgress)}%</span>
            </div>
          </div>

          {detailed && (
            <>
              {/* Stars and Coins */}
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{scoreData.stars}</span>
                  <span className="text-xs text-muted-foreground">Conquistas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{scoreData.coins}</span>
                  <span className="text-xs text-muted-foreground">Moedas</span>
                </div>
              </div>

              {/* Performance Details */}
              {(scoreData.accuracy || scoreData.timeBonus || scoreData.difficultyMultiplier) && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  {scoreData.accuracy && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">
                        {scoreData.accuracy}%
                      </div>
                      <div className="text-xs text-muted-foreground">Precisão</div>
                    </div>
                  )}
                  {scoreData.timeBonus && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-blue-600">
                        +{scoreData.timeBonus}
                      </div>
                      <div className="text-xs text-muted-foreground">Tempo</div>
                    </div>
                  )}
                  {scoreData.difficultyMultiplier && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-purple-600">
                        x{scoreData.difficultyMultiplier}
                      </div>
                      <div className="text-xs text-muted-foreground">Dificuldade</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}