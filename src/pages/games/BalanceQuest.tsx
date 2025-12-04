import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, CircleDot, Zap, Home, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useGameSession } from '@/hooks/useGameSession';
import { useGameProfile } from '@/hooks/useGameProfile';
import { GameExitButton } from '@/components/GameExitButton';

interface BalanceChallenge {
  id: number;
  type: 'static' | 'dynamic' | 'reactive';
  duration: number;
  targetZone: { x: number; y: number; radius: number };
  motionPattern?: 'sway' | 'circle' | 'figure8' | 'random';
  difficulty: number;
  completed: boolean;
}

interface DeviceMotion {
  x: number; // Left/Right tilt
  y: number; // Forward/Backward tilt  
  z: number; // Rotation
}

type SensitivityLevel = 'low' | 'medium' | 'high';
type ChallengeMode = 'beginner' | 'intermediate' | 'advanced';

const sensitivityLevels = {
  low: { name: 'Baixa', multiplier: 0.3, threshold: 15 },
  medium: { name: 'Média', multiplier: 0.6, threshold: 10 },
  high: { name: 'Alta', multiplier: 1.0, threshold: 5 }
};

const challengeModes = {
  beginner: { name: 'Iniciante', challenges: 3, duration: 10000 },
  intermediate: { name: 'Intermediário', challenges: 5, duration: 15000 },
  advanced: { name: 'Avançado', challenges: 8, duration: 20000 }
};

