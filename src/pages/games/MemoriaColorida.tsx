import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGameSession } from '@/hooks/useGameSession';
import { useGameHistory } from '@/hooks/useGameHistory';
import { GameExitButton } from '@/components/games';
import { simonSoundEngine, SimonColor } from "@/lib/simonSounds";
import { hapticsEngine } from "@/lib/haptics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface GameStats {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  totalAttempts: number;
  perfectRounds: number;
  highScore: number;
}

const COLORS: SimonColor[] = ['red', 'blue', 'green', 'yellow'];

const COLOR_STYLES: Record<SimonColor, { bg: string; active: string; ring: string; label: string }> = {
  red: { bg: 'bg-destructive/70', active: 'bg-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.6)]', ring: 'ring-destructive', label: 'Vermelho' },
  blue: { bg: 'bg-info/70', active: 'bg-info shadow-[0_0_30px_hsl(var(--info)/0.6)]', ring: 'ring-info', label: 'Azul' },
  green: { bg: 'bg-success/70', active: 'bg-success shadow-[0_0_30px_hsl(var(--success)/0.6)]', ring: 'ring-success', label: 'Verde' },
  yellow: { bg: 'bg-warning/70', active: 'bg-warning shadow-[0_0_30px_hsl(var(--warning)/0.6)]', ring: 'ring-warning', label: 'Amarelo' },
};

