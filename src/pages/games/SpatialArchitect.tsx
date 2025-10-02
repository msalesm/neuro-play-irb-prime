import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Box, RotateCw, Target, Trophy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';

interface SpatialChallenge {
  id: string;
  type: 'rotation' | 'construction' | 'perspective';
  level: number;
  pattern: number[][];
  target?: number[][];
  rotations?: number;
  description: string;
  maxTime: number;
}

const challenges: SpatialChallenge[] = [
  {
    id: 'rotation-1',
    type: 'rotation',
    level: 1,
    pattern: [[1, 0], [1, 1]],
    target: [[1, 1], [1, 0]],
    rotations: 1,
    description: 'Gire a peça 90° para formar a figura alvo',
    maxTime: 30000
  },
  {
    id: 'construction-1',
    type: 'construction',
    level: 1,
    pattern: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    description: 'Construa uma cruz usando os blocos disponíveis',
    maxTime: 45000
  },
  {
    id: 'perspective-1',
    type: 'perspective',
    level: 1,
    pattern: [[1, 1], [1, 0]],
    description: 'Como esta figura ficaria vista de cima?',
    maxTime: 40000
  },
  {
    id: 'rotation-2',
    type: 'rotation',
    level: 2,
    pattern: [[1, 1, 0], [0, 1, 1], [0, 0, 1]],
    target: [[0, 0, 1], [0, 1, 1], [1, 1, 0]],
    rotations: 2,
    description: 'Gire a peça 180° para formar a figura alvo',
    maxTime: 40000
  },
  {
    id: 'construction-2',
    type: 'construction',
    level: 2,
    pattern: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
    description: 'Construa um padrão em formato de X',
    maxTime: 60000
  },
  {
    id: 'perspective-2',
    type: 'perspective',
    level: 2,
    pattern: [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
    description: 'Como esta estrutura 3D ficaria vista de frente?',
    maxTime: 50000
  }
];

export default function SpatialArchitect() {
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [userPattern, setUserPattern] = useState<number[][]>([]);
  const [selectedTool, setSelectedTool] = useState<'place' | 'remove'>('place');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionData, setSessionData] = useState({
    rotationAccuracy: 0,
    constructionTime: [] as number[],
    perspectiveCorrect: 0,
    totalChallenges: 0,
    startTime: Date.now()
  });
  const [isComplete, setIsComplete] = useState(false);
  const [challengeStartTime, setChallengeStartTime] = useState(Date.now());

  const currentChallenge = challenges[currentChallengeIndex];

  useEffect(() => {
    if (currentChallenge) {
      const size = Math.max(currentChallenge.pattern.length, currentChallenge.pattern[0]?.length || 0);
      setUserPattern(Array(size).fill(null).map(() => Array(size).fill(0)));
      setTimeLeft(currentChallenge.maxTime);
      setChallengeStartTime(Date.now());
    }
  }, [currentChallengeIndex]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1000), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete) {
      handleTimeout();
    }
  }, [timeLeft]);

  const handleCellClick = (row: number, col: number) => {
    const newPattern = userPattern.map(r => [...r]);
    newPattern[row][col] = selectedTool === 'place' ? 1 : 0;
    setUserPattern(newPattern);
  };

  const rotatePattern = (pattern: number[][], times: number = 1): number[][] => {
    let result = pattern;
    for (let i = 0; i < times; i++) {
      const size = result.length;
      const rotated = Array(size).fill(null).map(() => Array(size).fill(0));
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          rotated[c][size - 1 - r] = result[r][c];
        }
      }
      result = rotated;
    }
    return result;
  };

  const checkSolution = () => {
    const completionTime = Date.now() - challengeStartTime;
    let isCorrect = false;

    switch (currentChallenge.type) {
      case 'rotation':
        isCorrect = JSON.stringify(userPattern) === JSON.stringify(currentChallenge.target);
        break;
      case 'construction':
        isCorrect = JSON.stringify(userPattern) === JSON.stringify(currentChallenge.pattern);
        break;
      case 'perspective':
        // For perspective challenges, accept the original pattern as correct
        isCorrect = JSON.stringify(userPattern) === JSON.stringify(currentChallenge.pattern);
        break;
    }

    return { isCorrect, completionTime };
  };

  const handleSubmit = async () => {
    const { isCorrect, completionTime } = checkSolution();
    
    if (isCorrect) {
      const timeBonus = Math.max(0, (currentChallenge.maxTime - completionTime) / 1000);
      const points = (currentChallenge.level * 50) + Math.round(timeBonus);
      setScore(prev => prev + points);
      
      setSessionData(prev => ({
        ...prev,
        totalChallenges: prev.totalChallenges + 1,
        [currentChallenge.type === 'rotation' ? 'rotationAccuracy' :
         currentChallenge.type === 'construction' ? 'constructionTime' :
         'perspectiveCorrect']: currentChallenge.type === 'construction' ? 
          [...prev.constructionTime, completionTime] :
          prev[currentChallenge.type === 'rotation' ? 'rotationAccuracy' : 'perspectiveCorrect'] + 1
      }));

      toast.success(`Correto! +${points} pontos`);
      
      if (sessionData.totalChallenges % 2 === 1) {
        setLevel(prev => prev + 1);
        toast.success("Nível aumentado! 🏗️");
      }
    } else {
      toast.error("Não foi dessa vez. Tente novamente!");
    }

    // Save behavioral data
    await saveBehavioralMetric({
      metricType: 'game_spatial_architect',
      category: 'spatial_processing',
      value: isCorrect ? 1 : 0,
      contextData: {
        challengeType: currentChallenge.type,
        level: currentChallenge.level,
        completionTime,
        correct: isCorrect,
        timeLeft: timeLeft
      }
    });

    setTimeout(() => {
      if (currentChallengeIndex < challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
      } else {
        completeGame();
      }
    }, 2000);
  };

  const handleTimeout = () => {
    toast.error("Tempo esgotado!");
    setTimeout(() => {
      if (currentChallengeIndex < challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
      } else {
        completeGame();
      }
    }, 2000);
  };

  const completeGame = async () => {
    setIsComplete(true);
    
    const accuracy = sessionData.totalChallenges > 0 ? 
      ((sessionData.rotationAccuracy + sessionData.perspectiveCorrect) / sessionData.totalChallenges) * 100 : 0;
    
    const avgConstructionTime = sessionData.constructionTime.length > 0 ?
      sessionData.constructionTime.reduce((a, b) => a + b, 0) / sessionData.constructionTime.length : 0;

    await saveBehavioralMetric({
      metricType: 'game_spatial_architect_complete',
      category: 'spatial_processing',
      value: Math.round(accuracy),
      contextData: {
        finalScore: score,
        finalLevel: level,
        rotationAccuracy: sessionData.rotationAccuracy,
        perspectiveAccuracy: sessionData.perspectiveCorrect,
        averageConstructionTime: avgConstructionTime,
        totalChallenges: sessionData.totalChallenges
      }
    });
  };

  const renderPattern = (pattern: number[][], isTarget: boolean = false) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${pattern[0]?.length || 0}, 1fr)` }}>
      {pattern.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-8 h-8 border-2 border-border rounded cursor-pointer transition-all ${
              cell === 1 
                ? (isTarget ? 'bg-green-500' : 'bg-primary') 
                : 'bg-background hover:bg-muted'
            }`}
            onClick={!isTarget ? () => handleCellClick(rowIndex, colIndex) : undefined}
          />
        ))
      )}
    </div>
  );

  if (isComplete) {
    const accuracy = sessionData.totalChallenges > 0 ? 
      ((sessionData.rotationAccuracy + sessionData.perspectiveCorrect) / sessionData.totalChallenges) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4">
        <Card className="max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Arquitetura Concluída! 🏗️</h2>
            <div className="space-y-3 mb-6">
              <p>Pontuação final: {score}</p>
              <p>Nível alcançado: {level}</p>
              <p>Precisão: {Math.round(accuracy)}%</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <Badge variant="secondary">Rotações</Badge>
                  <p className="text-lg font-semibold">{sessionData.rotationAccuracy}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Perspectiva</Badge>
                  <p className="text-lg font-semibold">{sessionData.perspectiveCorrect}</p>
                </div>
              </div>
            </div>
            <Button onClick={() => window.history.back()}>
              Voltar aos Jogos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Box className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold">Arquiteto Espacial</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge>Nível {level}</Badge>
              <Badge variant="secondary">{score} pontos</Badge>
              <Badge variant="outline">{Math.round(timeLeft / 1000)}s</Badge>
            </div>
          </div>

          <Progress value={(currentChallengeIndex / challenges.length) * 100} className="mb-6" />

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">{currentChallenge?.description}</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Target className="w-5 h-5" />
              <span>Tipo: {
                currentChallenge?.type === 'rotation' ? 'Rotação' :
                currentChallenge?.type === 'construction' ? 'Construção' :
                'Perspectiva'
              }</span>
            </div>
          </div>

          <div className="space-y-8 mb-6">
            {currentChallenge?.target && (
              <div className="text-center">
                <h4 className="font-semibold mb-4 text-green-600">Objetivo:</h4>
                {renderPattern(currentChallenge.target, true)}
              </div>
            )}
            
            {!currentChallenge?.target && (
              <div className="text-center">
                <h4 className="font-semibold mb-4 text-blue-600">Padrão Base:</h4>
                {renderPattern(currentChallenge.pattern, true)}
              </div>
            )}
            
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-primary">Sua Construção:</h4>
              {renderPattern(userPattern)}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              variant={selectedTool === 'place' ? "default" : "outline"}
              onClick={() => setSelectedTool('place')}
            >
              <Box className="w-4 h-4 mr-2" />
              Colocar Bloco
            </Button>
            <Button
              variant={selectedTool === 'remove' ? "default" : "outline"}
              onClick={() => setSelectedTool('remove')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Remover Bloco
            </Button>
          </div>

          <div className="text-center">
            <Button onClick={handleSubmit} size="lg">
              Verificar Solução
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Desafio {currentChallengeIndex + 1} de {challenges.length} • 
            Clique nas células para {selectedTool === 'place' ? 'adicionar' : 'remover'} blocos
          </div>
        </div>
      </Card>
    </div>
  );
}