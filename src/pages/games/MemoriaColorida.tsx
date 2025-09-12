import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Star, Trophy, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type GameColor = 'red' | 'blue' | 'green' | 'yellow';

interface GameStats {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  totalAttempts: number;
}

// Classic Simon colors - only 4!
const COLORS: GameColor[] = ['red', 'blue', 'green', 'yellow'];

const COLOR_CONFIG = {
  red: { bg: 'bg-red-500', activeBg: 'bg-red-300', name: 'Vermelho' },
  blue: { bg: 'bg-blue-500', activeBg: 'bg-blue-300', name: 'Azul' },
  green: { bg: 'bg-green-500', activeBg: 'bg-green-300', name: 'Verde' },
  yellow: { bg: 'bg-yellow-500', activeBg: 'bg-yellow-300', name: 'Amarelo' },
};

export default function MemoriaColorida() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameOver'>('idle');
  const [sequence, setSequence] = useState<GameColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<GameColor[]>([]);
  const [currentShowingIndex, setCurrentShowingIndex] = useState(-1);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalAttempts: 0,
  });
  const [showingColor, setShowingColor] = useState<GameColor | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1000); // Slower start
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Start game - Classic Simon style: start with 1 color
  const startGame = useCallback(() => {
    const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSequence = [firstColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setCurrentShowingIndex(-1);
    setGameState('showing');
    playSequence(newSequence);
  }, []);

  // Play the sequence to user with clear pauses
  const playSequence = useCallback((seq: GameColor[]) => {
    let index = 0;
    setCurrentShowingIndex(0);
    
    const showNext = () => {
      if (index < seq.length) {
        setShowingColor(seq[index]);
        setCurrentShowingIndex(index);
        
        if (soundEnabled && !document.documentElement.classList.contains('reduced-sounds')) {
          playColorSound(seq[index]);
        }
        
        setTimeout(() => {
          setShowingColor(null);
          index++;
          setCurrentShowingIndex(-1);
          
          if (index < seq.length) {
            setTimeout(showNext, 300); // Pause between colors
          } else {
            setTimeout(() => {
              setGameState('playing');
              setCurrentShowingIndex(-1);
            }, 500);
          }
        }, gameSpeed / 2);
      }
    };
    
    setTimeout(showNext, 500); // Initial delay
  }, [gameSpeed, soundEnabled]);

  // Sound feedback with distinct tones
  const playColorSound = (color: GameColor) => {
    if (document.documentElement.classList.contains('reduced-sounds')) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const frequencies = {
      red: 196.00,    // G3
      blue: 220.00,   // A3
      green: 246.94,  // B3
      yellow: 261.63, // C4
    };

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequencies[color];
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
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
    if (color === sequence[playerSequence.length]) {
      if (newPlayerSequence.length === sequence.length) {
        // Sequence completed successfully
        const newStats = {
          ...stats,
          score: stats.score + (sequence.length * 10),
          streak: stats.streak + 1,
          bestStreak: Math.max(stats.bestStreak, stats.streak + 1),
          correctAnswers: stats.correctAnswers + 1,
          totalAttempts: stats.totalAttempts + 1,
          level: stats.level + 1,
        };
        setStats(newStats);
        
        // Increase speed slightly after level 3
        if (newStats.level > 3) {
          setGameSpeed(Math.max(600, gameSpeed - 50));
        }

        // Add next color to sequence after 1 second
        setTimeout(() => {
          const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          const nextSequence = [...sequence, nextColor];
          setSequence(nextSequence);
          setPlayerSequence([]);
          setCurrentShowingIndex(-1);
          setGameState('showing');
          playSequence(nextSequence);
        }, 1500);
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
    setCurrentShowingIndex(-1);
    setShowingColor(null);
    setStats({
      level: 1,
      score: 0,
      streak: 0,
      bestStreak: stats.bestStreak, // Keep best streak
      correctAnswers: 0,
      totalAttempts: 0,
    });
    setGameSpeed(1000);
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
            <p className="text-muted-foreground text-sm">Estilo Simon Clássico</p>
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
              <div className="text-sm text-muted-foreground">Sequência</div>
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
              <div className="text-2xl font-bold text-yellow-600">{stats.bestStreak}</div>
              <div className="text-sm text-muted-foreground">Melhor</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Precisão</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {gameState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Como Jogar Simon</h2>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Observe a sequência de cores que pisca
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Repita a sequência clicando nas cores
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      A cada rodada, uma nova cor é adicionada
                    </p>
                  </div>
                </div>
                
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Começar Simon
                </Button>
              </div>
            )}

            {(gameState === 'showing' || gameState === 'playing') && (
              <div className="space-y-8">
                {/* Game Status */}
                <div className="text-center">
                  <Badge variant="outline" className="mb-4 text-lg p-3">
                    {gameState === 'showing' ? '👀 Observe a sequência...' : `🎯 Sua vez! (${playerSequence.length + 1}/${sequence.length})`}
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground">
                    Sequência de {sequence.length} core{sequence.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Classic Simon Layout - 2x2 Grid */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8 bg-gray-800 rounded-full shadow-2xl">
                    {COLORS.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => handleColorClick(color)}
                        disabled={gameState !== 'playing'}
                        className={`
                          w-32 h-32 sm:w-40 sm:h-40 transition-all duration-200 shadow-inner
                          ${showingColor === color ? COLOR_CONFIG[color].activeBg : COLOR_CONFIG[color].bg}
                          ${showingColor === color ? 'scale-105 brightness-150 shadow-lg' : ''}
                          ${gameState === 'playing' ? 'hover:scale-105 hover:brightness-110 cursor-pointer' : 'cursor-not-allowed opacity-70'}
                          ${index === 0 ? 'rounded-tl-3xl' : ''}
                          ${index === 1 ? 'rounded-tr-3xl' : ''}
                          ${index === 2 ? 'rounded-bl-3xl' : ''}
                          ${index === 3 ? 'rounded-br-3xl' : ''}
                        `}
                        aria-label={COLOR_CONFIG[color].name}
                      />
                    ))}
                  </div>
                </div>

                {/* Sequence Progress */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Progresso da sequência:</p>
                  <div className="flex justify-center gap-1 flex-wrap max-w-md mx-auto">
                    {sequence.map((color, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full transition-all duration-200 ${
                          index < playerSequence.length 
                            ? COLOR_CONFIG[color].bg 
                            : index === currentShowingIndex
                            ? COLOR_CONFIG[color].activeBg + ' scale-125'
                            : 'bg-gray-300 border-2 border-dashed border-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-destructive">Fim de Jogo!</h2>
                  <p className="text-muted-foreground">
                    Você chegou à sequência de {stats.level} cores com {stats.score} pontos
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
                <p className="text-muted-foreground">Fortalece a capacidade de reter e manipular sequências temporariamente</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Atenção Sequencial</h4>
                <p className="text-muted-foreground">Desenvolve foco em padrões e ordem temporal</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Concentração</h4>
                <p className="text-muted-foreground">Melhora sustentação da atenção e controle inibitório</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}