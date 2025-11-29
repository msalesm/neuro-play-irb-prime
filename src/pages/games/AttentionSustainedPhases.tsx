import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Star } from 'lucide-react';
import { GamePhaseSelector } from '@/components/GamePhaseSelector';
import { attentionSustainedPhases } from '@/data/game-phases/attention-sustained-phases';
import { useGamePhaseProgress } from '@/hooks/useGamePhaseProgress';
import type { GamePhase } from '@/types/game-phase';

export default function AttentionSustainedPhases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const childProfileId = searchParams.get('childProfileId');
  
  const { progress, isLoading, unlockPhase } = useGamePhaseProgress('attention-sustained', childProfileId || undefined);
  const [phases, setPhases] = useState<GamePhase[]>(attentionSustainedPhases);

  useEffect(() => {
    if (progress) {
      const updatedPhases = unlockPhase(attentionSustainedPhases).map(phase => ({
        ...phase,
        isCompleted: progress.phases[phase.id]?.completed || false,
        stars: progress.phases[phase.id]?.stars || 0,
        bestScore: progress.phases[phase.id]?.bestScore
      }));
      setPhases(updatedPhases);
    }
  }, [progress, unlockPhase]);

  const handlePhaseSelect = (phase: GamePhase) => {
    const params = new URLSearchParams();
    params.append('phaseId', phase.id);
    if (childProfileId) {
      params.append('childProfileId', childProfileId);
    }
    navigate(`/games/attention-sustained-play?${params.toString()}`);
  };

  const totalStars = phases.reduce((sum, phase) => sum + phase.stars, 0);
  const maxStars = phases.length * 3;
  const completedPhases = phases.filter(p => p.isCompleted).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">⏱️ Missão Cronometrada</h1>
          <p className="text-muted-foreground mb-4">
            Complete tarefas mantendo foco por períodos crescentes
          </p>

          {/* Progress Summary */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{completedPhases}/{phases.length}</div>
                <div className="text-sm text-muted-foreground">Fases Completas</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  {totalStars}/{maxStars}
                </div>
                <div className="text-sm text-muted-foreground">Estrelas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{progress?.totalXP || 0}</div>
                <div className="text-sm text-muted-foreground">XP Total</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Phase Selector */}
      <GamePhaseSelector
        phases={phases}
        currentPhase={progress?.currentPhase ? parseInt(progress.currentPhase.split('-')[2]) : 1}
        onPhaseSelect={handlePhaseSelect}
      />

      {/* Info Card */}
      <Card className="mt-6 p-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Sistema de Estrelas
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>⭐ 1 Estrela: Completar a fase</p>
          <p>⭐⭐ 2 Estrelas: Atingir 80% de precisão</p>
          <p>⭐⭐⭐ 3 Estrelas: Atingir 90% de precisão</p>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm">
            <strong>Desbloqueio de Fases:</strong> Cada fase requer estrelas mínimas da fase anterior para ser desbloqueada.
          </p>
        </div>
      </Card>
    </div>
  );
}
