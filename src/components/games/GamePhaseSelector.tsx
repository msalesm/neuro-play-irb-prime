import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Star, Trophy, Zap, Target, CheckCircle2 } from 'lucide-react';
import { GamePhase } from '@/types/game-phase';

interface GamePhaseSelectorProps {
  phases: GamePhase[];
  currentPhase: number;
  onPhaseSelect: (phase: GamePhase) => void;
}

export const GamePhaseSelector: React.FC<GamePhaseSelectorProps> = ({
  phases,
  currentPhase,
  onPhaseSelect
}) => {
  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-blue-500',
      3: 'bg-yellow-500',
      4: 'bg-orange-500',
      5: 'bg-red-500'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Iniciante',
      2: 'Fácil',
      3: 'Médio',
      4: 'Difícil',
      5: 'Mestre'
    };
    return labels[difficulty as keyof typeof labels] || 'Desconhecido';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {phases.map((phase) => {
        const isCurrentPhase = phase.phaseNumber === currentPhase;
        const canPlay = !phase.isLocked;

        return (
          <Card
            key={phase.id}
            className={`
              relative overflow-hidden transition-all duration-300
              ${isCurrentPhase ? 'ring-2 ring-primary shadow-glow' : ''}
              ${phase.isLocked ? 'opacity-60' : 'hover:scale-[1.02] hover:shadow-lg cursor-pointer'}
              ${phase.isCompleted ? 'border-accent' : ''}
            `}
            onClick={() => canPlay && onPhaseSelect(phase)}
          >
            {/* Difficulty Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge
                className={`${getDifficultyColor(phase.difficulty)} text-white`}
              >
                {getDifficultyLabel(phase.difficulty)}
              </Badge>
            </div>

            {/* Lock/Complete Badge */}
            {phase.isLocked && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Bloqueado
                </Badge>
              </div>
            )}
            {phase.isCompleted && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="gap-1 bg-accent text-accent-foreground">
                  <Trophy className="w-3 h-3" />
                  Concluído
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {phase.phaseNumber}
                  </div>
                  {isCurrentPhase && (
                    <Badge variant="outline" className="gap-1">
                      <Zap className="w-3 h-3" />
                      Atual
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{phase.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {phase.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stars */}
              {phase.stars > 0 && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= phase.stars
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Objectives */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Objetivos
                </p>
                <ul className="space-y-1">
                  {phase.objectives.slice(0, 3).map((objective, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-1">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewards Preview */}
              <div className="flex items-center justify-between text-xs bg-muted rounded-lg p-2">
                <span className="text-muted-foreground">Recompensas:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {phase.rewards.xp} XP
                  </Badge>
                  {phase.rewards.badge && (
                    <Badge variant="outline" className="text-xs">
                      🏆 Badge
                    </Badge>
                  )}
                </div>
              </div>

              {/* Best Score */}
              {phase.bestScore && (
                <div className="text-xs text-muted-foreground">
                  Melhor: {phase.bestScore} pontos
                </div>
              )}

              {/* Unlock Requirement */}
              {phase.isLocked && phase.unlockRequirement && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <Lock className="w-3 h-3 inline mr-1" />
                  {phase.unlockRequirement.minStars && (
                    <>Complete a fase anterior com {phase.unlockRequirement.minStars} estrela(s)</>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Button
                className="w-full"
                disabled={phase.isLocked}
                onClick={() => canPlay && onPhaseSelect(phase)}
              >
                {phase.isLocked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Bloqueado
                  </>
                ) : phase.isCompleted ? (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Jogar Novamente
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {isCurrentPhase ? 'Continuar' : 'Jogar'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
