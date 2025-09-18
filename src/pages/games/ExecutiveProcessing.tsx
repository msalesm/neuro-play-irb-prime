import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';

interface TowerPuzzle {
  id: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  initialState: number[][];
  goalState: number[][];
  minMoves: number;
  description: string;
}

const puzzles: TowerPuzzle[] = [
  {
    id: 'tower-1',
    difficulty: 'basic',
    initialState: [[3, 2, 1], [], []],
    goalState: [[], [], [3, 2, 1]],
    minMoves: 7,
    description: 'Mova todos os discos para a torre da direita'
  },
  {
    id: 'tower-2', 
    difficulty: 'basic',
    initialState: [[2, 1], [], []],
    goalState: [[], [2, 1], []],
    minMoves: 3,
    description: 'Mova os discos para a torre do meio'
  },
  {
    id: 'tower-3',
    difficulty: 'intermediate',
    initialState: [[4, 3, 2, 1], [], []],
    goalState: [[], [], [4, 3, 2, 1]],
    minMoves: 15,
    description: 'Mova todos os discos para a última torre'
  },
  {
    id: 'tower-4',
    difficulty: 'intermediate', 
    initialState: [[3, 1], [2], []],
    goalState: [[], [], [3, 2, 1]],
    minMoves: 5,
    description: 'Reorganize os discos na ordem correta'
  },
  {
    id: 'tower-5',
    difficulty: 'advanced',
    initialState: [[4, 2], [3, 1], []],
    goalState: [[], [], [4, 3, 2, 1]],
    minMoves: 9,
    description: 'Combine e organize todos os discos'
  }
];

export default function ExecutiveProcessing() {
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [towers, setTowers] = useState<number[][]>([[], [], []]);
  const [selectedTower, setSelectedTower] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [completedPuzzles, setCompletedPuzzles] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [sessionData, setSessionData] = useState({
    planningTime: [] as number[],
    executionErrors: 0,
    averageMovesExcess: 0,
    impulsiveActions: 0
  });
  const [isComplete, setIsComplete] = useState(false);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  useEffect(() => {
    if (currentPuzzle) {
      setTowers(currentPuzzle.initialState.map(tower => [...tower]));
      setMoveCount(0);
      setStartTime(Date.now());
      setSelectedTower(null);
    }
  }, [currentPuzzleIndex]);

  const handleTowerClick = (towerIndex: number) => {
    if (selectedTower === null) {
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
      }
    } else {
      if (selectedTower === towerIndex) {
        setSelectedTower(null);
      } else {
        moveDisk(selectedTower, towerIndex);
        setSelectedTower(null);
      }
    }
  };

  const moveDisk = (fromTower: number, toTower: number) => {
    const newTowers = towers.map(tower => [...tower]);
    const disk = newTowers[fromTower].pop();
    
    if (!disk) return;

    // Check if move is valid
    const topDisk = newTowers[toTower][newTowers[toTower].length - 1];
    if (topDisk && disk > topDisk) {
      toast.error("Não é possível colocar um disco maior sobre um menor!");
      setSessionData(prev => ({ ...prev, executionErrors: prev.executionErrors + 1 }));
      return;
    }

    newTowers[toTower].push(disk);
    setTowers(newTowers);
    setMoveCount(prev => prev + 1);

    // Check if puzzle is solved
    if (JSON.stringify(newTowers) === JSON.stringify(currentPuzzle.goalState)) {
      const completionTime = Date.now() - startTime;
      const efficiency = currentPuzzle.minMoves / moveCount;
      const score = Math.round(efficiency * 100 * (completionTime < 30000 ? 1.2 : 1));
      
      setTotalScore(prev => prev + score);
      setCompletedPuzzles(prev => prev + 1);
      
      toast.success(`Puzzle resolvido! ${moveCount} movimentos (mínimo: ${currentPuzzle.minMoves})`);
      
      setTimeout(() => {
        if (currentPuzzleIndex < puzzles.length - 1) {
          setCurrentPuzzleIndex(prev => prev + 1);
        } else {
          completeAssessment();
        }
      }, 2000);
    }
  };

  const completeAssessment = async () => {
    setIsComplete(true);
    
    const averageEfficiency = completedPuzzles > 0 ? (totalScore / completedPuzzles) / 100 : 0;
    const executiveScore = Math.round(averageEfficiency * 100);

    await saveBehavioralMetric({
      metricType: 'diagnostic_executive_processing',
      category: 'executive_functions',
      value: executiveScore,
      contextData: {
        puzzlesCompleted: completedPuzzles,
        totalScore,
        averageEfficiency,
        executionErrors: sessionData.executionErrors,
        condition: 'executive_processing_assessment'
      }
    });

    toast.success("Avaliação de Processamento Executivo concluída!");
  };

  const renderTower = (towerIndex: number) => (
    <div 
      className={`flex flex-col items-center justify-end h-48 w-24 border-2 border-border rounded-lg cursor-pointer transition-all ${
        selectedTower === towerIndex ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
      }`}
      onClick={() => handleTowerClick(towerIndex)}
    >
      <div className="flex flex-col-reverse items-center space-y-reverse space-y-1 p-2">
        {towers[towerIndex].map((disk, index) => (
          <div
            key={index}
            className={`h-6 rounded-full border-2 border-white shadow-md transition-all ${
              disk === 1 ? 'w-8 bg-red-500' :
              disk === 2 ? 'w-12 bg-blue-500' :
              disk === 3 ? 'w-16 bg-green-500' :
              'w-20 bg-yellow-500'
            }`}
          />
        ))}
      </div>
    </div>
  );

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
        <Card className="max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Avaliação Concluída!</h2>
            <div className="space-y-3 mb-6">
              <p>Puzzles completados: {completedPuzzles}/{puzzles.length}</p>
              <p>Pontuação total: {totalScore}</p>
              <p>Eficiência média: {completedPuzzles > 0 ? Math.round((totalScore / completedPuzzles)) : 0}%</p>
              <p>Erros de execução: {sessionData.executionErrors}</p>
            </div>
            <Button onClick={() => window.history.back()}>
              Voltar aos Testes
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Processamento Executivo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>{currentPuzzleIndex + 1}/{puzzles.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Movimentos: {moveCount}</span>
              </div>
            </div>
          </div>

          <Progress value={(currentPuzzleIndex / puzzles.length) * 100} className="mb-6" />

          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold mb-2">{currentPuzzle?.description}</h3>
            <p className="text-muted-foreground">
              Movimentos mínimos: {currentPuzzle?.minMoves} | Dificuldade: {currentPuzzle?.difficulty}
            </p>
          </div>

          <div className="flex justify-center space-x-8 mb-8">
            {[0, 1, 2].map(renderTower)}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Clique em uma torre para selecionar um disco, depois clique em outra torre para mover.</p>
            <p>Regra: Discos maiores não podem ficar sobre discos menores.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}