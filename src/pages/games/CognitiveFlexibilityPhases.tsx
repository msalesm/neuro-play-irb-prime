import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Star, Zap } from 'lucide-react';
import { GamePhaseSelector } from '@/components/GamePhaseSelector';
import { useGamePhaseProgress } from '@/hooks/useGamePhaseProgress';
import { cognitiveFlexibilityPhases } from '@/data/game-phases/cognitive-flexibility-phases';
import { GamePhase } from '@/types/game-phase';

export default function CognitiveFlexibilityPhases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const childProfileId = searchParams.get('childProfileId') || undefined;

  const { progress, isLoading, unlockPhase } = useGamePhaseProgress(
    'cognitive-flexibility',
    childProfileId
  );

  const [phases, setPhases] = useState<GamePhase[]>(cognitiveFlexibilityPhases);

  useEffect(() => {
    if (progress) {
      // Update phases with progress data
      const updatedPhases = cognitiveFlexibilityPhases.map(phase => {
        const phaseProgress = progress.phases[phase.id];
        return {
          ...phase,
          isCompleted: phaseProgress?.completed || false,
          stars: phaseProgress?.stars || 0,
          bestScore: phaseProgress?.bestScore
        };
      });

      // Apply unlock logic
      const unlockedPhases = unlockPhase(updatedPhases);
      setPhases(unlockedPhases);
    }
  }, [progress]);

  const handlePhaseSelect = (phase: GamePhase) => {
    if (phase.isLocked) return;
    
    // Navigate to actual game with phase configuration
    navigate(`/games/cognitive-flexibility-play?phase=${phase.id}${childProfileId ? `&childProfileId=${childProfileId}` : ''}`);
  };

  const totalStars = phases.reduce((sum, phase) => sum + phase.stars, 0);
  const maxStars = phases.length * 3;
  const completedPhases = phases.filter(p => p.isCompleted).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando fases...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-playful bg-clip-text text-transparent mb-2">
            🔄 Flexibilidade Cognitiva
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Domine a arte da adaptação mental através de 6 fases progressivas
          </p>

          {/* Overall Progress */}
          <Card className="max-w-3xl mx-auto mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {completedPhases}/{phases.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Fases Completas</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-bold text-yellow-600">
                      {totalStars}/{maxStars}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Estrelas Coletadas</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">
                    {progress?.totalXP || 0} XP
                  </div>
                  <div className="text-sm text-muted-foreground">Experiência Total</div>
                </div>
              </div>

              <div className="mt-6">
                <Progress 
                  value={(completedPhases / phases.length) * 100} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phase Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Fases Disponíveis</h2>
          <Badge variant="outline" className="gap-1">
            <Zap className="w-4 h-4" />
            Fase Atual: {progress?.currentPhase || 1}
          </Badge>
        </div>

        <GamePhaseSelector
          phases={phases}
          currentPhase={parseInt(progress?.currentPhase || '1')}
          onPhaseSelect={handlePhaseSelect}
        />
      </div>

      {/* Legend */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Sistema de Progressão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold">⭐ Estrelas por Precisão:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 1 ⭐ - 70-79% de acertos</li>
                <li>• 2 ⭐ - 80-89% de acertos</li>
                <li>• 3 ⭐ - 90%+ de acertos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">🔓 Desbloqueio de Fases:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Complete a fase anterior</li>
                <li>• Alcance estrelas mínimas</li>
                <li>• Cumpra todos os objetivos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
