import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Zap, Star, Home, Target, Settings, Trophy, Focus } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFocusForestStats } from "@/hooks/useFocusForestStats";
import { FocusForestStats } from "@/components/FocusForestStats";
import { FocusForestAchievements } from "@/components/FocusForestAchievements";

interface FocusPower {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  unlockTime: number; // seconds of sustained attention required
}

interface QuestTarget {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'basic' | 'power' | 'checkpoint';
  color: string;
  active: boolean;
  timeLeft: number;
  focusRequired: number; // sustained attention time needed
}

interface Biome {
  name: string;
  background: string;
  unlockRequirement: number; // total focus time in minutes
  description: string;
  powerUps: string[];
}

const focusPowers: FocusPower[] = [
  { id: 1, name: 'Laser Focus', description: 'Aumenta precisão por 30 segundos', color: 'bg-blue-500', icon: '🔷', unlockTime: 30 },
  { id: 2, name: 'Tempo Expandido', description: 'Desacelera alvos por 20 segundos', color: 'bg-purple-500', icon: '⏰', unlockTime: 60 },
  { id: 3, name: 'Zona de Calma', description: 'Previne distrações por 45 segundos', color: 'bg-green-500', icon: '🧘', unlockTime: 120 },
  { id: 4, name: 'Multiplicador', description: 'Dobra pontos por 15 segundos', color: 'bg-orange-500', icon: '✨', unlockTime: 180 }
];

const questBiomes: Biome[] = [
  { 
    name: 'Jardim da Concentração', 
    background: 'from-green-200 to-blue-200',
    unlockRequirement: 0,
    description: 'Onde a jornada do foco começa',
    powerUps: ['Laser Focus']
  },
  { 
    name: 'Floresta da Atenção', 
    background: 'from-emerald-300 to-teal-300',
    unlockRequirement: 15,
    description: 'Árvores antigas guardam segredos da concentração',
    powerUps: ['Laser Focus', 'Tempo Expandido']
  },
  { 
    name: 'Montanhas da Perseverança', 
    background: 'from-slate-300 to-purple-300',
    unlockRequirement: 45,
    description: 'Picos desafiadores testam sua determinação',
    powerUps: ['Tempo Expandido', 'Zona de Calma']
  },
  { 
    name: 'Cristais da Maestria', 
    background: 'from-purple-300 to-pink-300',
    unlockRequirement: 90,
    description: 'O domínio absoluto do foco é alcançado aqui',
    powerUps: ['Zona de Calma', 'Multiplicador']
  },
  { 
    name: 'Reino Infinito', 
    background: 'from-gold-200 to-amber-300',
    unlockRequirement: 180,
    description: 'Para mestres do foco - sem limites',
    powerUps: ['Laser Focus', 'Tempo Expandido', 'Zona de Calma', 'Multiplicador']
  }
];

type DifficultyMode = 'adaptive' | 'easy' | 'normal' | 'hard';

