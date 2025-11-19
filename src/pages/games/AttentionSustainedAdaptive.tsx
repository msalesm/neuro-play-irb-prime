import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, X, Circle, Square, Star, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameSession } from '@/hooks/useGameSession';
import { toast } from 'sonner';

const GAME_ID = 'attention-sustained-focus';

const SHAPES = [
  { Icon: Target, color: 'text-red-500', name: 'alvo' },
  { Icon: Circle, color: 'text-blue-500', name: 'círculo' },
  { Icon: Square, color: 'text-green-500', name: 'quadrado' },
  { Icon: Star, color: 'text-yellow-500', name: 'estrela' },
  { Icon: Heart, color: 'text-pink-500', name: 'coração' },
  { Icon: Zap, color: 'text-purple-500', name: 'raio' },
];

interface GameObject {
  id: string;
  Icon: any;
  color: string;
  name: string;
  isTarget: boolean;
  x: number;
  y: number;
  size: number;
}

export default function AttentionSustainedAdaptive() {
  const navigate = useNavigate();
  const [childProfileId, setChildProfileId] = useState<string>('test-child-id'); // TODO: Get from context/props
  
  const {
    sessionId,
    isActive,
    currentDifficulty,
    startSession,
    endSession,
    recordMetric,
  } = useGameSession(GAME_ID, childProfileId);

  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetShape, setTargetShape] = useState<typeof SHAPES[0] | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const roundStartTime = useRef<number>(0);

  // Configuração adaptativa baseada na dificuldade
  const getGameConfig = useCallback(() => {
    const baseTargets = 3 + Math.floor(currentDifficulty * 1.2);
    const baseDistractors = 2 + Math.floor(currentDifficulty * 1.8);
    
    return {
      totalObjects: Math.min(15, baseTargets + baseDistractors),
      targetCount: Math.min(8, Math.max(2, baseTargets)),
      targetDurationSeconds: Math.max(20, 35 - currentDifficulty * 2),
      roundsPerSession: 5,
    };
  }, [currentDifficulty]);

  // Iniciar jogo
  const handleStartGame = async () => {
    const sid = await startSession();
    if (sid) {
      setGameStarted(true);
      setRound(1);
      setScore(0);
      setLives(3);
      setTotalAttempts(0);
      setCorrectAttempts(0);
      startNewRound();
    }
  };

  // Iniciar nova rodada
  const startNewRound = useCallback(() => {
    const config = getGameConfig();
    
    // Escolher forma alvo
    const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setTargetShape(target);
    
    // Gerar objetos
    const newObjects: GameObject[] = [];
    const targetCount = config.targetCount;
    const distractorCount = config.totalObjects - targetCount;
    
    // Adicionar alvos
    for (let i = 0; i < targetCount; i++) {
      newObjects.push({
        id: `target-${i}`,
        ...target,
        isTarget: true,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        size: 40 + Math.random() * 20,
      });
    }
    
    // Adicionar distrações
    for (let i = 0; i < distractorCount; i++) {
      const distractor = SHAPES.filter(s => s.name !== target.name)[
        Math.floor(Math.random() * (SHAPES.length - 1))
      ];
      newObjects.push({
        id: `distractor-${i}`,
        ...distractor,
        isTarget: false,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        size: 40 + Math.random() * 20,
      });
    }
    
    // Embaralhar
    setObjects(newObjects.sort(() => Math.random() - 0.5));
    setTimeLeft(config.targetDurationSeconds);
    roundStartTime.current = Date.now();
  }, [getGameConfig]);

  // Clique em objeto
  const handleObjectClick = useCallback((obj: GameObject) => {
    if (!isActive) return;

    const reactionTime = Date.now() - roundStartTime.current;
    setTotalAttempts(prev => prev + 1);

    if (obj.isTarget) {
      // Acerto
      setCorrectAttempts(prev => prev + 1);
      setScore(prev => prev + (10 * currentDifficulty));
      setObjects(prev => prev.filter(o => o.id !== obj.id));
      
      recordMetric({
        event_type: 'correct',
        reaction_time_ms: reactionTime,
        event_data: { object_name: obj.name, round },
      });

      toast.success(`+${10 * currentDifficulty} pontos!`);

      // Verifica se completou a rodada
      if (objects.filter(o => o.isTarget).length <= 1) {
        nextRound();
      }
    } else {
      // Erro
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          endGame();
        }
        return newLives;
      });

      recordMetric({
        event_type: 'incorrect',
        reaction_time_ms: reactionTime,
        event_data: { object_name: obj.name, round },
      });

      toast.error('❌ Não é o alvo!');
    }
  }, [isActive, objects, round, currentDifficulty, recordMetric]);

  // Próxima rodada
  const nextRound = useCallback(() => {
    const config = getGameConfig();
    
    if (round >= config.roundsPerSession) {
      endGame();
    } else {
      setRound(prev => prev + 1);
      startNewRound();
      toast.success('🎯 Rodada completa! Próxima...');
    }
  }, [round, getGameConfig, startNewRound]);

  // Finalizar jogo
  const endGame = useCallback(async () => {
    if (!sessionId) return;

    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const maxScore = getGameConfig().roundsPerSession * getGameConfig().targetCount * 10 * currentDifficulty;

    await endSession({
      score,
      max_possible_score: maxScore,
      accuracy_percentage: accuracy,
      total_attempts: totalAttempts,
      correct_attempts: correctAttempts,
      incorrect_attempts: totalAttempts - correctAttempts,
      avg_reaction_time_ms: 0, // Calculado automaticamente pelo hook
      session_data: {
        rounds_completed: round,
        final_lives: lives,
        difficulty: currentDifficulty,
      },
    });

    setGameStarted(false);
  }, [sessionId, score, totalAttempts, correctAttempts, round, lives, currentDifficulty, endSession, getGameConfig]);

  // Timer
  useEffect(() => {
    if (!gameStarted || !isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Tempo esgotado, perde uma vida
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              endGame();
            } else {
              nextRound();
            }
            return newLives;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isActive, timeLeft, nextRound, endGame]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/games')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center space-y-6">
            <Target className="w-20 h-20 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Foco no Alvo</h1>
            <p className="text-lg text-muted-foreground">
              Encontre e clique apenas nas formas corretas! Desenvolva atenção sustentada e resistência a distrações.
            </p>

            <div className="bg-muted/50 p-6 rounded-lg space-y-3">
              <h3 className="font-semibold">Como Jogar:</h3>
              <ul className="text-left space-y-2">
                <li>• Uma forma alvo será mostrada no topo</li>
                <li>• Clique apenas nas formas que correspondem ao alvo</li>
                <li>• Evite clicar nas distrações</li>
                <li>• Complete todas as rodadas antes do tempo acabar</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {currentDifficulty}
                </div>
                <span>Nível Atual</span>
              </div>
            </div>

            <Button size="lg" onClick={handleStartGame} className="w-full">
              Começar Jogo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const config = getGameConfig();
  const progress = (round / config.roundsPerSession) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header com métricas */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Pontos</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rodada</p>
              <p className="text-2xl font-bold">{round}/{config.roundsPerSession}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="text-2xl font-bold text-orange-500">{timeLeft}s</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "w-8 h-8",
                    i < lives ? "fill-red-500 text-red-500" : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <Progress value={progress} className="mt-2 h-2" />
      </div>

      {/* Alvo */}
      {targetShape && (
        <div className="max-w-6xl mx-auto mb-4">
          <Card className="p-6 text-center bg-white">
            <p className="text-lg mb-3 font-semibold">Encontre todos:</p>
            <div className="flex justify-center items-center gap-3">
              <targetShape.Icon className={cn("w-16 h-16", targetShape.color)} />
              <span className="text-2xl font-bold">{targetShape.name.toUpperCase()}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Área de jogo */}
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-white rounded-lg shadow-lg" style={{ height: '500px' }}>
          {objects.map((obj) => {
            const { Icon } = obj;
            return (
              <button
                key={obj.id}
                onClick={() => handleObjectClick(obj)}
                className={cn(
                  "absolute transition-transform hover:scale-110 active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                )}
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  width: `${obj.size}px`,
                  height: `${obj.size}px`,
                }}
              >
                <Icon className={cn("w-full h-full", obj.color)} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
