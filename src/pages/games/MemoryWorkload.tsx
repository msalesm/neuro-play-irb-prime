import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';

interface MemoryItem {
  id: string;
  position: number;
  color: string;
  order: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
const GRID_SIZE = 16; // 4x4 grid

export default function MemoryWorkload() {
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'input' | 'feedback'>('waiting');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<MemoryItem[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);
  const [sessionData, setSessionData] = useState({
    correctResponses: 0,
    totalResponses: 0,
    averageReactionTime: 0,
    maxLevel: 1,
    errors: 0
  });

  const sequenceLength = Math.min(3 + level, 8);

  const generateSequence = useCallback(() => {
    const newSequence: MemoryItem[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push({
        id: `item-${i}`,
        position: Math.floor(Math.random() * GRID_SIZE),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        order: i
      });
    }
    setSequence(newSequence);
  }, [sequenceLength]);

  const startRound = useCallback(() => {
    generateSequence();
    setUserSequence([]);
    setCurrentStep(0);
    setShowingIndex(0);
    setGameState('showing');
    setTimeLeft(sequenceLength * 1000);
  }, [generateSequence, sequenceLength]);

  const showSequence = useCallback(() => {
    if (showingIndex < sequence.length) {
      setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 1200); // Aumentado para melhor memorização
    } else {
      // Pausa de 800ms antes de permitir input
      setTimeout(() => {
        setGameState('input');
        setTimeLeft(sequenceLength * 2000);
      }, 800);
    }
  }, [showingIndex, sequence.length, sequenceLength]);