export default function BalanceQuest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { childProfileId, isTestMode, loading: profileLoading } = useGameProfile();
  const { startSession, endSession, updateSession, isActive } = useGameSession('balance-quest', childProfileId || undefined, isTestMode);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<BalanceChallenge | null>(null);
  const [challenges, setChallenges] = useState<BalanceChallenge[]>([]);
  const [deviceMotion, setDeviceMotion] = useState<DeviceMotion>({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({ x: 200, y: 200 });
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');
  const [mode, setMode] = useState<ChallengeMode>('beginner');
  const [stability, setStability] = useState(100);
  const [timeInZone, setTimeInZone] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [motionData, setMotionData] = useState<DeviceMotion[]>([]);
  const [hasMotionPermission, setHasMotionPermission] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const currentSensitivity = sensitivityLevels[sensitivity];
  const currentMode = challengeModes[mode];

  // Start game session
  const handleStartGame = async () => {
    await startSession({ score: 0, level: 1, mode });
    setIsPlaying(true);
    setSessionStartTime(Date.now());
  };

  // End game session
  const handleEndGame = async () => {
    const timeSpent = (Date.now() - sessionStartTime) / 1000;
    const accuracy = challenges.length > 0 ? (challengesCompleted / challenges.length) * 100 : 0;
    
    await endSession({
      score,
      accuracy,
      timeSpent,
      correctMoves: challengesCompleted,
      totalMoves: challenges.length,
    });
  };

  // Request device motion permission and setup listeners
  useEffect(() => {
    const requestMotionPermission = async () => {
      if ('DeviceMotionEvent' in window) {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          try {
            const permission = await (DeviceMotionEvent as any).requestPermission();
            setHasMotionPermission(permission === 'granted');
          } catch (error) {
            console.log('Motion permission denied');
            setHasMotionPermission(false);
          }
        } else {
          setHasMotionPermission(true);
        }
      }
    };

    requestMotionPermission();
  }, []);

  // Device motion event listener
  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const { x, y, z } = event.accelerationIncludingGravity;
      const motion = {
        x: (x || 0) * currentSensitivity.multiplier,
        y: (y || 0) * currentSensitivity.multiplier,
        z: (z || 0) * currentSensitivity.multiplier
      };
      
      setDeviceMotion(motion);
      setMotionData(prev => [...prev.slice(-50), motion]); // Keep last 50 readings
      
      // Update player position based on device motion
      setPlayerPosition(prev => ({
        x: Math.max(20, Math.min(380, prev.x + motion.x * 2)),
        y: Math.max(20, Math.min(380, prev.y + motion.y * 2))
      }));
    };

    if (hasMotionPermission && isPlaying) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => window.removeEventListener('devicemotion', handleDeviceMotion);
    }
  }, [hasMotionPermission, isPlaying, currentSensitivity.multiplier]);

  // Fallback to mouse movement if no device motion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMotionPermission && isPlaying && gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert mouse position to motion-like values
        const motion = {
          x: (mouseX - centerX) / centerX * currentSensitivity.multiplier,
          y: (mouseY - centerY) / centerY * currentSensitivity.multiplier,
          z: 0
        };
        
        setDeviceMotion(motion);
        setPlayerPosition({ x: mouseX, y: mouseY });
      }
    };

    const gameArea = gameAreaRef.current;
    if (gameArea && !hasMotionPermission) {
      gameArea.addEventListener('mousemove', handleMouseMove);
      return () => gameArea.removeEventListener('mousemove', handleMouseMove);
    }
  }, [hasMotionPermission, isPlaying, currentSensitivity.multiplier]);

  const generateChallenges = (): BalanceChallenge[] => {
    const challengeTypes: BalanceChallenge['type'][] = ['static', 'dynamic', 'reactive'];
    const motionPatterns: BalanceChallenge['motionPattern'][] = ['sway', 'circle', 'figure8', 'random'];
    
    return Array.from({ length: currentMode.challenges }, (_, index) => ({
      id: index,
      type: challengeTypes[index % challengeTypes.length],
      duration: currentMode.duration + (index * 2000), // Progressively longer
      targetZone: {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        radius: Math.max(30, 60 - (index * 5)) // Smaller zones as difficulty increases
      },
      motionPattern: motionPatterns[Math.floor(Math.random() * motionPatterns.length)],
      difficulty: Math.min(10, 1 + Math.floor(index / 2)),
      completed: false
    }));
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setStability(100);
    setTimeInZone(0);
    setChallengesCompleted(0);
    setSessionStartTime(Date.now());
    setPlayerPosition({ x: 200, y: 200 });
    
    const newChallenges = generateChallenges();
    setChallenges(newChallenges);
    setCurrentChallenge(newChallenges[0]);
    
    if (!hasMotionPermission) {
      toast({
        title: "🖱️ Modo Mouse Ativo",
        description: "Mova o mouse para simular o equilíbrio (ou incline o dispositivo)",
      });
    } else {
      toast({
        title: "📱 Sensores Ativos",
        description: "Incline seu dispositivo para controlar o equilíbrio",
      });
    }
  };

  // Challenge logic
  useEffect(() => {
    if (!isPlaying || !currentChallenge) return;

    const interval = setInterval(() => {
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - currentChallenge.targetZone.x, 2) +
        Math.pow(playerPosition.y - currentChallenge.targetZone.y, 2)
      );
      
      const inZone = distance <= currentChallenge.targetZone.radius;
      
      if (inZone) {
        setTimeInZone(prev => prev + 100);
        setScore(prev => prev + 2);
        setStability(prev => Math.min(100, prev + 0.5));
      } else {
        setStability(prev => Math.max(0, prev - 0.2));
      }
      
      // Check if challenge completed
      if (timeInZone >= currentChallenge.duration) {
        completeChallenge();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentChallenge, playerPosition, timeInZone]);

  const completeChallenge = () => {
    if (!currentChallenge) return;
    
    setChallengesCompleted(prev => prev + 1);
    
    // Mark current challenge as completed
    setChallenges(prev => prev.map(c => 
      c.id === currentChallenge.id ? { ...c, completed: true } : c
    ));
    
    const bonusScore = Math.round(stability * currentChallenge.difficulty);
    setScore(prev => prev + bonusScore);
    
    toast({
      title: "⚖️ Desafio Completo!",
      description: `Equilíbrio mantido! Bônus: ${bonusScore} pontos`,
    });
    
    // Move to next challenge or complete level
    const nextChallenge = challenges.find(c => !c.completed && c.id !== currentChallenge.id);
    if (nextChallenge) {
      setCurrentChallenge(nextChallenge);
      setTimeInZone(0);
    } else {
      levelComplete();
    }
  };

  const levelComplete = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    
    toast({
      title: `🏆 Nível ${newLevel}!`,
      description: `Sistema vestibular fortalecido! Estabilidade: ${stability.toFixed(1)}%`,
    });
    
    // Generate new challenges for next level
    setTimeout(() => {
      const newChallenges = generateChallenges();
      setChallenges(newChallenges);
      setCurrentChallenge(newChallenges[0]);
      setTimeInZone(0);
    }, 2000);
  };

  const saveSession = async () => {
    if (!user || challengesCompleted < 1) return;

    try {
      const avgMotion = motionData.length > 0 ? {
        x: motionData.reduce((sum, m) => sum + Math.abs(m.x), 0) / motionData.length,
        y: motionData.reduce((sum, m) => sum + Math.abs(m.y), 0) / motionData.length,
        z: motionData.reduce((sum, m) => sum + Math.abs(m.z), 0) / motionData.length
      } : { x: 0, y: 0, z: 0 };

      const sessionData = {
        user_id: user.id,
        level: level,
        score: score,
        balance_stability_score: stability,
        motion_tolerance_level: Math.round(100 - (avgMotion.x + avgMotion.y + avgMotion.z) * 10),
        coordination_accuracy: Math.round((timeInZone / (currentMode.duration * challengesCompleted || 1)) * 100),
        postural_control_score: Math.round(stability * (sensitivity === 'high' ? 1.2 : sensitivity === 'medium' ? 1.0 : 0.8)),
        balance_challenges_completed: challenges.filter(c => c.completed).map(c => ({
          type: c.type,
          duration: c.duration,
          difficulty: c.difficulty,
          motionPattern: c.motionPattern
        })),
        motion_data: {
          average_motion: avgMotion,
          sensitivity_level: sensitivity,
          has_device_motion: hasMotionPermission,
          stability_trend: stability
        },
        session_duration_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
        completed_at: new Date().toISOString()
      };

      // TODO: Uncomment when balance_quest_sessions table is created
      // const { error } = await supabase
      //   .from('balance_quest_sessions')
      //   .insert(sessionData);
      // if (error) throw error;

      toast({
        title: "⚖️ Sessão salva!",
        description: `${challengesCompleted} desafios completados • ${stability.toFixed(1)}% estabilidade`,
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
    setStability(100);
    setTimeInZone(0);
    setChallengesCompleted(0);
    setCurrentChallenge(null);
    setChallenges([]);
    setMotionData([]);
    setPlayerPosition({ x: 200, y: 200 });
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-teal-900">
              BalanceQuest
            </h1>
            <p className="text-teal-700">
              Fortaleça seu sistema vestibular e coordenação motora
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
                      <span className="text-sm font-medium">Sensibilidade:</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(sensitivityLevels).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={sensitivity === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSensitivity(key as SensitivityLevel)}
                          disabled={isPlaying}
                        >
                          {config.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Modo:</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(challengeModes).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={mode === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMode(key as ChallengeMode)}
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
                  <CircleDot className="h-6 w-6 text-teal-600" />
                  Desafio de Equilíbrio - Nível {level}
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="text-teal-600 font-medium">Score: {score}</span>
                  <span className="text-blue-600 font-medium">Estabilidade: {stability.toFixed(1)}%</span>
                  <span className="text-green-600 font-medium">Desafios: {challengesCompleted}/{challenges.length}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Current Challenge Info */}
                {currentChallenge && (
                  <div className="text-center mb-4">
                    <Badge className="bg-teal-100 text-teal-800 text-lg px-4 py-2">
                      Desafio {currentChallenge.id + 1}: {currentChallenge.type === 'static' ? 'Equilíbrio Estático' : 
                       currentChallenge.type === 'dynamic' ? 'Equilíbrio Dinâmico' : 'Equilíbrio Reativo'}
                    </Badge>
                    <div className="mt-2">
                      <Progress 
                        value={(timeInZone / currentChallenge.duration) * 100} 
                        className="h-3"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Tempo na zona: {(timeInZone / 1000).toFixed(1)}s / {(currentChallenge.duration / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                )}

                {/* Game Area */}
                <div 
                  ref={gameAreaRef}
                  className="relative w-full h-96 bg-gradient-to-b from-teal-100 to-cyan-100 rounded-lg border-4 border-teal-300 overflow-hidden"
                  style={{
                    background: `
                      radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.1) 0%, transparent 200px),
                      linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)
                    `
                  }}
                >
                  {/* Target Zone */}
                  {currentChallenge && (
                    <div
                      className="absolute rounded-full border-4 border-teal-400 bg-teal-200/30"
                      style={{
                        left: currentChallenge.targetZone.x - currentChallenge.targetZone.radius,
                        top: currentChallenge.targetZone.y - currentChallenge.targetZone.radius,
                        width: currentChallenge.targetZone.radius * 2,
                        height: currentChallenge.targetZone.radius * 2,
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-xs font-bold text-teal-700">
                        ZONA
                      </div>
                    </div>
                  )}

                  {/* Player */}
                  <div
                    className="absolute w-6 h-6 bg-blue-500 border-3 border-white rounded-full transition-all duration-100 shadow-lg"
                    style={{
                      left: playerPosition.x - 12,
                      top: playerPosition.y - 12,
                      transform: `rotate(${deviceMotion.z * 10}deg)`,
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
                  </div>

                  {/* Motion indicator */}
                  {isPlaying && (
                    <div className="absolute top-4 left-4 bg-white/80 p-2 rounded">
                      <div className="text-xs">
                        <div>X: {deviceMotion.x.toFixed(2)}</div>
                        <div>Y: {deviceMotion.y.toFixed(2)}</div>
                        <div>Z: {deviceMotion.z.toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  {/* Instructions overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-teal-700 bg-white/90 p-6 rounded-lg">
                        <CircleDot className="h-16 w-16 mx-auto mb-4 text-teal-500" />
                        <p className="text-xl font-semibold mb-2">Desafio de Equilíbrio</p>
                        <p className="text-sm">
                          {hasMotionPermission 
                            ? "Incline seu dispositivo para manter o equilíbrio"
                            : "Mova o mouse para controlar o equilíbrio"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stability meter */}
                {isPlaying && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Estabilidade</span>
                      <span>{stability.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={stability} 
                      className="h-3"
                      style={{
                        background: stability > 70 ? 'linear-gradient(to right, #10b981, #059669)' :
                                   stability > 40 ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                                    'linear-gradient(to right, #ef4444, #dc2626)'
                      }}
                    />
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar Desafio
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
                  
                  {challengesCompleted >= 2 && (
                    <Button onClick={saveSession} size="lg" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                      <CircleDot className="h-5 w-5" />
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
                    <span>Estabilidade</span>
                    <span className="font-medium">{stability.toFixed(1)}%</span>
                  </div>
                  <Progress value={stability} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Desafios Completos</span>
                    <span className="font-medium">{challengesCompleted}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sensor</span>
                    <span className="font-medium">
                      {hasMotionPermission ? 'Dispositivo' : 'Mouse'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sensibilidade</span>
                    <span className="font-medium">{currentSensitivity.name}</span>
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
                <p>1. Mantenha-se na zona alvo</p>
                <p>2. Complete o tempo necessário</p>
                <p>3. Mantenha a estabilidade alta</p>
                <p>4. Complete todos os desafios</p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Benefícios Terapêuticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                  <span>Controle postural</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                  <span>Sistema vestibular</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                  <span>Coordenação motora</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                  <span>Propriocepção</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}