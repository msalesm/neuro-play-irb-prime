import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGameSession } from '@/hooks/useGameSession';
import { GameExitButton } from '@/components/games';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

type BeatType = 'kick' | 'snare' | 'hihat' | 'crash';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Beat {
  id: string;
  type: BeatType;
  time: number;
  played: boolean;
}

interface GameStats {
  level: number;
  score: number;
  accuracy: number;
  perfectHits: number;
  totalBeats: number;
  streak: number;
  bestStreak: number;
  totalRounds: number;
}

const BEAT_CONFIG: Record<BeatType, { emoji: string; name: string; color: string; activeColor: string }> = {
  kick:  { emoji: '🥁', name: 'Bumbo', color: 'bg-destructive/60', activeColor: 'bg-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.5)]' },
  snare: { emoji: '🪘', name: 'Caixa', color: 'bg-info/60', activeColor: 'bg-info shadow-[0_0_20px_hsl(var(--info)/0.5)]' },
  hihat: { emoji: '🎵', name: 'Chimbal', color: 'bg-warning/60', activeColor: 'bg-warning shadow-[0_0_20px_hsl(var(--warning)/0.5)]' },
  crash: { emoji: '💥', name: 'Prato', color: 'bg-secondary/60', activeColor: 'bg-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.5)]' },
};

const DIFFICULTY_SETTINGS = {
  easy:   { bpm: 40, beatsPerPattern: 2 },
  medium: { bpm: 60, beatsPerPattern: 3 },
  hard:   { bpm: 80, beatsPerPattern: 4 },
};