  const handleCellClick = (position: number) => {
    if (gameState !== 'input') return;

    const newUserSequence = [...userSequence, position];
    setUserSequence(newUserSequence);

    if (newUserSequence[currentStep] === sequence[currentStep].position) {
      if (currentStep === sequence.length - 1) {
        // Round completed successfully
        setGameState('feedback');
        const newScore = score + level * 10;
        setScore(newScore);
        
        setSessionData(prev => ({
          ...prev,
          correctResponses: prev.correctResponses + 1,
          totalResponses: prev.totalResponses + 1,
          maxLevel: Math.max(prev.maxLevel, level)
        }));

        // Save behavioral metric
        saveBehavioralMetric({
          metricType: 'working_memory',
          category: 'cognitive',
          value: (currentStep + 1) / sequence.length,
          contextData: {
            level,
            sequenceLength,
            score: newScore,
            accuracy: (sessionData.correctResponses + 1) / (sessionData.totalResponses + 1)
          },
          gameId: 'memory-workload'
        });

        toast.success(`Nível ${level} completo! +${level * 10} pontos`);
        setTimeout(() => {
          setLevel(prev => prev + 1);
          startRound();
        }, 2000);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Wrong answer
      setGameState('feedback');
      setSessionData(prev => ({
        ...prev,
        errors: prev.errors + 1,
        totalResponses: prev.totalResponses + 1
      }));

      // Save error metric
      saveBehavioralMetric({
        metricType: 'working_memory_error',
        category: 'cognitive',
        value: currentStep / sequence.length,
        contextData: {
          level,
          sequenceLength,
          errorPosition: currentStep,
          expectedPosition: sequence[currentStep].position,
          clickedPosition: position
        },
        gameId: 'memory-workload'
      });

      toast.error('Sequência incorreta. Tente novamente!');
      setTimeout(() => {
        if (level > 1) {
          setLevel(prev => prev - 1);
        }
        startRound();
      }, 2000);
    }
  };

  useEffect(() => {
    if (gameState === 'showing') {
      showSequence();
    }
  }, [gameState, showSequence]);

  useEffect(() => {
    if (timeLeft > 0 && (gameState === 'showing' || gameState === 'input')) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 100), 100);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && gameState === 'input') {
      handleCellClick(-1); // Timeout treated as wrong answer
    }
  }, [timeLeft, gameState]);

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      // Durante fase "showing": mostrar apenas a célula atual com cor e número
      const isCurrentShowing = gameState === 'showing' && 
        showingIndex > 0 && 
        sequence[showingIndex - 1]?.position === i;
      
      const sequenceItem = sequence.find(item => item.position === i);
      
      // Durante fase "input": verificar se o usuário já clicou nesta célula
      const userClickIndex = userSequence.indexOf(i);
      const wasClickedByUser = userClickIndex !== -1;

      // Determinar estilo baseado na fase do jogo
      let backgroundColor = '#f1f5f9'; // Cinza claro padrão
      let borderColor = '#cbd5e1';
      let showNumber = false;
      let numberToShow = 0;

      if (gameState === 'showing' && isCurrentShowing) {
        // Fase de memorização: mostrar cor e número da sequência
        backgroundColor = sequenceItem?.color || '#f1f5f9';
        borderColor = sequenceItem?.color || '#cbd5e1';
        showNumber = true;
        numberToShow = showingIndex;
      } else if (gameState === 'input' && wasClickedByUser) {
        // Fase de input: células clicadas ficam verdes com número da ordem
        backgroundColor = '#10b981'; // Verde
        borderColor = '#059669';
        showNumber = true;
        numberToShow = userClickIndex + 1;
      }

      cells.push(
        <div
          key={i}
          className={`
            w-16 h-16 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
            ${gameState === 'input' ? 'cursor-pointer hover:scale-110 hover:border-primary hover:shadow-lg' : 'cursor-default'}
            ${isCurrentShowing ? 'animate-pulse scale-110 shadow-xl' : ''}
            ${wasClickedByUser ? 'ring-2 ring-green-400' : ''}
          `}
          style={{
            backgroundColor,
            borderColor
          }}
          onClick={() => handleCellClick(i)}
        >
          {showNumber && (
            <div className="text-2xl font-bold text-white drop-shadow-md">
              {numberToShow}
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  const accuracy = sessionData.totalResponses > 0 
    ? (sessionData.correctResponses / sessionData.totalResponses * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Memória de Trabalho</h1>
              <p className="text-gray-600">Memorize e reproduza a sequência de cores e posições</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-sm text-gray-500">Pontos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{level}</div>
                <div className="text-sm text-gray-500">Nível</div>
              </div>
            </div>
          </div>

          {gameState !== 'waiting' && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tempo restante</span>
                <Timer className="w-4 h-4" />
              </div>
              <Progress 
                value={(timeLeft / (sequenceLength * (gameState === 'showing' ? 1000 : 2000))) * 100} 
                className="h-2"
              />
            </div>
          )}

          <div className="text-center mb-6">
            {gameState === 'waiting' && (
              <div>
                <p className="mb-4 text-gray-600">
                  Clique em "Iniciar" para começar. Memorize a sequência de cores e posições,
                  depois reproduza clicando nas células na ordem correta.
                </p>
                <Button onClick={startRound} size="lg">
                  Iniciar Teste
                </Button>
              </div>
            )}
            
            {gameState === 'showing' && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <AlertCircle className="w-5 h-5" />
                <span>Memorize a sequência... ({showingIndex}/{sequence.length})</span>
              </div>
            )}
            
            {gameState === 'input' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Clique nas células na ordem que foram mostradas</span>
                </div>
                <div className="text-sm text-gray-600">
                  Progresso: {userSequence.length}/{sequence.length} células clicadas
                </div>
              </div>
            )}
            
            {gameState === 'feedback' && (
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Preparando próximo nível...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 justify-center max-w-xs mx-auto mb-6">
            {renderGrid()}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <div className="text-lg font-bold text-emerald-600">{accuracy}%</div>
              <div className="text-sm text-gray-500">Precisão</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{sessionData.maxLevel}</div>
              <div className="text-sm text-gray-500">Nível Máximo</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{sessionData.errors}</div>
              <div className="text-sm text-gray-500">Erros</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}