import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Target, Trophy, Clock, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAudioEngine } from "@/hooks/useAudioEngine";

type GameItem = {
  id: string;
  emoji: string;
  isTarget: boolean;
  x: number;
  y: number;
};

interface GameStats {
  level: number;
  score: number;
  correctClicks: number;
  totalClicks: number;
  timeLeft: number;
  streak: number;
  bestTime: number;
}

const TARGET_EMOJIS = ['🎯', '⭐', '💎', '🏆', '🎁', '🌟', '💝', '🎪'];
const DISTRACTOR_EMOJIS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⚫', '⚪', '🔶', '🔷', '🔸', '🔹'];

export default function CacaFoco() {
  const { user } = useAuth();
  const audio = useAudioEngine();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  const [items, setItems] = useState<GameItem[]>([]);
  const [currentTarget, setCurrentTarget] = useState('🎯');
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    correctClicks: 0,
    totalClicks: 0,
    timeLeft: 30,
    streak: 0,
    bestTime: 0,
  });
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [difficulty, setDifficulty] = useState(1);

  // Generate game items based on difficulty
  const generateItems = useCallback((level: number, targetEmoji: string) => {
    const itemCount = Math.min(8 + level, 15); // Fewer items, easier to find
    const targetCount = Math.max(1, Math.min(3, Math.ceil(level / 2))); // Start with 1 target
    const newItems: GameItem[] = [];
    
    // Add target items - use the passed targetEmoji parameter
    for (let i = 0; i < targetCount; i++) {
      newItems.push({
        id: `target-${i}`,
        emoji: targetEmoji,
        isTarget: true,
        x: Math.random() * 70 + 15, // More centered positioning
        y: Math.random() * 60 + 20, 
      });
    }

    // Add distractor items - make sure they're different from target
    const availableDistractors = DISTRACTOR_EMOJIS.filter(emoji => emoji !== targetEmoji);
    for (let i = 0; i < itemCount - targetCount; i++) {
      const randomDistractor = availableDistractors[Math.floor(Math.random() * availableDistractors.length)];
      newItems.push({
        id: `distractor-${i}`,
        emoji: randomDistractor,
        isTarget: false,
        x: Math.random() * 70 + 15,
        y: Math.random() * 60 + 20,
      });
    }

    // Ensure no overlapping positions with better spacing
    const adjustedItems = newItems.map((item, index) => {
      let attempts = 0;
      let newX = item.x;
      let newY = item.y;
      
      while (attempts < 15) {
        const tooClose = newItems.slice(0, index).some(otherItem => {
          const distance = Math.sqrt(
            Math.pow(newX - otherItem.x, 2) + Math.pow(newY - otherItem.y, 2)
          );
          return distance < 12; // Larger minimum distance
        });
        
        if (!tooClose) break;
        
        newX = Math.random() * 70 + 15;
        newY = Math.random() * 60 + 20;
        attempts++;
      }
      
      return { ...item, x: newX, y: newY };
    });

    setItems(adjustedItems);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const newTarget = TARGET_EMOJIS[Math.floor(Math.random() * TARGET_EMOJIS.length)];
    setCurrentTarget(newTarget);
    
    const initialStats = {
      ...stats,
      timeLeft: Math.max(20, 40 - (stats.level * 2)), // Decreasing time per level
      correctClicks: 0,
      totalClicks: 0,
    };
    setStats(initialStats);
    
    // Generate items immediately with the new target
    generateItems(stats.level, newTarget);
    setGameState('playing');
    setStartTime(Date.now());
    
    // Start timer
    const timer = setInterval(() => {
      setStats(prev => {
        if (prev.timeLeft <= 1) {
          setGameState('gameOver');
          if (timer) clearInterval(timer);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    setGameTimer(timer);
  }, [stats.level]);

  // Handle item click
  const handleItemClick = (item: GameItem) => {
    if (gameState !== 'playing') return;

    const newStats = {
      ...stats,
      totalClicks: stats.totalClicks + 1,
    };

    if (item.isTarget) {
      // Correct click
      newStats.correctClicks = stats.correctClicks + 1;
      newStats.score = stats.score + (10 * stats.level);
      newStats.streak = stats.streak + 1;
      
      // Audio feedback
      audio.playSuccess('medium');
      if (newStats.streak > 2) {
        audio.playTick(); // Combo sound
      }

      // Remove clicked target
      const updatedItems = items.filter(i => i.id !== item.id);
      setItems(updatedItems);

      // Check if all targets found
      const remainingTargets = updatedItems.filter(i => i.isTarget);
      if (remainingTargets.length === 0) {
        // Level completed
        const completionTime = Date.now() - startTime;
        const timeBonus = Math.max(0, newStats.timeLeft * 5);
        
        newStats.score += timeBonus;
        newStats.bestTime = newStats.bestTime === 0 ? completionTime : Math.min(newStats.bestTime, completionTime);
        
        // Level up
        if (newStats.streak >= 3) {
          newStats.level = Math.min(newStats.level + 1, 15);
          newStats.streak = 0;
          audio.playLevelUp();
          audio.speak('Nível aumentado!', { rate: 1.2 });
        } else {
          audio.playAchievement();
        }
        
        setStats(newStats);
        
        setTimeout(() => {
          if (newStats.level > stats.level) {
            // New level - restart with harder difficulty
            startGame();
          } else {
            // Continue current level
            const nextTarget = TARGET_EMOJIS[Math.floor(Math.random() * TARGET_EMOJIS.length)];
            setCurrentTarget(nextTarget);
            generateItems(newStats.level, nextTarget);
          }
        }, 1000);
      }
    } else {
      // Wrong click - penalty
      newStats.score = Math.max(0, stats.score - 5);
      newStats.streak = 0;
      newStats.timeLeft = Math.max(1, stats.timeLeft - 2); // Time penalty
      
      // Audio feedback for error
      audio.playError('soft');
    }

    setStats(newStats);
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (gameTimer) clearInterval(gameTimer);
    } else if (gameState === 'paused') {
      setGameState('playing');
      const timer = setInterval(() => {
        setStats(prev => {
          if (prev.timeLeft <= 1) {
            setGameState('gameOver');
            if (gameTimer) clearInterval(gameTimer);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
      setGameTimer(timer);
    }
  };

  // Reset game
  const resetGame = () => {
    if (gameTimer) clearInterval(gameTimer);
    setGameState('idle');
    setItems([]);
    setStats({
      level: 1,
      score: 0,
      correctClicks: 0,
      totalClicks: 0,
      timeLeft: 30,
      streak: 0,
      bestTime: stats.bestTime, // Keep best time
    });
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [gameTimer]);

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
              Para jogar Caça ao Foco, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = stats.totalClicks > 0 ? Math.round((stats.correctClicks / stats.totalClicks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-card py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/games">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Jogos
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              🎯 Caça ao Foco
            </h1>
            <p className="text-muted-foreground text-sm">Encontre os objetos corretos</p>
          </div>

          <div className="flex gap-2">
            {gameState === 'playing' && (
              <Button variant="outline" onClick={togglePause} size="sm" className="gap-2">
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
            {gameState === 'paused' && (
              <Button variant="outline" onClick={togglePause} size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Retomar
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
              <div className="text-xl font-bold text-red-600">{stats.timeLeft}s</div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Precisão</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.streak}</div>
              <div className="text-xs text-muted-foreground">Sequência</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Instructions & Target */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{currentTarget}</div>
                  <div>
                    <h3 className="font-semibold">Encontre este símbolo!</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em todos os {currentTarget} na tela
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Alvos restantes</div>
                  <div className="text-2xl font-bold text-primary">
                    {items.filter(i => i.isTarget).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-8">
            {gameState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Como Jogar</h2>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <p className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Encontre todos os símbolos-alvo na tela
                    </p>
                    <p className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Ignore os símbolos distratores
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Complete antes do tempo acabar
                    </p>
                  </div>
                </div>
                
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Começar Jogo
                </Button>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Jogo Pausado</h2>
                <p className="text-muted-foreground">Clique em "Retomar" para continuar</p>
              </div>
            )}

            {(gameState === 'playing' && items.length > 0) && (
              <div className="relative min-h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-dashed border-primary/30">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="absolute text-2xl sm:text-3xl transition-all duration-200 hover:scale-125 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/50"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                    }}
                    aria-label={item.isTarget ? 'Alvo correto' : 'Distrator'}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">
                    {stats.correctClicks > 0 ? 'Parabéns!' : 'Tempo Esgotado!'}
                  </h2>
                  <p className="text-muted-foreground">
                    Você completou o nível {stats.level} com {stats.score} pontos
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-green-500" />
                      Acertos: {stats.correctClicks}/{stats.correctClicks + items.filter(i => i.isTarget).length}
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
                <h4 className="font-medium text-primary">Atenção Seletiva</h4>
                <p className="text-muted-foreground">Melhora a capacidade de focar em estímulos relevantes ignorando distrações</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Controle Inibitório</h4>
                <p className="text-muted-foreground">Fortalece a habilidade de suprimir respostas automáticas inadequadas</p>
              </div>
              <div>
                <h4 className="font-medium text-primary">Processamento Visual</h4>
                <p className="text-muted-foreground">Desenvolve rapidez e precisão na identificação visual de objetos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}