export default function FocusQuest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stats, achievements, loading, saveGameSession } = useFocusForestStats();
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBiome, setCurrentBiome] = useState(0);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<QuestTarget[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [focusTime, setFocusTime] = useState(0); // Sustained focus time
  const [lastTargetHit, setLastTargetHit] = useState(0);
  const [focusStreak, setFocusStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('adaptive');
  
  // Focus powers
  const [availablePowers, setAvailablePowers] = useState<FocusPower[]>([]);
  const [activePowers, setActivePowers] = useState<{[key: number]: number}>({});
  
  // Adaptive difficulty
  const [playerProfile, setPlayerProfile] = useState({
    averageReactionTime: 1000,
    preferredTargetSize: 50,
    optimalSessionLength: 300, // 5 minutes
    distractionLevel: 'low'
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const lastFocusUpdate = useRef(Date.now());

  const currentBiomeData = questBiomes[Math.min(currentBiome, questBiomes.length - 1)];
  
  // Check if biome is unlocked based on total focus time
  const isBiomeUnlocked = (biomeIndex: number) => {
    const totalFocusMinutes = stats?.totalSessions ? 
      (stats.totalSessions * 5) / 60 : 0; // Rough estimate
    return totalFocusMinutes >= questBiomes[biomeIndex].unlockRequirement;
  };

  // Adaptive difficulty adjustment
  useEffect(() => {
    if (isPlaying) {
      const now = Date.now();
      const timeSinceLastHit = now - lastTargetHit;
      
      // Track sustained focus
      if (timeSinceLastHit < 3000) { // Within 3 seconds of last target
        setFocusTime(prev => prev + (now - lastFocusUpdate.current));
        setFocusStreak(prev => prev + 1);
      } else if (timeSinceLastHit > 8000) { // More than 8 seconds without activity
        setFocusStreak(0);
      }
      
      lastFocusUpdate.current = now;
    }
  }, [isPlaying, lastTargetHit]);

  // Game loop
  useEffect(() => {
    let gameInterval: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;
    let powerInterval: NodeJS.Timeout;

    if (isPlaying) {
      // Main game timer
      gameInterval = setInterval(() => {
        setGameTime(prev => prev + 100);
      }, 100);

      // Adaptive spawn rate based on performance
      const baseSpawnRate = difficulty === 'adaptive' ? 
        Math.max(1000, 3000 - (focusStreak * 100)) : 2500;
      
      spawnInterval = setInterval(() => {
        spawnQuestTarget();
      }, baseSpawnRate);

      // Power management
      powerInterval = setInterval(() => {
        updatePowers();
      }, 1000);

      // Update active targets
      const targetUpdate = setInterval(() => {
        setTargets(prev => prev.map(target => ({
          ...target,
          timeLeft: target.timeLeft - 100
        })).filter(target => {
          if (target.timeLeft <= 0) {
            // Miss - reset focus streak
            setFocusStreak(0);
            return false;
          }
          return true;
        }));
      }, 100);

      return () => {
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        clearInterval(powerInterval);
        clearInterval(targetUpdate);
      };
    }
  }, [isPlaying, focusStreak, difficulty]);

  const spawnQuestTarget = () => {
    if (!gameAreaRef.current) return;

    setTargets(prev => {
      const maxTargets = focusStreak > 10 ? 3 : focusStreak > 5 ? 2 : 1;
      
      if (prev.length >= maxTargets) return prev;

      const rect = gameAreaRef.current!.getBoundingClientRect();
      
      // Adaptive target sizing
      const baseSize = difficulty === 'adaptive' ? 
        Math.max(35, playerProfile.preferredTargetSize - (focusStreak * 2)) : 45;
      
      const targetTypes = ['basic', 'power', 'checkpoint'] as const;
      const targetType = Math.random() < 0.1 ? 'checkpoint' : 
                         Math.random() < 0.3 ? 'power' : 'basic';
      
      const colors = {
        basic: 'bg-gradient-to-r from-blue-400 to-cyan-400',
        power: 'bg-gradient-to-r from-purple-400 to-pink-400',
        checkpoint: 'bg-gradient-to-r from-green-400 to-emerald-400'
      };

      const newTarget: QuestTarget = {
        id: targetIdRef.current++,
        x: Math.random() * (rect.width - baseSize),
        y: Math.random() * (rect.height - baseSize),
        size: baseSize,
        type: targetType,
        color: colors[targetType],
        active: true,
        timeLeft: targetType === 'checkpoint' ? 4000 : 
                  targetType === 'power' ? 3000 : 2500,
        focusRequired: targetType === 'checkpoint' ? 2 : 1
      };

      return [...prev, newTarget];
    });
  };

  const hitTarget = (targetId: number) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    setTargets(prev => prev.filter(t => t.id !== targetId));
    setLastTargetHit(Date.now());
    
    // Score calculation with bonuses
    const baseScore = target.type === 'checkpoint' ? 50 : 
                      target.type === 'power' ? 25 : 10;
    
    const streakMultiplier = Math.min(3, 1 + (focusStreak / 20));
    const biomeMultiplier = 1 + (currentBiome * 0.2);
    
    const finalScore = Math.round(baseScore * streakMultiplier * biomeMultiplier);
    setScore(prev => prev + finalScore);

    // Handle special target types
    if (target.type === 'power') {
      unlockRandomPower();
    } else if (target.type === 'checkpoint') {
      // Checkpoint saves progress and grants bonus focus time
      setFocusTime(prev => prev + 5000); // 5 seconds bonus
      
      toast({
        title: "🏁 Checkpoint alcançado!",
        description: `+5 segundos de foco • Progresso salvo`,
      });
    }

    // Check for biome progression
    const totalFocusSeconds = focusTime / 1000;
    const requiredMinutes = questBiomes[currentBiome + 1]?.unlockRequirement;
    
    if (requiredMinutes && totalFocusSeconds >= requiredMinutes * 60) {
      unlockNextBiome();
    }
  };

  const unlockRandomPower = () => {
    const availablePowerIds = focusPowers
      .filter(p => (focusTime / 1000) >= p.unlockTime)
      .map(p => p.id);
    
    if (availablePowerIds.length === 0) return;
    
    const randomPowerId = availablePowerIds[Math.floor(Math.random() * availablePowerIds.length)];
    const power = focusPowers.find(p => p.id === randomPowerId);
    
    if (power) {
      setActivePowers(prev => ({
        ...prev,
        [power.id]: Date.now() + (power.name.includes('30') ? 30000 : 
                                   power.name.includes('20') ? 20000 :
                                   power.name.includes('45') ? 45000 : 15000)
      }));
      
      toast({
        title: `🔥 ${power.name} ativado!`,
        description: power.description,
      });
    }
  };

  const unlockNextBiome = () => {
    if (currentBiome < questBiomes.length - 1) {
      setCurrentBiome(prev => prev + 1);
      toast({
        title: `🌟 Novo Bioma Desbloqueado!`,
        description: `${questBiomes[currentBiome + 1].name} - ${questBiomes[currentBiome + 1].description}`,
      });
    }
  };

  const updatePowers = () => {
    const now = Date.now();
    setActivePowers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(powerId => {
        if (updated[Number(powerId)] <= now) {
          delete updated[Number(powerId)];
        }
      });
      return updated;
    });
  };

  const startGame = () => {
    setTargets([]);
    setIsPlaying(true);
    setLastTargetHit(Date.now());
    setTimeout(spawnQuestTarget, 1000);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setTargets([]);
    setScore(0);
    setGameTime(0);
    setFocusTime(0);
    setFocusStreak(0);
    setActivePowers({});
  };

  const completeSession = async () => {
    if (!user || focusTime < 30000) return; // Minimum 30 seconds sustained focus
    
    try {
      const sessionData = {
        level: currentBiome + 1,
        score: score,
        hits: focusStreak,
        misses: 0,
        accuracy: focusStreak > 0 ? 95 : 0, // High accuracy for focus-based game
        duration_seconds: Math.round(gameTime / 1000),
        trees_grown: Math.round(focusTime / 10000), // Convert focus time to trees
        targets_hit_sequence: [focusStreak],
        difficulty_modifier: difficulty
      };

      await saveGameSession(sessionData);

      toast({
        title: "🏆 Missão Focus Quest Completa!",
        description: `${Math.round(focusTime / 1000)} segundos de foco sustentado • Bioma: ${currentBiomeData.name}`,
      });

      resetGame();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
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
              Para jogar Focus Quest, você precisa fazer login.
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Focus Quest
            </h1>
            <p className="text-indigo-700">
              Desbloqueie poderes através da concentração sustentada
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
            {/* Biome Selection */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <Focus className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold">Biomas Desbloqueados:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {questBiomes.map((biome, index) => (
                    <Button
                      key={index}
                      variant={currentBiome === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isBiomeUnlocked(index) && !isPlaying) {
                          setCurrentBiome(index);
                        }
                      }}
                      disabled={!isBiomeUnlocked(index) || isPlaying}
                      className="text-xs"
                    >
                      {biome.name}
                      {!isBiomeUnlocked(index) && <span className="ml-1">🔒</span>}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Area */}
            <Card className="shadow-glow bg-white/90 backdrop-blur">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-indigo-600" />
                    {currentBiomeData.name}
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <Badge className="bg-indigo-100 text-indigo-800">
                      Foco: {Math.round(focusTime / 1000)}s
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      Score: {score.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{currentBiomeData.description}</p>
              </CardHeader>
              <CardContent>
                <div 
                  ref={gameAreaRef}
                  className={`relative w-full h-96 bg-gradient-to-br ${currentBiomeData.background} rounded-lg border-2 border-indigo-300 overflow-hidden cursor-crosshair transition-all duration-1000`}
                >
                  {/* Active Powers Display */}
                  {Object.keys(activePowers).length > 0 && (
                    <div className="absolute top-4 left-4 space-y-2">
                      {Object.entries(activePowers).map(([powerId, endTime]) => {
                        const power = focusPowers.find(p => p.id === Number(powerId));
                        const remaining = Math.max(0, endTime - Date.now());
                        return power ? (
                          <Badge key={powerId} className="bg-yellow-100 text-yellow-800">
                            {power.icon} {power.name} ({Math.ceil(remaining / 1000)}s)
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Focus Streak Indicator */}
                  {focusStreak > 5 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-orange-100 text-orange-800">
                        🔥 Streak x{focusStreak}
                      </Badge>
                    </div>
                  )}

                  {/* Quest Targets */}
                  {targets.map((target) => (
                    <button
                      key={target.id}
                      className={`absolute rounded-full ${target.color} shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center text-white font-bold border-2 border-white/50`}
                      style={{
                        left: target.x,
                        top: target.y,
                        width: target.size,
                        height: target.size,
                        opacity: Math.max(0.3, target.timeLeft / (target.type === 'checkpoint' ? 4000 : 2500)),
                      }}
                      onClick={() => hitTarget(target.id)}
                    >
                      {target.type === 'checkpoint' ? '🏁' : 
                       target.type === 'power' ? '⚡' : 
                       <Target className="h-4 w-4" />}
                    </button>
                  ))}

                  {/* No targets message */}
                  {!isPlaying && targets.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-indigo-700 bg-white/80 rounded-lg p-8">
                        <Zap className="h-16 w-16 mx-auto mb-4 text-indigo-500" />
                        <p className="text-xl font-semibold mb-2">Sua aventura de foco aguarda...</p>
                        <p className="text-sm">Clique em "Iniciar Quest" para começar</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Iniciar Quest
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
                  {focusTime >= 30000 && (
                    <Button onClick={completeSession} size="lg" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <Trophy className="h-5 w-5" />
                      Completar Quest
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Session Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Focus className="h-5 w-5 text-indigo-600" />
                  Sessão Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Foco Sustentado</span>
                    <span className="text-sm font-semibold">{Math.round(focusTime / 1000)}s</span>
                  </div>
                  <Progress value={(focusTime / 180000) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Streak Atual</span>
                    <Badge variant="secondary">{focusStreak}</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo Total</span>
                    <span className="text-sm font-mono">
                      {Math.floor(gameTime / 60000)}:{((gameTime / 1000) % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Powers */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Poderes de Foco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {focusPowers.map((power) => {
                  const isUnlocked = (focusTime / 1000) >= power.unlockTime;
                  const isActive = activePowers[power.id];
                  
                  return (
                    <div key={power.id} className={`p-3 rounded-lg border transition-all ${
                      isActive ? 'bg-yellow-50 border-yellow-300' :
                      isUnlocked ? 'bg-card border-border' : 'bg-muted border-muted opacity-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{power.icon}</span>
                        <span className="font-medium text-sm">{power.name}</span>
                        {!isUnlocked && <span className="text-xs">🔒</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{power.description}</p>
                      {!isUnlocked && (
                        <p className="text-xs text-blue-600">
                          Desbloqueie com {power.unlockTime}s de foco
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Overall Stats */}
            <FocusForestStats 
              stats={stats}
              currentSession={{
                hits: focusStreak,
                misses: 0,
                accuracy: focusStreak > 0 ? 95 : 0,
                treesGrown: Math.round(focusTime / 10000),
                level: currentBiome + 1
              }}
            />

            <FocusForestAchievements 
              achievements={achievements}
              currentSession={{
                hits: focusStreak,
                accuracy: focusStreak > 0 ? 95 : 0,
                level: currentBiome + 1,
                duration_seconds: Math.round(gameTime / 1000)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}