import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicSequenceGame } from '@/components/CosmicSequenceGame';
import { GameExitButton } from '@/components/GameExitButton';
import { useGameSession } from '@/hooks/useGameSession';
import { Brain, Target, Sparkles, Zap } from 'lucide-react';

export default function CosmicSequence() {
  const navigate = useNavigate();
  const childProfileId = localStorage.getItem('selectedChildProfile');
  
  const {
    startSession,
    endSession,
    updateSession,
    recordMetric,
  } = useGameSession('cosmic-sequence', childProfileId || undefined);

  const [totalTaps, setTotalTaps] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleGameStart = async () => {
    await startSession({ score: 0 });
    setTotalTaps(0);
    setCorrectTaps(0);
    setWrongTaps(0);
    setReactionTimes([]);
    setLastTapTime(Date.now());
  };

  const handleCorrectTap = () => {
    const now = Date.now();
    const reactionTime = lastTapTime > 0 ? now - lastTapTime : 0;
    
    setCorrectTaps(prev => prev + 1);
    setTotalTaps(prev => prev + 1);
    
    if (reactionTime > 0 && reactionTime < 5000) {
      setReactionTimes(prev => [...prev, reactionTime]);
      recordMetric({
        eventType: 'correct_tap',
        reactionTimeMs: reactionTime,
        eventData: { correct: true },
      });
    }
    
    setLastTapTime(now);
  };

  const handleWrongTap = () => {
    setWrongTaps(prev => prev + 1);
    setTotalTaps(prev => prev + 1);
    
    recordMetric({
      eventType: 'wrong_tap',
      eventData: { correct: false },
    });
  };

  const handleGameEnd = async (finalScore: number, round: number) => {
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    const accuracy = totalTaps > 0 ? (correctTaps / totalTaps) * 100 : 0;

    await endSession({
      score: finalScore,
      accuracy,
      reactionTimes: reactionTimes,
      correctMoves: correctTaps,
      totalMoves: totalTaps,
    });

    // Store metrics for potential display
    recordMetric({
      eventType: 'game_complete',
      eventData: {
        finalScore,
        round,
        totalTaps,
        correctTaps,
        wrongTaps,
        accuracy: accuracy.toFixed(1),
        avgReactionTime: Math.round(avgReactionTime),
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 left-4 z-10">
        <GameExitButton returnTo="/games" />
      </div>

      {/* Game Info Header */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 max-w-xs">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Sequência Cósmica
        </h2>
        <p className="text-sm text-gray-300 mb-3">
          Jogo de memória e sequenciamento para fortalecer atenção visual e padrões.
        </p>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <span>Observe a sequência de cores</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Repita na ordem correta</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Dificuldade aumenta a cada rodada</span>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative z-0 h-screen flex items-center justify-center">
        <CosmicSequenceGame
          onGameStart={handleGameStart}
          onGameEnd={handleGameEnd}
          onCorrectTap={handleCorrectTap}
          onWrongTap={handleWrongTap}
        />
      </div>

      {/* Mobile Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:hidden">
        <div className="bg-black/70 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2">
          <p className="text-sm text-white text-center">
            Toque nos botões para repetir a sequência
          </p>
        </div>
      </div>
    </div>
  );
}
