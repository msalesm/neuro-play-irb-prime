import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Trees, Star, Home, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface FocusTarget {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  active: boolean;
  timeLeft: number;
}

const difficultyLevels = [
  { name: 'Broto', targets: 1, duration: 3000, spawnRate: 4000 },
  { name: 'Mudinha', targets: 2, duration: 2500, spawnRate: 3500 },
  { name: 'Arbusto', targets: 2, duration: 2000, spawnRate: 3000 },
  { name: 'Árvore Jovem', targets: 3, duration: 1800, spawnRate: 2500 },
  { name: 'Árvore Adulta', targets: 3, duration: 1500, spawnRate: 2000 },
];

export default function FocusForest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<FocusTarget[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [treesGrown, setTreesGrown] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);

  const currentDifficulty = difficultyLevels[Math.min(level, difficultyLevels.length - 1)];

  useEffect(() => {
    let gameInterval: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;

    if (isPlaying) {
      // Game timer
      gameInterval = setInterval(() => {
        setGameTime(prev => prev + 100);
      }, 100);

      // Spawn targets
      spawnInterval = setInterval(() => {
        spawnTarget();
      }, currentDifficulty.spawnRate);

      // Update targets
      const targetUpdate = setInterval(() => {
        setTargets(prev => prev.map(target => ({
          ...target,
          timeLeft: target.timeLeft - 100
        })).filter(target => {
          if (target.timeLeft <= 0) {
            setMisses(m => m + 1);
            return false;
          }
          return true;
        }));
      }, 100);

      return () => {
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        clearInterval(targetUpdate);
      };
    }
  }, [isPlaying, currentDifficulty.spawnRate, targets.length]);

  const spawnTarget = () => {
    if (!gameAreaRef.current) return;

    setTargets(prev => {
      const maxTargets = currentDifficulty.targets;
      
      if (prev.length >= maxTargets) {
        console.log(`Max targets reached: ${prev.length}/${maxTargets}`);
        return prev;
      }

      const rect = gameAreaRef.current!.getBoundingClientRect();
      const size = Math.random() * 30 + 40; // 40-70px
      const colors = ['bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-purple-400'];
      
      const newTarget: FocusTarget = {
        id: targetIdRef.current++,
        x: Math.random() * (rect.width - size),
        y: Math.random() * (rect.height - size),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        active: true,
        timeLeft: currentDifficulty.duration,
      };

      console.log(`Spawning target ${newTarget.id}, total will be: ${prev.length + 1}`);
      return [...prev, newTarget];
    });
  };

  const hitTarget = (targetId: number) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 10);
    setTreesGrown(prev => prev + 1);

    // Level up every 10 hits - use functional update to get current hits
    setHits(prev => {
      const newHits = prev + 1;
      
      if (newHits % 10 === 0 && level < difficultyLevels.length - 1) {
        setLevel(currentLevel => {
          const newLevel = currentLevel + 1;
          toast({
            title: `Nível ${newLevel + 1} desbloqueado! 🌲`,
            description: `Sua floresta está crescendo!`,
          });
          return newLevel;
        });
      }
      
      console.log(`Hit target ${targetId}, total hits: ${newHits}`);
      return newHits;
    });
  };

  const startGame = () => {
    setTargets([]);
    setIsPlaying(true);
    // Spawn initial target after a small delay to ensure game area is ready
    setTimeout(() => {
      spawnTarget();
    }, 100);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setTargets([]);
    setScore(0);
    setGameTime(0);
    setHits(0);
    setMisses(0);
    setLevel(0);
  };

  const completeGame = async () => {
    if (!user || hits < 5) return;

    try {
      const accuracy = hits / (hits + misses) * 100;
      
      await supabase.from('therapy_sessions').insert({
        user_id: user.id,
        session_type: 'focus_training',
        title: `Sessão Focus Forest`,
        content: {
          score: score,
          hits: hits,
          misses: misses,
          accuracy: accuracy,
          level_reached: level + 1,
          trees_grown: treesGrown,
          duration_seconds: Math.round(gameTime / 1000)
        },
        duration_minutes: Math.round(gameTime / 60000),
        completion_status: 'completed'
      });

      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'focus_game',
        topic_name: 'Focus Forest',
        content: `${hits} acertos, ${treesGrown} árvores cultivadas`
      });

      toast({
        title: "Floresta cultivada! 🌳",
        description: `Você plantou ${treesGrown} árvores com ${accuracy.toFixed(1)}% de precisão`,
      });

      resetGame();
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: "Erro ao salvar jogo",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const accuracy = hits + misses > 0 ? (hits / (hits + misses) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar este jogo, você precisa fazer login.
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-green-900">
              Focus Forest
            </h1>
            <p className="text-green-700">
              Cultive sua atenção e faça sua floresta crescer
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/games" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-glow bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Trees className="h-6 w-6 text-green-600" />
                    {currentDifficulty.name} - Nível {level + 1}
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-medium">Score: {score}</span>
                    <span className="text-blue-600 font-medium">
                      Tempo: {Math.floor(gameTime / 60000)}:{((gameTime / 1000) % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={gameAreaRef}
                  className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg border-4 border-green-300 overflow-hidden cursor-crosshair"
                  style={{ 
                    backgroundImage: `
                      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
                    `
                  }}
                >
                  {/* Forest Background Elements */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-600/20 to-transparent"></div>
                  
                  {/* Trees grown */}
                  {Array.from({ length: Math.min(treesGrown, 20) }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute bottom-2"
                      style={{
                        left: `${(index * 30) % 80 + 5}%`,
                        transform: `translateX(-50%)`,
                      }}
                    >
                      <div className="text-2xl">🌲</div>
                    </div>
                  ))}

                  {/* Targets */}
                  {targets.map((target) => (
                    <button
                      key={target.id}
                      className={`absolute rounded-full ${target.color} shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center text-white font-bold border-2 border-white`}
                      style={{
                        left: target.x,
                        top: target.y,
                        width: target.size,
                        height: target.size,
                        opacity: target.timeLeft / currentDifficulty.duration,
                      }}
                      onClick={() => hitTarget(target.id)}
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  ))}

                  {/* No targets message */}
                  {!isPlaying && targets.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-green-700">
                        <Trees className="h-16 w-16 mx-auto mb-4 text-green-500" />
                        <p className="text-xl font-semibold mb-2">Sua floresta está esperando...</p>
                        <p className="text-sm">Clique em "Começar" para plantar suas primeiras sementes</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar
                    </Button>
                  ) : (
                    <Button onClick={pauseGame} variant="secondary" size="lg" className="flex items-center gap-2">
                      <Pause className="h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  <Button onClick={resetGame} variant="outline" size="lg" className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reiniciar
                  </Button>
                  {hits >= 5 && (
                    <Button onClick={completeGame} size="lg" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Star className="h-5 w-5" />
                      Concluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Precisão</span>
                    <span className="text-sm font-medium">{accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{hits}</div>
                    <div className="text-xs text-green-700">Acertos</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{misses}</div>
                    <div className="text-xs text-red-700">Erros</div>
                  </div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{treesGrown}</div>
                  <div className="text-xs text-blue-700">Árvores Plantadas</div>
                </div>
              </CardContent>
            </Card>

            {/* Levels */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Níveis da Floresta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {difficultyLevels.map((lvl, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index <= level 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{lvl.name}</span>
                      {index <= level && <Badge variant="secondary">✓</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lvl.targets} alvos • {lvl.duration/1000}s duração
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Dicas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Mantenha o foco nos alvos que aparecem</p>
                <p>• Quanto mais rápido clicar, mais árvores crescem</p>
                <p>• Cada nível fica mais desafiador</p>
                <p>• Sua precisão é mais importante que velocidade</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}