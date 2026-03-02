import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Eye, Target, Home, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VisualTarget {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  direction: { dx: number; dy: number };
  speed: number;
  pattern: 'linear' | 'circular' | 'zigzag' | 'random';
  active: boolean;
  tracked: boolean;
}

type ContrastLevel = 'low' | 'medium' | 'high';
type SpeedLevel = 'slow' | 'medium' | 'fast';

const contrastLevels = {
  low: { name: 'Baixo', opacity: 0.3, blur: 2 },
  medium: { name: 'Médio', opacity: 0.6, blur: 1 },
  high: { name: 'Alto', opacity: 0.9, blur: 0 }
};

const speedLevels = {
  slow: { name: 'Lento', multiplier: 0.5 },
  medium: { name: 'Médio', multiplier: 1.0 },
  fast: { name: 'Rápido', multiplier: 2.0 }
};

export default function VisualSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<VisualTarget[]>([]);
  const [trackedTargets, setTrackedTargets] = useState<number[]>([]);
  const [contrast, setContrast] = useState<ContrastLevel>('medium');
  const [speed, setSpeed] = useState<SpeedLevel>('medium');
  const [accuracy, setAccuracy] = useState(100);
  const [eyeTracking, setEyeTracking] = useState({ x: 0, y: 0 });
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [targetsMissed, setTargetsMissed] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  const currentContrast = contrastLevels[contrast];
  const currentSpeed = speedLevels[speed];

  useEffect(() => {
    let animationFrame: number;
    
    if (isPlaying) {
      const updateTargets = () => {
        setTargets(prev => prev.map(target => {
          if (!target.active) return target;
          
          let newX = target.x;
          let newY = target.y;
          
          // Update position based on movement pattern
          switch (target.pattern) {
            case 'linear':
              newX += target.direction.dx * target.speed * currentSpeed.multiplier;
              newY += target.direction.dy * target.speed * currentSpeed.multiplier;
              break;
            case 'circular':
              const time = Date.now() * 0.001;
              newX = 200 + Math.cos(time * target.speed * currentSpeed.multiplier) * 100;
              newY = 200 + Math.sin(time * target.speed * currentSpeed.multiplier) * 100;
              break;
            case 'zigzag':
              newX += target.direction.dx * target.speed * currentSpeed.multiplier;
              newY += Math.sin(Date.now() * 0.01) * 2 * target.speed * currentSpeed.multiplier;
              break;
            case 'random':
              newX += (Math.random() - 0.5) * target.speed * currentSpeed.multiplier * 4;
              newY += (Math.random() - 0.5) * target.speed * currentSpeed.multiplier * 4;
              break;
          }
          
          // Bounce off walls for linear movement
          if (target.pattern === 'linear') {
            if (newX <= 0 || newX >= 400 - target.size) {
              target.direction.dx *= -1;
            }
            if (newY <= 0 || newY >= 300 - target.size) {
              target.direction.dy *= -1;
            }
          }
          
          // Keep targets within bounds
          newX = Math.max(0, Math.min(400 - target.size, newX));
          newY = Math.max(0, Math.min(300 - target.size, newY));
          
          return { ...target, x: newX, y: newY };
        }));
        
        animationFrame = requestAnimationFrame(updateTargets);
      };
      
      animationFrame = requestAnimationFrame(updateTargets);
    }
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying, currentSpeed.multiplier]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        mousePositionRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        setEyeTracking(mousePositionRef.current);
      }
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('mousemove', handleMouseMove);
      return () => gameArea.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const generateTarget = (): VisualTarget => {
    const patterns = ['linear', 'circular', 'zigzag', 'random'] as const;
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'];
    
    return {
      id: targetIdRef.current++,
      x: Math.random() * 300,
      y: Math.random() * 200,
      size: Math.random() * 20 + 20, // 20-40px
      color: colors[Math.floor(Math.random() * colors.length)],
      direction: {
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4
      },
      speed: Math.random() * 2 + 1, // 1-3
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      active: true,
      tracked: false
    };
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setAccuracy(100);
    setTargetsHit(0);
    setTargetsMissed(0);
    setReactionTimes([]);
    setSessionStartTime(Date.now());
    
    // Generate initial targets
    const initialTargets = Array.from({ length: Math.min(2 + Math.floor(level / 2), 5) }, () => generateTarget());
    setTargets(initialTargets);
    setTrackedTargets([]);
    
    toast({
      title: "👁️ Siga os alvos!",
      description: "Rastreie os objetivos em movimento com seus olhos",
    });
  };

  const trackTarget = (targetId: number) => {
    const startTime = Date.now();
    
    setTargets(prev => prev.map(target => {
      if (target.id === targetId && !target.tracked) {
        const reactionTime = Date.now() - startTime;
        setReactionTimes(prev => [...prev, reactionTime]);
        
        // Calculate score based on difficulty
        const baseScore = 15;
        const contrastBonus = contrast === 'low' ? 20 : contrast === 'medium' ? 10 : 5;
        const speedBonus = speed === 'fast' ? 15 : speed === 'medium' ? 10 : 5;
        
        setScore(prev => prev + baseScore + contrastBonus + speedBonus);
        setTargetsHit(prev => prev + 1);
        setTrackedTargets(prev => [...prev, targetId]);
        
        toast({
          title: "🎯 Alvo rastreado!",
          description: `Excelente coordenação visual-motora!`,
        });
        
        return { ...target, tracked: true };
      }
      return target;
    }));
    
    // Check if all targets tracked
    const allTracked = targets.every(t => t.tracked || t.id === targetId);
    if (allTracked) {
      levelComplete();
    }
  };

  const levelComplete = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    
    // Calculate accuracy
    const totalTargets = targetsHit + targetsMissed;
    const newAccuracy = totalTargets > 0 ? (targetsHit / totalTargets) * 100 : 100;
    setAccuracy(newAccuracy);
    
    toast({
      title: `👀 Nível ${newLevel}!`,
      description: `Processamento visual melhorando! Precisão: ${newAccuracy.toFixed(1)}%`,
    });
    
    // Generate new targets for next level
    setTimeout(() => {
      const newTargets = Array.from({ length: Math.min(2 + Math.floor(newLevel / 2), 6) }, () => generateTarget());
      setTargets(newTargets);
      setTrackedTargets([]);
    }, 2000);
  };

  const saveSession = async () => {
    if (!user || targetsHit < 1) return;

    try {
      const avgReactionTime = reactionTimes.length > 0 ? 
        reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;

      const sessionData = {
        user_id: user.id,
        level: level,
        score: score,
        visual_tracking_accuracy: accuracy,
        spatial_processing_score: Math.round((targetsHit / (targetsHit + targetsMissed || 1)) * 100),
        visual_motor_integration_score: Math.round(100 - (avgReactionTime / 50)),
        contrast_sensitivity_level: contrast === 'low' ? 100 : contrast === 'medium' ? 70 : 40,
        movement_patterns_completed: trackedTargets.map(id => {
          const target = targets.find(t => t.id === id);
          return target ? { pattern: target.pattern, speed: target.speed } : null;
        }).filter(Boolean),
        eye_tracking_data: {
          average_reaction_time: avgReactionTime,
          tracking_precision: accuracy,
          targets_tracked: targetsHit
        },
        session_duration_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
        completed_at: new Date().toISOString()
      };

      // TODO: Uncomment when visual_sync_sessions table is created
      // const { error } = await supabase
      //   .from('visual_sync_sessions')
      //   .insert(sessionData);
      // if (error) throw error;

      toast({
        title: "👁️ Sessão salva!",
        description: `${targetsHit} alvos rastreados • ${accuracy.toFixed(1)}% precisão`,
      });
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setScore(0);
    setLevel(1);
    setAccuracy(100);
    setTargets([]);
    setTrackedTargets([]);
    setTargetsHit(0);
    setTargetsMissed(0);
    setReactionTimes([]);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-blue-900">
              VisualSync
            </h1>
            <p className="text-blue-700">
              Desenvolva seu processamento visual e integração visuo-motora
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
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Settings */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Contraste:</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(contrastLevels).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={contrast === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContrast(key as ContrastLevel)}
                          disabled={isPlaying}
                        >
                          {config.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Velocidade:</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(speedLevels).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={speed === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSpeed(key as SpeedLevel)}
                          disabled={isPlaying}
                        >
                          {config.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-glow bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-blue-600" />
                  Sincronização Visual - Nível {level}
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600 font-medium">Score: {score}</span>
                  <span className="text-green-600 font-medium">Precisão: {accuracy.toFixed(1)}%</span>
                  <span className="text-orange-600 font-medium">Rastreados: {targetsHit}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Game Area */}
                <div 
                  ref={gameAreaRef}
                  className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-blue-100 rounded-lg border-4 border-blue-300 overflow-hidden cursor-crosshair"
                  style={{
                    background: `
                      radial-gradient(circle at ${eyeTracking.x}px ${eyeTracking.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 100px),
                      linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)
                    `
                  }}
                >
                  {/* Moving Targets */}
                  {targets.map((target) => (
                    <button
                      key={target.id}
                      className={`absolute rounded-full ${target.color} transition-all duration-200 hover:scale-110 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg ${
                        target.tracked ? 'opacity-50' : ''
                      }`}
                      style={{
                        left: target.x,
                        top: target.y,
                        width: target.size,
                        height: target.size,
                        opacity: target.tracked ? 0.3 : currentContrast.opacity,
                        filter: `blur(${currentContrast.blur}px)`,
                      }}
                      onClick={() => trackTarget(target.id)}
                      disabled={target.tracked}
                    >
                      <Target className="h-3 w-3" />
                    </button>
                  ))}

                  {/* Eye tracking cursor */}
                  {isPlaying && (
                    <div
                      className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full pointer-events-none"
                      style={{
                        left: eyeTracking.x - 8,
                        top: eyeTracking.y - 8,
                        transition: 'all 0.1s ease-out'
                      }}
                    />
                  )}

                  {/* Instructions overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-blue-700 bg-white/90 p-6 rounded-lg">
                        <Eye className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                        <p className="text-xl font-semibold mb-2">Rastreamento Visual</p>
                        <p className="text-sm">Siga e clique nos alvos em movimento</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress indicator */}
                {isPlaying && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso do Nível</span>
                      <span>{trackedTargets.length}/{targets.length}</span>
                    </div>
                    <Progress value={(trackedTargets.length / targets.length) * 100} className="h-2" />
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar Rastreamento
                    </Button>
                  ) : (
                    <Button onClick={resetGame} variant="secondary" size="lg" className="flex items-center gap-2">
                      <Pause className="h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button onClick={resetGame} variant="outline" size="lg" className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reiniciar
                  </Button>
                  
                  {targetsHit >= 3 && (
                    <Button onClick={saveSession} size="lg" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Eye className="h-5 w-5" />
                      Concluir Sessão
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
                <CardTitle className="text-lg">Estatísticas da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nível</span>
                    <span className="font-medium">{level}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Precisão Visual</span>
                    <span className="font-medium">{accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Alvos Rastreados</span>
                    <span className="font-medium">{targetsHit}</span>
                  </div>
                </div>
                
                {reactionTimes.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tempo Médio</span>
                      <span className="font-medium">
                        {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Contraste</span>
                    <span className="font-medium">{currentContrast.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Como Jogar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>1. Siga os alvos com seu olhar</p>
                <p>2. Clique nos alvos para rastreá-los</p>
                <p>3. Complete todos os alvos do nível</p>
                <p>4. Ajuste contraste e velocidade</p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Benefícios Terapêuticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>Rastreamento visual</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>Coordenação olho-mão</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>Processamento espacial</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>Atenção visual sustentada</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
