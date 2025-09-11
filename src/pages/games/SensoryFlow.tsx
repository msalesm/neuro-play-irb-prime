import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Volume2, Waves, Home, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AudioPattern {
  id: number;
  frequency: number;
  duration: number;
  volume: number;
  sequence: number[];
  active: boolean;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';

const difficultyLevels = {
  easy: { name: 'Iniciante', sequences: 2, maxFreq: 800, minGap: 1000 },
  medium: { name: 'Intermediário', sequences: 4, maxFreq: 1200, minGap: 700 },
  hard: { name: 'Avançado', sequences: 6, maxFreq: 1600, minGap: 500 }
};

export default function SensoryFlow() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentPattern, setCurrentPattern] = useState<AudioPattern | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameSequence, setGameSequence] = useState<number[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentDifficulty = difficultyLevels[difficulty];

  useEffect(() => {
    // Initialize AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playTone = async (frequency: number, duration: number, volume: number = 0.3) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  const generateSequence = () => {
    const sequenceLength = Math.min(3 + Math.floor(level / 2), currentDifficulty.sequences);
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4 to B4
    const sequence = Array.from({ length: sequenceLength }, () => 
      Math.floor(Math.random() * frequencies.length)
    );
    return sequence;
  };

  const playSequence = async (sequence: number[]) => {
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i * currentDifficulty.minGap));
      await playTone(frequencies[sequence[i]], 300, 0.4);
    }
  };

  const startGame = async () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setAccuracy(100);
    setReactionTimes([]);
    setPatternsCompleted(0);
    setSessionStartTime(Date.now());
    
    // Start first pattern
    nextPattern();
  };

  const nextPattern = async () => {
    const sequence = generateSequence();
    setGameSequence(sequence);
    setUserSequence([]);
    setIsListening(false);
    
    // Play sequence
    await playSequence(sequence);
    
    // Allow user input
    setIsListening(true);
    startTimeRef.current = Date.now();
    
    toast({
      title: "Sua vez!",
      description: "Reproduza a sequência que você ouviu",
    });
  };

  const addToUserSequence = (noteIndex: number) => {
    if (!isListening) return;
    
    const reactionTime = Date.now() - startTimeRef.current;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    const newSequence = [...userSequence, noteIndex];
    setUserSequence(newSequence);
    
    // Check if sequence is complete
    if (newSequence.length === gameSequence.length) {
      checkSequence(newSequence);
    }
  };

  const checkSequence = (userSeq: number[]) => {
    const correct = userSeq.every((note, index) => note === gameSequence[index]);
    
    if (correct) {
      setScore(prev => prev + (10 * level * (difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1)));
      setPatternsCompleted(prev => prev + 1);
      
      // Level up every 3 correct sequences
      if ((patternsCompleted + 1) % 3 === 0) {
        setLevel(prev => prev + 1);
        toast({
          title: `🎵 Nível ${level + 1}!`,
          description: "Sua percepção auditiva está melhorando!",
        });
      }
      
      // Calculate new accuracy
      const totalPatterns = patternsCompleted + 1;
      setAccuracy(prev => ((prev * (totalPatterns - 1)) + 100) / totalPatterns);
      
      setTimeout(() => {
        nextPattern();
      }, 1500);
    } else {
      // Decrease accuracy
      const totalPatterns = patternsCompleted + 1;
      setAccuracy(prev => ((prev * (totalPatterns - 1)) + 0) / totalPatterns);
      
      toast({
        title: "Tente novamente",
        description: "Escute com atenção a sequência",
        variant: "destructive"
      });
      
      setTimeout(() => {
        nextPattern();
      }, 2000);
    }
    
    setIsListening(false);
  };

  const saveSession = async () => {
    if (!user || patternsCompleted < 1) return;

    try {
      const avgReactionTime = reactionTimes.length > 0 ? 
        reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;

      const sessionData = {
        user_id: user.id,
        level: level,
        score: score,
        accuracy_percentage: accuracy,
        reaction_time_avg_ms: Math.round(avgReactionTime),
        frequency_discrimination_score: Math.round((accuracy / 100) * level * 10),
        temporal_processing_score: Math.round(100 - (avgReactionTime / 50)),
        audio_patterns_completed: gameSequence,
        difficulty_progression: { difficulty, patterns_completed: patternsCompleted },
        session_duration_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sensory_flow_sessions')
        .insert(sessionData);

      if (error) throw error;

      toast({
        title: "🎵 Sessão salva!",
        description: `${patternsCompleted} padrões completados • ${accuracy.toFixed(1)}% precisão`,
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
    setUserSequence([]);
    setGameSequence([]);
    setIsListening(false);
    setPatternsCompleted(0);
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

  const noteNames = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
  const noteColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-purple-900">
              SensoryFlow
            </h1>
            <p className="text-purple-700">
              Desenvolva seu processamento auditivo através de padrões sonoros
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
            {/* Difficulty Settings */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Dificuldade:</span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(difficultyLevels).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={difficulty === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDifficulty(key as DifficultyLevel)}
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
                  <Waves className="h-6 w-6 text-purple-600" />
                  Processamento Auditivo - Nível {level}
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-600 font-medium">Score: {score}</span>
                  <span className="text-blue-600 font-medium">Precisão: {accuracy.toFixed(1)}%</span>
                  <span className="text-green-600 font-medium">Padrões: {patternsCompleted}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Game Status */}
                <div className="text-center mb-6">
                  {!isPlaying && (
                    <div className="space-y-4">
                      <Volume2 className="h-16 w-16 mx-auto text-purple-500" />
                      <p className="text-xl font-semibold text-purple-700">
                        Pronto para treinar seu ouvido?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Escute os padrões sonoros e reproduza-os na ordem correta
                      </p>
                    </div>
                  )}
                  
                  {isPlaying && !isListening && (
                    <div className="space-y-2">
                      <div className="animate-pulse text-2xl">🎵</div>
                      <p className="text-lg font-medium">Escutando padrão...</p>
                    </div>
                  )}
                  
                  {isListening && (
                    <div className="space-y-2">
                      <div className="text-2xl">🎹</div>
                      <p className="text-lg font-medium">Sua vez! Reproduza a sequência</p>
                    </div>
                  )}
                </div>

                {/* Note Buttons */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {noteNames.map((note, index) => (
                    <Button
                      key={index}
                      className={`h-16 ${noteColors[index]} hover:scale-105 transition-transform text-white font-bold border-2 border-white shadow-md`}
                      onClick={() => {
                        playTone([261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88][index], 300);
                        addToUserSequence(index);
                      }}
                      disabled={!isListening}
                    >
                      {note}
                    </Button>
                  ))}
                </div>

                {/* Sequence Display */}
                {userSequence.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Sua sequência:</p>
                    <div className="flex gap-1 flex-wrap">
                      {userSequence.map((noteIndex, index) => (
                        <Badge key={index} className={noteColors[noteIndex]}>
                          {noteNames[noteIndex]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar
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
                  
                  {patternsCompleted >= 3 && (
                    <Button onClick={saveSession} size="lg" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                      <Volume2 className="h-5 w-5" />
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
                    <span>Nível Atual</span>
                    <span className="font-medium">{level}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Precisão</span>
                    <span className="font-medium">{accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Padrões Completados</span>
                    <span className="font-medium">{patternsCompleted}</span>
                  </div>
                </div>
                
                {reactionTimes.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tempo de Reação Médio</span>
                      <span className="font-medium">
                        {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Como Jogar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>1. Escute atentamente a sequência de notas</p>
                <p>2. Reproduza a sequência na ordem correta</p>
                <p>3. Complete padrões para subir de nível</p>
                <p>4. Melhore sua precisão e velocidade</p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Benefícios Terapêuticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                  <span>Discriminação de frequências</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                  <span>Processamento sequencial</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                  <span>Memória auditiva de trabalho</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                  <span>Atenção auditiva sustentada</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}