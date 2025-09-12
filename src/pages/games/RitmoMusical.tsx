import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Music, Trophy, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  bpm: number;
}

const BEAT_SOUNDS = {
  kick: { freq: 60, color: 'bg-red-500', name: '🥁 Bumbo', key: 'Space' },
  snare: { freq: 200, color: 'bg-blue-500', name: '🪘 Caixa', key: 'S' },
  hihat: { freq: 8000, color: 'bg-yellow-500', name: '🎵 Chimbal', key: 'H' },
  crash: { freq: 4000, color: 'bg-purple-500', name: '💥 Prato', key: 'C' },
};

const DIFFICULTY_SETTINGS = {
  easy: { bpm: 40, tolerance: 300, beatsPerPattern: 2 },
  medium: { bpm: 60, tolerance: 250, beatsPerPattern: 3 },
  hard: { bpm: 80, tolerance: 200, beatsPerPattern: 4 },
};

export default function RitmoMusical() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'listening' | 'playing' | 'paused' | 'gameOver'>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [pattern, setPattern] = useState<Beat[]>([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [playerBeats, setPlayerBeats] = useState<Beat[]>([]);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    accuracy: 100,
    perfectHits: 0,
    totalBeats: 0,
    streak: 0,
    bestStreak: 0,
      bpm: 40,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const patternTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play sound
  const playSound = useCallback((beatType: BeatType, duration: number = 0.1) => {
    if (!soundEnabled || !audioContextRef.current || document.documentElement.classList.contains('reduced-sounds')) {
      return;
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = BEAT_SOUNDS[beatType].freq;
    oscillator.type = beatType === 'kick' ? 'sine' : beatType === 'snare' ? 'square' : 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [soundEnabled]);

  // Generate rhythm pattern
  const generatePattern = useCallback((difficulty: Difficulty, level: number): Beat[] => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const beatTypes: BeatType[] = level >= 5 ? ['kick', 'snare', 'hihat'] : 
                                 level >= 3 ? ['kick', 'snare'] : ['kick'];
    
    const beats: Beat[] = [];
    const beatInterval = (60 / settings.bpm) * 1000; // ms per beat
    
    // Simple patterns - every beat has a sound for easier learning
    for (let i = 0; i < settings.beatsPerPattern; i++) {
      const beatType = beatTypes[i % beatTypes.length]; // Cycle through available types
      beats.push({
        id: `beat-${i}`,
        type: beatType,
        time: i * beatInterval,
        played: false,
      });
    }
    
    return beats;
  }, []);

  // Play pattern for listening
  const playPattern = useCallback((beats: Beat[]) => {
    if (!beats.length) return;
    
    setIsListening(true);
    let currentIndex = 0;
    
    const playNextBeat = () => {
      if (currentIndex < beats.length) {
        const beat = beats[currentIndex];
        playSound(beat.type);
        setCurrentBeatIndex(currentIndex);
        
        currentIndex++;
        const nextBeat = beats[currentIndex];
        const delay = nextBeat ? nextBeat.time - beat.time : 500;
        
        patternTimerRef.current = setTimeout(playNextBeat, delay);
      } else {
        setIsListening(false);
        setCurrentBeatIndex(0);
        setTimeout(() => {
          setGameState('playing');
        }, 1000);
      }
    };
    
    playNextBeat();
  }, [playSound]);

  // Start game
  const startGame = useCallback(() => {
    const newPattern = generatePattern(difficulty, stats.level);
    setPattern(newPattern);
    setPlayerBeats([]);
    setCurrentBeatIndex(0);
    setGameState('listening');
    
    setTimeout(() => {
      playPattern(newPattern);
    }, 1000);
  }, [difficulty, stats.level, generatePattern, playPattern]);

  // Handle player input
  const handleBeatInput = (beatType: BeatType) => {
    if (gameState !== 'playing') return;

    const currentTime = Date.now();
    playSound(beatType, 0.1);
    
    const newBeat: Beat = {
      id: `player-${playerBeats.length}`,
      type: beatType,
      time: currentTime,
      played: true,
    };
    
    setPlayerBeats(prev => [...prev, newBeat]);
  };

  // Evaluate performance
  const evaluatePerformance = useCallback(() => {
    if (!pattern.length || !playerBeats.length) return;

    let perfectHits = 0;
    let totalExpectedBeats = pattern.length;
    
    // Simple evaluation: check if player hit the right beats in roughly the right order
    const patternTypes = pattern.map(b => b.type);
    const playerTypes = playerBeats.map(b => b.type);
    
    const minLength = Math.min(patternTypes.length, playerTypes.length);
    
    for (let i = 0; i < minLength; i++) {
      if (patternTypes[i] === playerTypes[i]) {
        perfectHits++;
      }
    }
    
    const accuracy = totalExpectedBeats > 0 ? (perfectHits / totalExpectedBeats) * 100 : 0;
    const points = Math.round(perfectHits * 10 * (accuracy / 100) * stats.level);
    
    const newStats = {
      ...stats,
      score: stats.score + points,
      perfectHits: stats.perfectHits + perfectHits,
      totalBeats: stats.totalBeats + totalExpectedBeats,
      accuracy: stats.totalBeats + totalExpectedBeats > 0 ? 
        ((stats.perfectHits + perfectHits) / (stats.totalBeats + totalExpectedBeats)) * 100 : 100,
      streak: accuracy >= 70 ? stats.streak + 1 : 0,
      bestStreak: Math.max(stats.bestStreak, accuracy >= 70 ? stats.streak + 1 : stats.streak),
    };

    // Level progression
    if (newStats.streak >= 3) {
      newStats.level = Math.min(newStats.level + 1, 10);
      newStats.streak = 0;
      newStats.bpm = Math.min(newStats.bpm + 10, 140);
    }

    setStats(newStats);
    
    // Show results and continue
    setTimeout(() => {
      if (newStats.level > stats.level) {
        // Level up - increase difficulty
        if (difficulty === 'easy' && newStats.level >= 4) {
          setDifficulty('medium');
        } else if (difficulty === 'medium' && newStats.level >= 7) {
          setDifficulty('hard');
        }
      }
      startGame();
    }, 2000);
  }, [pattern, playerBeats, stats, difficulty, startGame]);

  // Auto-evaluate after pattern completion or timeout
  useEffect(() => {
    if (gameState === 'playing' && playerBeats.length >= pattern.length) {
      setTimeout(evaluatePerformance, 500);
    }
  }, [gameState, playerBeats, pattern, evaluatePerformance]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const key = event.code;
      switch (key) {
        case 'Space':
          event.preventDefault();
          handleBeatInput('kick');
          break;
        case 'KeyS':
          handleBeatInput('snare');
          break;
        case 'KeyH':
          handleBeatInput('hihat');
          break;
        case 'KeyC':
          handleBeatInput('crash');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  // Reset game
  const resetGame = () => {
    if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    
    setGameState('idle');
    setPattern([]);
    setPlayerBeats([]);
    setCurrentBeatIndex(0);
    setIsListening(false);
    setDifficulty('easy');
    setStats({
      level: 1,
      score: 0,
      accuracy: 100,
      perfectHits: 0,
      totalBeats: 0,
      streak: 0,
      bestStreak: stats.bestStreak, // Keep best streak
      bpm: 40,
    });
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    };
  }, []);

  // Login required check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para jogar Ritmo Musical, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/games">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Jogos
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              🎵 Ritmo Musical
            </h1>
            <p className="text-muted-foreground text-sm">Coordenação temporal e ritmo</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {(gameState === 'playing' || gameState === 'paused') && (
              <Button variant="outline" onClick={togglePause} size="sm" className="gap-2">
                {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {gameState === 'playing' ? 'Pausar' : 'Retomar'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-primary">{stats.level}</div>
              <div className="text-xs text-muted-foreground">Nível</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600">{stats.score}</div>
              <div className="text-xs text-muted-foreground">Pontos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{Math.round(stats.accuracy)}%</div>
              <div className="text-xs text-muted-foreground">Precisão</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{stats.bpm}</div>
              <div className="text-xs text-muted-foreground">BPM</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.streak}</div>
              <div className="text-xs text-muted-foreground">Sequência</div>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Selector */}
        {gameState === 'idle' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold mb-4">Escolha a Dificuldade</h3>
                <div className="flex justify-center gap-2">
                  {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
                    <Button
                      key={key}
                      variant={difficulty === key ? "default" : "outline"}
                      onClick={() => setDifficulty(key as Difficulty)}
                      className="gap-2"
                    >
                      {key === 'easy' ? '🟢 Fácil' : key === 'medium' ? '🟡 Médio' : '🔴 Difícil'}
                      <span className="text-xs">({settings.bpm} BPM)</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {gameState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Como Jogar</h2>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      Ouça o padrão rítmico atentamente
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 text-primary">🎹</span>
                      Reproduza usando mouse ou teclado
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 text-primary">⏱️</span>
                      Mantenha o tempo correto
                    </p>
                  </div>
                </div>
                
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Começar Jogo
                </Button>
              </div>
            )}

            {gameState === 'listening' && (
              <div className="text-center space-y-6">
                <Badge variant="outline" className="text-lg p-3">
                  🎧 Ouça o padrão...
                </Badge>
                
                {/* Pattern Visualization */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {pattern.map((beat, index) => (
                    <div
                      key={beat.id}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 transition-all duration-200 ${
                        index === currentBeatIndex && isListening
                          ? `${BEAT_SOUNDS[beat.type].color} border-white scale-125 shadow-lg`
                          : `${BEAT_SOUNDS[beat.type].color} border-gray-300`
                      }`}
                    >
                      {beat.type === 'kick' ? '🥁' : 
                       beat.type === 'snare' ? '🪘' : 
                       beat.type === 'hihat' ? '🎵' : '💥'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Badge variant="outline" className="mb-4">
                    Sua vez! Reproduza o padrão
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground mb-6">
                    Progresso: {playerBeats.length}/{pattern.length} batidas
                  </div>
                </div>

                {/* Drum Pads */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {Object.entries(BEAT_SOUNDS).map(([beatType, config]) => (
                    <button
                      key={beatType}
                      onClick={() => handleBeatInput(beatType as BeatType)}
                      className={`
                        h-24 rounded-2xl ${config.color} text-white font-bold text-lg 
                        transition-all duration-150 active:scale-95 hover:scale-105
                        shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-1
                      `}
                    >
                      <div className="text-2xl">
                        {beatType === 'kick' ? '🥁' : 
                         beatType === 'snare' ? '🪘' : 
                         beatType === 'hihat' ? '🎵' : '💥'}
                      </div>
                      <div className="text-xs">{config.key}</div>
                    </button>
                  ))}
                </div>

                {/* Player Progress */}
                {playerBeats.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Seu padrão:</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {playerBeats.map((beat, index) => (
                        <div
                          key={beat.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            BEAT_SOUNDS[beat.type].color
                          }`}
                        >
                          {beat.type === 'kick' ? '🥁' : 
                           beat.type === 'snare' ? '🪘' : 
                           beat.type === 'hihat' ? '🎵' : '💥'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gameState === 'paused' && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Jogo Pausado</h2>
                <p className="text-muted-foreground">Clique em "Retomar" para continuar</p>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Fim de Jogo!</h2>
                  <p className="text-muted-foreground">
                    Você chegou ao nível {stats.level} com {stats.score} pontos
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4 text-blue-500" />
                      Precisão: {Math.round(stats.accuracy)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      Melhor sequência: {stats.bestStreak}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={startGame} className="gap-2">
                    <Play className="w-4 h-4" />
                    Jogar Novamente
                  </Button>
                  <Button variant="outline" onClick={resetGame} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reiniciar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-center">Controles do Teclado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(BEAT_SOUNDS).map(([beatType, config]) => (
                <div key={beatType} className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg mb-1">
                    {beatType === 'kick' ? '🥁' : 
                     beatType === 'snare' ? '🪘' : 
                     beatType === 'hihat' ? '🎵' : '💥'}
                  </div>
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground">{config.key}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Benefícios Terapêuticos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-primary">Coordenação Motora</h4>
                <p className="text-muted-foreground">Desenvolve sincronização entre movimento e tempo musical</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Processamento Auditivo</h4>
                <p className="text-muted-foreground">Melhora discriminação e sequenciamento de sons temporais</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Ritmo Temporal</h4>
                <p className="text-muted-foreground">Fortalece percepção de padrões e intervalos de tempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}