export default function MemoriaColorida() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameOver'>('idle');
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  const reactionStartRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);

  const {
    sessionId, startSession, endSession, updateSession, isActive,
    recoveredSession, resumeSession, discardRecoveredSession
  } = useGameSession('memoria-colorida', childProfileId || undefined);

  const { evolution, getTrend, totalSessions } = useGameHistory('memoria-colorida', childProfileId);

  useEffect(() => {
    const loadChildProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('child_profiles').select('id')
        .eq('parent_user_id', user.id).limit(1).maybeSingle();
      if (data) setChildProfileId(data.id);
    };
    loadChildProfile();
  }, [user]);

  const [sequence, setSequence] = useState<SimonColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<SimonColor[]>([]);
  const [stats, setStats] = useState<GameStats>({
    level: 1, score: 0, streak: 0, bestStreak: 0,
    correctAnswers: 0, totalAttempts: 0, perfectRounds: 0, highScore: 0,
  });
  const [showingColor, setShowingColor] = useState<SimonColor | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1000);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => { simonSoundEngine.setEnabled(soundEnabled); }, [soundEnabled]);
  useEffect(() => { return () => { simonSoundEngine.dispose(); }; }, []);

  useEffect(() => {
    const saved = localStorage.getItem('simon_high_score');
    if (saved) setStats(prev => ({ ...prev, highScore: parseInt(saved) }));
  }, []);

  const playSequence = useCallback((seq: SimonColor[]) => {
    let index = 0;
    const showNext = () => {
      if (index < seq.length) {
        setShowingColor(seq[index]);
        simonSoundEngine.playColorTone(seq[index], gameSpeed / 2000);
        setTimeout(() => {
          setShowingColor(null);
          index++;
          if (index < seq.length) {
            setTimeout(showNext, 250);
          } else {
            setTimeout(() => {
              setGameState('playing');
              reactionStartRef.current = performance.now();
              toast.info("🎯 Sua vez!");
            }, 400);
          }
        }, gameSpeed / 2);
      }
    };
    setTimeout(showNext, 500);
  }, [gameSpeed]);

  const startGame = useCallback(async () => {
    reactionTimesRef.current = [];
    try {
      await startSession({ score: 0 }, stats.level);
    } catch (e) { console.error(e); }

    const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence([firstColor]);
    setPlayerSequence([]);
    setGameState('showing');
    setLastFeedback(null);
    playSequence([firstColor]);
  }, [stats.level, startSession, playSequence]);

  const handleColorClick = async (color: SimonColor) => {
    if (gameState !== 'playing') return;

    // Track reaction time
    const now = performance.now();
    const reactionTime = Math.round(now - reactionStartRef.current);
    reactionTimesRef.current.push(reactionTime);
    reactionStartRef.current = now;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    simonSoundEngine.playColorTone(color, 0.2);
    hapticsEngine.trigger('tap');

    if (color === sequence[playerSequence.length]) {
      if (newPlayerSequence.length === sequence.length) {
        setLastFeedback('correct');
        simonSoundEngine.playSuccessSound();
        hapticsEngine.trigger('success');

        const newStats = {
          ...stats,
          score: stats.score + (sequence.length * 10),
          streak: stats.streak + 1,
          bestStreak: Math.max(stats.bestStreak, stats.streak + 1),
          correctAnswers: stats.correctAnswers + 1,
          totalAttempts: stats.totalAttempts + 1,
          level: stats.level + 1,
          perfectRounds: stats.perfectRounds + 1,
        };
        setStats(newStats);

        if (newStats.score > newStats.highScore) {
          setStats(prev => ({ ...prev, highScore: newStats.score }));
          localStorage.setItem('simon_high_score', newStats.score.toString());
        }

        const avgReaction = reactionTimesRef.current.length > 0
          ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;

        await updateSession({
          score: newStats.score,
          correctMoves: newStats.correctAnswers,
          totalMoves: newStats.totalAttempts,
          reactionTimes: reactionTimesRef.current,
          avgReactionTime: avgReaction,
        });

        if (newStats.level > 3 && newStats.level % 3 === 0) {
          setGameSpeed(prev => Math.max(400, prev - 100));
        }
        if (newStats.level % 5 === 0) simonSoundEngine.playVictoryFanfare();
        if (newStats.level % 5 === 0) hapticsEngine.trigger('achievement');

        setTimeout(() => {
          setLastFeedback(null);
          const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          const nextSeq = [...sequence, nextColor];
          setSequence(nextSeq);
          setPlayerSequence([]);
          setGameState('showing');
          playSequence(nextSeq);
        }, 1200);
      }
    } else {
      setLastFeedback('wrong');
      simonSoundEngine.playErrorSound();
      hapticsEngine.trigger('error');

      const finalStats = { ...stats, streak: 0, totalAttempts: stats.totalAttempts + 1 };
      setStats(finalStats);

      const avgReaction = reactionTimesRef.current.length > 0
        ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;

      await endSession({
        score: finalStats.score,
        correctMoves: finalStats.correctAnswers,
        totalMoves: finalStats.totalAttempts,
        accuracy: finalStats.totalAttempts > 0 ? (finalStats.correctAnswers / finalStats.totalAttempts) * 100 : 0,
        avgReactionTime: avgReaction,
        reactionTimes: reactionTimesRef.current,
        timeSpent: 0,
      });
      setGameState('gameOver');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setSequence([]);
    setPlayerSequence([]);
    setShowingColor(null);
    setLastFeedback(null);
    setStats(prev => ({
      level: 1, score: 0, streak: 0, bestStreak: prev.bestStreak,
      correctAnswers: 0, totalAttempts: 0, perfectRounds: 0, highScore: prev.highScore,
    }));
    setGameSpeed(1000);
    reactionTimesRef.current = [];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-muted-foreground">Faça login para jogar.</p>
            <Button asChild><a href="/auth">Login</a></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0;
  const avgReaction = reactionTimesRef.current.length > 0
    ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <GameExitButton
          variant="quit"
          onExit={async () => { if (isActive) await endSession({ quitReason: 'user_quit' }); }}
          showProgress={gameState === 'playing'}
          currentProgress={playerSequence.length}
          totalProgress={sequence.length}
        />
        <h1 className="text-lg font-bold">🎨 Simon Says</h1>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Nível', value: stats.level, color: 'text-info' },
          { label: 'Pontos', value: stats.score, color: 'text-success' },
          { label: 'Série', value: stats.streak, color: 'text-warning' },
          { label: 'Precisão', value: `${accuracy}%`, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="text-center bg-card rounded-xl p-2 border border-border">
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Clinical Metric: Reaction Time */}
      {gameState !== 'idle' && avgReaction > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Tempo médio de reação: <strong className="text-foreground">{avgReaction}ms</strong></span>
        </div>
      )}

      {/* Game Area */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 text-center space-y-5"
              >
                <div className="text-5xl">🧠</div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Memória Colorida</h2>
                  <p className="text-sm text-muted-foreground">Observe e repita a sequência de cores</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { icon: '👀', text: 'Observe a sequência' },
                    { icon: '🎯', text: 'Repita na ordem' },
                    { icon: '⚡', text: 'Cada nível, +1 cor' },
                    { icon: '🏆', text: 'Bata seu recorde!' },
                  ].map(tip => (
                    <div key={tip.text} className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
                      <span className="text-lg">{tip.icon}</span>
                      <span className="text-muted-foreground text-xs">{tip.text}</span>
                    </div>
                  ))}
                </div>

                {stats.highScore > 0 && (
                  <div className="text-sm text-muted-foreground">
                    🏅 Recorde: <strong className="text-warning">{stats.highScore}</strong>
                  </div>
                )}

                <Button onClick={() => { simonSoundEngine.setEnabled(true); startGame(); }}
                  size="lg" className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Começar
                </Button>
              </motion.div>
            )}

            {(gameState === 'showing' || gameState === 'playing') && (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 space-y-4"
              >
                {/* Sequence progress dots */}
                <div className="flex items-center justify-center gap-1.5">
                  {sequence.map((_, i) => (
                    <div key={i} className={cn(
                      "h-2 rounded-full transition-all",
                      i < playerSequence.length ? "w-6 bg-success" :
                      i === playerSequence.length && gameState === 'playing' ? "w-4 bg-primary animate-pulse" :
                      "w-2 bg-muted"
                    )} />
                  ))}
                </div>

                <div className="text-center text-xs font-medium text-muted-foreground">
                  {gameState === 'showing' ? '👀 Observe...' : `Sua vez! ${playerSequence.length}/${sequence.length}`}
                </div>

                {/* Simon Grid - Full width mobile touch targets */}
                <div className="grid grid-cols-2 gap-3 aspect-square max-w-[340px] mx-auto">
                  {COLORS.map(color => {
                    const style = COLOR_STYLES[color];
                    const isActive = showingColor === color;
                    const isDisabled = gameState !== 'playing';
                    return (
                      <motion.button
                        key={color}
                        whileTap={!isDisabled ? { scale: 0.92 } : undefined}
                        className={cn(
                          "rounded-2xl transition-all duration-150 flex items-center justify-center min-h-[120px]",
                          isActive ? style.active : style.bg,
                          !isDisabled && "active:brightness-125 cursor-pointer",
                          isDisabled && gameState === 'showing' && "cursor-default",
                        )}
                        disabled={isDisabled}
                        onClick={() => handleColorClick(color)}
                        aria-label={style.label}
                      >
                        <span className={cn(
                          "text-3xl transition-transform",
                          isActive && "scale-125"
                        )}>
                          {color === 'red' ? '🔴' : color === 'blue' ? '🔵' : color === 'green' ? '🟢' : '🟡'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Feedback flash */}
                {lastFeedback && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "text-center text-sm font-bold py-2 rounded-xl",
                      lastFeedback === 'correct' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {lastFeedback === 'correct' ? '✅ Perfeito!' : '❌ Errou!'}
                  </motion.div>
                )}
              </motion.div>
            )}

            {gameState === 'gameOver' && (
              <motion.div
                key="over"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-5"
              >
                <div className="text-5xl">{stats.score === stats.highScore && stats.score > 0 ? '🏆' : '🎮'}</div>
                <h2 className="text-2xl font-bold">Game Over!</h2>

                {stats.score === stats.highScore && stats.score > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block bg-warning/10 text-warning px-4 py-1.5 rounded-full text-sm font-bold"
                  >
                    🏅 Novo Recorde!
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nível', value: stats.level, icon: '🎯' },
                    { label: 'Pontos', value: stats.score, icon: '⭐' },
                    { label: 'Melhor Série', value: stats.bestStreak, icon: '🔥' },
                    { label: 'Precisão', value: `${accuracy}%`, icon: '🎯' },
                    { label: 'Reação Média', value: avgReaction > 0 ? `${avgReaction}ms` : '—', icon: '⚡' },
                    { label: 'Tentativas', value: stats.totalAttempts, icon: '🔄' },
                  ].map(s => (
                    <div key={s.label} className="p-3 bg-muted/50 rounded-xl">
                      <div className="text-lg font-bold">{s.icon} {s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={startGame} className="h-12 gap-2 rounded-xl font-bold">
                    <Play className="h-4 w-4 fill-current" /> Jogar
                  </Button>
                  <Button variant="outline" onClick={resetGame} className="h-12 gap-2 rounded-xl">
                    <RotateCcw className="h-4 w-4" /> Menu
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Therapeutic Benefits - Compact */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '🧠', label: 'Memória', desc: 'de Trabalho' },
          { icon: '🎯', label: 'Atenção', desc: 'Sequencial' },
          { icon: '⚡', label: 'Controle', desc: 'Inibitório' },
        ].map(b => (
          <div key={b.label} className="p-3 bg-card rounded-xl border border-border">
            <div className="text-xl mb-1">{b.icon}</div>
            <div className="text-xs font-semibold">{b.label}</div>
            <div className="text-[10px] text-muted-foreground">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