export default function RitmoMusical() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'listening' | 'playing' | 'feedback' | 'gameOver'>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [pattern, setPattern] = useState<Beat[]>([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(-1);
  const [playerBeats, setPlayerBeats] = useState<BeatType[]>([]);
  const [stats, setStats] = useState<GameStats>({
    level: 1, score: 0, accuracy: 100, perfectHits: 0,
    totalBeats: 0, streak: 0, bestStreak: 0, totalRounds: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastPad, setLastPad] = useState<BeatType | null>(null);
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  const reactionTimesRef = useRef<number[]>([]);
  const reactionStartRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const patternTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    startSession, endSession, updateSession, isActive
  } = useGameSession('ritmo-musical', childProfileId || undefined);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from('child_profiles').select('id')
        .eq('parent_user_id', user.id).limit(1).maybeSingle();
      if (data) setChildProfileId(data.id);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => { audioContextRef.current?.close(); };
  }, []);

  const playSound = useCallback((beatType: BeatType) => {
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (beatType === 'kick') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (beatType === 'snare') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); osc.start(); osc.stop(ctx.currentTime + 0.1);
      // noise layer
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.6, ctx.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      noise.connect(ng); ng.connect(ctx.destination);
      noise.start(); noise.stop(ctx.currentTime + 0.08);
    } else if (beatType === 'hihat') {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.setValueAtTime(7000, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      noise.connect(filter); filter.connect(gain);
      noise.start(); noise.stop(ctx.currentTime + 0.04);
    } else {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.setValueAtTime(3000, ctx.currentTime);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      noise.connect(filter); filter.connect(gain);
      noise.start(); noise.stop(ctx.currentTime + 0.3);
    }
  }, [soundEnabled]);

  const generatePattern = useCallback((diff: Difficulty, level: number): Beat[] => {
    const settings = DIFFICULTY_SETTINGS[diff];
    const beatTypes: BeatType[] = level >= 5 ? ['kick', 'snare', 'hihat', 'crash'] :
                                   level >= 3 ? ['kick', 'snare', 'hihat'] : ['kick', 'snare'];
    const interval = (60 / settings.bpm) * 1000;
    return Array.from({ length: settings.beatsPerPattern }, (_, i) => ({
      id: `beat-${i}`,
      type: beatTypes[i % beatTypes.length],
      time: i * interval,
      played: false,
    }));
  }, []);

  const playPattern = useCallback((beats: Beat[]) => {
    let i = 0;
    setCurrentBeatIndex(0);
    const playNext = () => {
      if (i < beats.length) {
        setCurrentBeatIndex(i);
        playSound(beats[i].type);
        const current = i;
        i++;
        const delay = i < beats.length ? beats[i].time - beats[current].time : 500;
        patternTimerRef.current = setTimeout(playNext, delay);
      } else {
        setCurrentBeatIndex(-1);
        setTimeout(() => {
          setGameState('playing');
          setPlayerBeats([]);
          reactionStartRef.current = performance.now();
        }, 600);
      }
    };
    setTimeout(playNext, 400);
  }, [playSound]);

  const startGame = useCallback(async () => {
    reactionTimesRef.current = [];
    try { await startSession({ score: 0 }, stats.level); } catch (e) { console.error(e); }
    const newPattern = generatePattern(difficulty, stats.level);
    setPattern(newPattern);
    setPlayerBeats([]);
    setCurrentBeatIndex(-1);
    setGameState('listening');
    setTimeout(() => playPattern(newPattern), 500);
  }, [difficulty, stats.level, generatePattern, playPattern, startSession]);

  const handlePadTap = (beatType: BeatType) => {
    if (gameState !== 'playing') return;
    playSound(beatType);
    setLastPad(beatType);
    setTimeout(() => setLastPad(null), 150);

    const rt = Math.round(performance.now() - reactionStartRef.current);
    reactionTimesRef.current.push(rt);
    reactionStartRef.current = performance.now();

    const newBeats = [...playerBeats, beatType];
    setPlayerBeats(newBeats);

    if (newBeats.length >= pattern.length) {
      evaluateRound(newBeats);
    }
  };

  const evaluateRound = (played: BeatType[]) => {
    const patternTypes = pattern.map(b => b.type);
    let hits = 0;
    for (let i = 0; i < Math.min(patternTypes.length, played.length); i++) {
      if (patternTypes[i] === played[i]) hits++;
    }
    const roundAccuracy = pattern.length > 0 ? (hits / pattern.length) * 100 : 0;
    const points = Math.round(hits * 10 * stats.level * (roundAccuracy / 100));

    const newStats = {
      ...stats,
      score: stats.score + points,
      perfectHits: stats.perfectHits + hits,
      totalBeats: stats.totalBeats + pattern.length,
      totalRounds: stats.totalRounds + 1,
      accuracy: ((stats.perfectHits + hits) / (stats.totalBeats + pattern.length)) * 100,
      streak: roundAccuracy >= 70 ? stats.streak + 1 : 0,
      bestStreak: Math.max(stats.bestStreak, roundAccuracy >= 70 ? stats.streak + 1 : stats.streak),
    };
    setStats(newStats);

    const avgReaction = reactionTimesRef.current.length > 0
      ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;

    if (isActive) {
      updateSession({
        score: newStats.score,
        accuracy: newStats.accuracy,
        correctMoves: newStats.perfectHits,
        totalMoves: newStats.totalBeats,
        avgReactionTime: avgReaction,
      });
    }

    setGameState('feedback');

    setTimeout(() => {
      // Level up logic
      if (newStats.streak >= 3 && newStats.totalRounds % 3 === 0) {
        const newLevel = stats.level + 1;
        setStats(prev => ({ ...prev, level: newLevel }));
        if (difficulty === 'easy' && newLevel >= 4) setDifficulty('medium');
        else if (difficulty === 'medium' && newLevel >= 7) setDifficulty('hard');
      }

      // Next round
      const nextPattern = generatePattern(difficulty, newStats.level);
      setPattern(nextPattern);
      setPlayerBeats([]);
      setCurrentBeatIndex(-1);
      setGameState('listening');
      setTimeout(() => playPattern(nextPattern), 500);
    }, 1500);
  };

  const endGame = async () => {
    const avgReaction = reactionTimesRef.current.length > 0
      ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;
    if (isActive) {
      await endSession({
        score: stats.score,
        accuracy: stats.accuracy,
        avgReactionTime: avgReaction,
        correctMoves: stats.perfectHits,
        totalMoves: stats.totalBeats,
      });
    }
    setGameState('gameOver');
  };

  const resetGame = () => {
    if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
    setGameState('idle');
    setPattern([]); setPlayerBeats([]);
    setDifficulty('easy');
    setStats({ level: 1, score: 0, accuracy: 100, perfectHits: 0, totalBeats: 0, streak: 0, bestStreak: 0, totalRounds: 0 });
    reactionTimesRef.current = [];
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.code === 'Space') { e.preventDefault(); handlePadTap('kick'); }
      else if (e.key === 's' || e.key === 'S') handlePadTap('snare');
      else if (e.key === 'h' || e.key === 'H') handlePadTap('hihat');
      else if (e.key === 'c' || e.key === 'C') handlePadTap('crash');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, playerBeats, pattern]);

  useEffect(() => { return () => { if (patternTimerRef.current) clearTimeout(patternTimerRef.current); }; }, []);

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

  const avgReaction = reactionTimesRef.current.length > 0
    ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length) : 0;
  const visibleBeats = stats.level >= 5 ? (['kick', 'snare', 'hihat', 'crash'] as BeatType[]) :
                        stats.level >= 3 ? (['kick', 'snare', 'hihat'] as BeatType[]) : (['kick', 'snare'] as BeatType[]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <GameExitButton variant="quit" onExit={endGame} showProgress={gameState === 'playing'} currentProgress={playerBeats.length} totalProgress={pattern.length} />
        <h1 className="text-lg font-bold">🎵 Ritmo Musical</h1>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Nível', value: stats.level, color: 'text-primary' },
          { label: 'Pontos', value: stats.score, color: 'text-success' },
          { label: 'Precisão', value: `${Math.round(stats.accuracy)}%`, color: 'text-info' },
          { label: 'Série', value: stats.streak, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="text-center bg-card rounded-xl p-2 border border-border">
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Clinical Metric */}
      {avgReaction > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Tempo de reação: <strong className="text-foreground">{avgReaction}ms</strong></span>
        </div>
      )}

      {/* Main Game */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 text-center space-y-5">
                <div className="text-5xl">🎵</div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Ritmo Musical</h2>
                  <p className="text-sm text-muted-foreground">Ouça e reproduza padrões rítmicos</p>
                </div>

                {/* Difficulty */}
                <div className="flex justify-center gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                    <Button key={d} size="sm" variant={difficulty === d ? 'default' : 'outline'} onClick={() => setDifficulty(d)} className="text-xs">
                      {d === 'easy' ? '🟢 Fácil' : d === 'medium' ? '🟡 Médio' : '🔴 Difícil'}
                    </Button>
                  ))}
                </div>

                <Button onClick={startGame} size="lg" className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
                  <Play className="h-5 w-5 fill-current" /> Começar
                </Button>
              </motion.div>
            )}

            {gameState === 'listening' && (
              <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-5">
                <div className="text-sm font-medium text-muted-foreground">🎧 Ouça o padrão...</div>
                <div className="flex justify-center gap-3">
                  {pattern.map((beat, i) => {
                    const cfg = BEAT_CONFIG[beat.type];
                    return (
                      <motion.div
                        key={beat.id}
                        animate={i === currentBeatIndex ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all",
                          i === currentBeatIndex ? cfg.activeColor : cfg.color
                        )}
                      >
                        {cfg.emoji}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {(gameState === 'playing' || gameState === 'feedback') && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
                {/* Target pattern */}
                <div className="flex justify-center gap-2">
                  {pattern.map((beat, i) => {
                    const cfg = BEAT_CONFIG[beat.type];
                    const matched = i < playerBeats.length && playerBeats[i] === beat.type;
                    const wrong = i < playerBeats.length && playerBeats[i] !== beat.type;
                    return (
                      <div key={beat.id} className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 transition-all",
                        matched ? "border-success bg-success/20" :
                        wrong ? "border-destructive bg-destructive/20" :
                        i === playerBeats.length ? "border-primary bg-primary/10 animate-pulse" :
                        "border-border bg-muted/30"
                      )}>
                        {cfg.emoji}
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  {gameState === 'feedback' ? '✅ Avaliando...' : `Toque! ${playerBeats.length}/${pattern.length}`}
                </div>

                {/* Drum Pads - Large touch targets */}
                <div className={cn(
                  "grid gap-3",
                  visibleBeats.length <= 2 ? "grid-cols-2" : "grid-cols-2"
                )}>
                  {visibleBeats.map(beatType => {
                    const cfg = BEAT_CONFIG[beatType];
                    const isActive = lastPad === beatType;
                    return (
                      <motion.button
                        key={beatType}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePadTap(beatType)}
                        disabled={gameState !== 'playing'}
                        className={cn(
                          "rounded-2xl p-5 flex flex-col items-center justify-center transition-all min-h-[100px]",
                          isActive ? cfg.activeColor : cfg.color,
                          gameState === 'playing' && "active:brightness-125 cursor-pointer",
                        )}
                      >
                        <span className="text-3xl mb-1">{cfg.emoji}</span>
                        <span className="text-xs font-medium text-white/90">{cfg.name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Progress */}
                <Progress value={(playerBeats.length / pattern.length) * 100} className="h-1.5" />
              </motion.div>
            )}

            {gameState === 'gameOver' && (
              <motion.div key="over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-5">
                <div className="text-5xl">🎶</div>
                <h2 className="text-xl font-bold">Sessão Concluída!</h2>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nível', value: stats.level, icon: '🎯' },
                    { label: 'Pontos', value: stats.score, icon: '⭐' },
                    { label: 'Precisão', value: `${Math.round(stats.accuracy)}%`, icon: '🎯' },
                    { label: 'Reação', value: avgReaction > 0 ? `${avgReaction}ms` : '—', icon: '⚡' },
                  ].map(s => (
                    <div key={s.label} className="p-3 bg-muted/50 rounded-xl">
                      <div className="text-lg font-bold">{s.icon} {s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => { resetGame(); startGame(); }} className="h-12 gap-2 rounded-xl font-bold">
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

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '🎵', label: 'Ritmo', desc: 'Temporal' },
          { icon: '👂', label: 'Audição', desc: 'Percepção' },
          { icon: '🤲', label: 'Motor', desc: 'Coordenação' },
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
