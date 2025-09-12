import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Star, Trophy, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type GameColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

interface GameStats {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  totalAttempts: number;
}

const COLORS: GameColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const COLOR_CONFIG = {
  red: { bg: 'bg-red-500', glow: 'shadow-red-500/50', name: 'Vermelho' },
  blue: { bg: 'bg-blue-500', glow: 'shadow-blue-500/50', name: 'Azul' },
  green: { bg: 'bg-green-500', glow: 'shadow-green-500/50', name: 'Verde' },
  yellow: { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', name: 'Amarelo' },
  purple: { bg: 'bg-purple-500', glow: 'shadow-purple-500/50', name: 'Roxo' },
  orange: { bg: 'bg-orange-500', glow: 'shadow-orange-500/50', name: 'Laranja' },
};

export default function MemoriaColorida() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameOver'>('idle');
  const [sequence, setSequence] = useState<GameColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<GameColor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalAttempts: 0,
  });
  const [showingColor, setShowingColor] = useState<GameColor | null>(null);
  const [gameSpeed, setGameSpeed] = useState(800); // ms between colors
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game initialization
  const startGame = useCallback(() => {
    const newSequence = [COLORS[Math.floor(Math.random() * (Math.min(4, 2 + stats.level)))]];
    setSequence(newSequence);
    setPlayerSequence([]);
    setCurrentIndex(0);
    setGameState('showing');
    playSequence(newSequence);
  }, [stats.level]);

  // Play the sequence to user
  const playSequence = useCallback((seq: GameColor[]) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < seq.length) {
        setShowingColor(seq[index]);
        if (soundEnabled && !document.documentElement.classList.contains('reduced-sounds')) {
          playColorSound(seq[index]);
        }
        
        setTimeout(() => {
          setShowingColor(null);
        }, gameSpeed / 2);
        
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGameState('playing');
        }, gameSpeed / 2);
      }
    }, gameSpeed);
  }, [gameSpeed, soundEnabled]);

  // Sound feedback
  const playColorSound = (color: GameColor) => {
    if (document.documentElement.classList.contains('reduced-sounds')) return;
    
    // Create audio context for different tones
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const frequencies = {
      red: 220,    // A3
      blue: 246.94,  // B3
      green: 277.18, // C#4
      yellow: 311.13, // D#4
      purple: 369.99, // F#4
      orange: 415.30  // G#4
    };

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequencies[color];
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Handle player input
  const handleColorClick = (color: GameColor) => {
    if (gameState !== 'playing') return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (soundEnabled) {
      playColorSound(color);
    }

    // Check if correct
    if (color === sequence[currentIndex]) {
      if (newPlayerSequence.length === sequence.length) {
        // Sequence completed successfully
        const newStats = {
          ...stats,
          score: stats.score + (10 * stats.level),
          streak: stats.streak + 1,
          bestStreak: Math.max(stats.bestStreak, stats.streak + 1),
          correctAnswers: stats.correctAnswers + 1,
          totalAttempts: stats.totalAttempts + 1,
        };
        setStats(newStats);
        
        // Level up logic
        if (newStats.streak % 3 === 0) {
          setStats(prev => ({ ...prev, level: Math.min(prev.level + 1, 10) }));
          setGameSpeed(Math.max(400, gameSpeed - 50)); // Increase speed
        }

        // Add next color to sequence
        setTimeout(() => {
          const nextSequence = [...sequence, COLORS[Math.floor(Math.random() * (Math.min(6, 2 + newStats.level)))]];
          setSequence(nextSequence);
          setPlayerSequence([]);
          setCurrentIndex(0);
          setGameState('showing');
          playSequence(nextSequence);
        }, 1000);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      // Wrong answer
      setStats(prev => ({
        ...prev,
        streak: 0,
        totalAttempts: prev.totalAttempts + 1,
      }));
      setGameState('gameOver');
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('idle');
    setSequence([]);
    setPlayerSequence([]);
    setCurrentIndex(0);
    setShowingColor(null);
    setStats({
      level: 1,
      score: 0,
      streak: 0,
      bestStreak: stats.bestStreak, // Keep best streak
      correctAnswers: 0,
      totalAttempts: 0,
    });
    setGameSpeed(800);
  };

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
              Para jogar Memória Colorida, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0;
  const levelProgress = ((stats.streak % 3) / 3) * 100;

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
              🎨 Memória Colorida
            </h1>
            <p className="text-muted-foreground text-sm">Estilo Simon - Repita a sequência</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.level}</div>
              <div className="text-sm text-muted-foreground">Nível</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.score}</div>
              <div className="text-sm text-muted-foreground">Pontos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.streak}</div>
              <div className="text-sm text-muted-foreground">Sequência</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        {gameState !== 'idle' && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso do Nível</span>
                <span className="text-sm text-muted-foreground">
                  {stats.streak % 3}/3 para próximo nível
                </span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {gameState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Como Jogar</h2>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Observe a sequência de cores
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Repita a sequência clicando nas cores
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Cada nível adiciona uma nova cor
                    </p>
                  </div>
                </div>
                
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Começar Jogo
                </Button>
              </div>
            )}

            {(gameState === 'showing' || gameState === 'playing') && (
              <div className="space-y-6">
                {/* Sequence Display */}
                <div className="text-center">
                  <Badge variant="outline" className="mb-4">
                    {gameState === 'showing' ? 'Observe a sequência...' : `Sua vez! (${playerSequence.length + 1}/${sequence.length})`}
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground mb-6">
                    Sequência atual: {sequence.length} cores
                  </div>
                </div>

                {/* Color Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  {COLORS.slice(0, Math.min(6, 2 + stats.level)).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorClick(color)}
                      disabled={gameState !== 'playing'}
                      className={`
                        w-20 h-20 sm:w-24 sm:h-24 rounded-2xl transition-all duration-200 
                        ${COLOR_CONFIG[color].bg} 
                        ${showingColor === color ? `shadow-lg ${COLOR_CONFIG[color].glow}` : 'shadow-md'}
                        ${gameState === 'playing' ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-70'}
                        ${gameState === 'playing' ? 'hover:shadow-lg' : ''}
                      `}
                      aria-label={COLOR_CONFIG[color].name}
                    />
                  ))}
                </div>

                {/* Current Player Sequence */}
                {playerSequence.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Sua sequência:</p>
                    <div className="flex justify-center gap-1 flex-wrap">
                      {playerSequence.map((color, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded ${COLOR_CONFIG[color].bg}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-destructive">Fim de Jogo!</h2>
                  <p className="text-muted-foreground">
                    Você chegou ao nível {stats.level} com {stats.score} pontos
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Melhor sequência: {stats.bestStreak}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      Precisão: {accuracy}%
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

        {/* Benefits */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Benefícios Terapêuticos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-primary">Memória de Trabalho</h4>
                <p className="text-muted-foreground">Fortalece a capacidade de reter e manipular informações temporariamente</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Atenção Sequencial</h4>
                <p className="text-muted-foreground">Desenvolve foco em sequências e ordem temporal</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Concentração</h4>
                <p className="text-muted-foreground">Melhora sustentação da atenção em tarefas específicas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}