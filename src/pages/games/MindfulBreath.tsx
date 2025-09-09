import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Heart, Star, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

const breathingPatterns = [
  { name: '4-7-8 Relaxamento', inhale: 4, hold: 7, exhale: 8, pause: 0 },
  { name: 'Respiração Quadrada', inhale: 4, hold: 4, exhale: 4, pause: 4 },
  { name: 'Respiração Simples', inhale: 3, hold: 0, exhale: 3, pause: 0 },
  { name: 'Respiração Energizante', inhale: 6, hold: 2, exhale: 4, pause: 2 },
];

export default function MindfulBreath() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycle, setCycle] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pattern = breathingPatterns[selectedPattern];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next phase
            setCurrentPhase(currentPhase => {
              const phases: BreathPhase[] = ['inhale', 'hold', 'exhale', 'pause'];
              const currentIndex = phases.indexOf(currentPhase);
              const nextPhase = phases[(currentIndex + 1) % phases.length];
              
              // Skip phases with 0 duration
              if (nextPhase === 'hold' && pattern.hold === 0) return 'exhale';
              if (nextPhase === 'pause' && pattern.pause === 0) {
                setCycle(prev => prev + 1);
                setTotalCycles(prev => prev + 1);
                return 'inhale';
              }
              
              if (nextPhase === 'inhale' && currentPhase === 'pause') {
                setCycle(prev => prev + 1);
                setTotalCycles(prev => prev + 1);
              }
              
              return nextPhase;
            });
            
            // Return duration for next phase
            const nextDurations = {
              'inhale': pattern.inhale,
              'hold': pattern.hold || pattern.exhale, // fallback if hold is 0
              'exhale': pattern.exhale,
              'pause': pattern.pause || pattern.inhale // fallback if pause is 0
            };
            
            return nextDurations[currentPhase as keyof typeof nextDurations];
          }
          return prev - 1;
        });
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentPhase, pattern]);

  const startSession = () => {
    setIsPlaying(true);
    setCurrentPhase('inhale');
    setTimeLeft(pattern.inhale);
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setCurrentPhase('inhale');
    setTimeLeft(pattern.inhale);
    setCycle(0);
    setSessionTime(0);
  };

  const completeSession = async () => {
    if (!user || totalCycles < 5) return; // Minimum 5 cycles to complete
    
    try {
      // Record therapy session
      await supabase.from('therapy_sessions').insert({
        user_id: user.id,
        session_type: 'breathing',
        title: `Sessão de ${pattern.name}`,
        content: {
          pattern: pattern.name,
          cycles_completed: totalCycles,
          duration_seconds: sessionTime,
          pattern_details: pattern
        },
        duration_minutes: Math.round(sessionTime / 60),
        completion_status: 'completed'
      });

      // Record activity
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'breathing_session',
        topic_name: pattern.name,
        content: `Completou ${totalCycles} ciclos em ${Math.round(sessionTime / 60)} minutos`
      });

      toast({
        title: "Sessão concluída! 🌟",
        description: `Você completou ${totalCycles} ciclos de respiração`,
      });

      resetSession();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro ao salvar sessão",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Inspire...';
      case 'hold': return 'Segure...';
      case 'exhale': return 'Expire...';
      case 'pause': return 'Pausa...';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'text-blue-600';
      case 'hold': return 'text-purple-600';
      case 'exhale': return 'text-green-600';
      case 'pause': return 'text-gray-600';
    }
  };

  const circleScale = () => {
    const maxTime = Math.max(pattern.inhale, pattern.hold, pattern.exhale, pattern.pause);
    const progress = timeLeft / maxTime;
    
    if (currentPhase === 'inhale') {
      return 0.5 + (1 - progress) * 0.5; // Grows from 0.5 to 1
    } else if (currentPhase === 'exhale') {
      return 1 - (1 - progress) * 0.5; // Shrinks from 1 to 0.5
    }
    return 1; // Hold and pause stay at full size
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-blue-900">
              MindfulBreath Adventures
            </h1>
            <p className="text-blue-700">
              Respire conscientemente e cultive sua calma interior
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/games" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Breathing Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-glow bg-white/80 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {pattern.name}
                </CardTitle>
                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <span>Inspire: {pattern.inhale}s</span>
                  {pattern.hold > 0 && <span>Segure: {pattern.hold}s</span>}
                  <span>Expire: {pattern.exhale}s</span>
                  {pattern.pause > 0 && <span>Pausa: {pattern.pause}s</span>}
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-8">
                {/* Breathing Circle */}
                <div className="flex justify-center">
                  <div 
                    className={`w-64 h-64 rounded-full bg-gradient-to-br from-blue-200 to-green-200 flex items-center justify-center transition-transform duration-1000 ease-in-out shadow-lg ${getPhaseColor()}`}
                    style={{ transform: `scale(${circleScale()})` }}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {timeLeft}
                      </div>
                      <div className="text-lg">
                        {getPhaseText()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!isPlaying ? (
                    <Button onClick={startSession} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar
                    </Button>
                  ) : (
                    <Button onClick={pauseSession} variant="secondary" size="lg" className="flex items-center gap-2">
                      <Pause className="h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  <Button onClick={resetSession} variant="outline" size="lg" className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reiniciar
                  </Button>
                  {totalCycles >= 5 && (
                    <Button onClick={completeSession} size="lg" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
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
            {/* Pattern Selection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Padrões de Respiração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {breathingPatterns.map((patternOption, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isPlaying) {
                        setSelectedPattern(index);
                        setTimeLeft(breathingPatterns[index].inhale);
                        resetSession();
                      }
                    }}
                    disabled={isPlaying}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedPattern === index 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-card hover:bg-muted border-border'
                    } ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-medium">{patternOption.name}</div>
                    <div className="text-sm opacity-80">
                      {patternOption.inhale}-{patternOption.hold || 0}-{patternOption.exhale}-{patternOption.pause || 0}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Sessão Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Ciclos Completos</span>
                    <Badge variant="secondary">{totalCycles}</Badge>
                  </div>
                  {totalCycles > 0 && (
                    <Progress value={(totalCycles / 10) * 100} className="h-2" />
                  )}
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Tempo de Sessão</span>
                    <span className="font-mono">{Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Ciclo Atual</span>
                    <span>{cycle + 1}</span>
                  </div>
                </div>
                {totalCycles >= 5 && (
                  <div className="text-green-600 text-sm font-medium text-center p-2 bg-green-50 rounded">
                    ✨ Sessão completa! Clique em "Concluir" para salvar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}