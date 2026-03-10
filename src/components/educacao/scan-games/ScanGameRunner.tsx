import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Brain, BookOpen, Puzzle, CheckCircle2 } from 'lucide-react';
import { AttentionGame } from './AttentionGame';
import { MemoryGame } from './MemoryGame';
import { LanguageGame } from './LanguageGame';
import { ExecutiveFunctionGame } from './ExecutiveFunctionGame';

interface GameResult {
  gameType: string;
  accuracy: number;
  avgReactionTime: number;
  events: any[];
}

interface ScanGameRunnerProps {
  studentName: string;
  onAllComplete: (results: GameResult[]) => void;
}

const GAMES = [
  { key: 'attention', label: 'Atenção', icon: Eye, color: 'text-chart-1' },
  { key: 'memory', label: 'Memória', icon: Brain, color: 'text-chart-2' },
  { key: 'language', label: 'Linguagem', icon: BookOpen, color: 'text-chart-3' },
  { key: 'executive_function', label: 'Função Executiva', icon: Puzzle, color: 'text-chart-4' },
];

export function ScanGameRunner({ studentName, onAllComplete }: ScanGameRunnerProps) {
  const [currentGame, setCurrentGame] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [showTransition, setShowTransition] = useState(true);

  const handleGameComplete = (gameType: string, metrics: { accuracy: number; avgReactionTime: number; events: any[] }) => {
    const newResults = [...results, { gameType, ...metrics }];
    setResults(newResults);

    if (currentGame + 1 >= GAMES.length) {
      onAllComplete(newResults);
    } else {
      setShowTransition(true);
      setTimeout(() => {
        setCurrentGame(c => c + 1);
        setShowTransition(false);
      }, 1500);
    }
  };

  const overallProgress = ((currentGame + (showTransition ? 0 : 0.5)) / GAMES.length) * 100;
  const currentGameInfo = GAMES[currentGame];
  const Icon = currentGameInfo?.icon;

  if (showTransition && currentGame < GAMES.length) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center space-y-4">
          <Progress value={overallProgress} className="h-2" />
          
          <div className="py-8">
            {Icon && <Icon className={`h-12 w-12 mx-auto mb-4 ${currentGameInfo.color}`} />}
            <h3 className="text-xl font-bold mb-1">{currentGameInfo.label}</h3>
            <p className="text-sm text-muted-foreground">
              {currentGame === 0 ? `Olá ${studentName.split(' ')[0]}! Vamos começar.` : 'Próximo desafio!'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Atividade {currentGame + 1} de {GAMES.length}
            </p>
          </div>

          <button
            onClick={() => setShowTransition(false)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-lg transition-all active:scale-95"
          >
            {currentGame === 0 ? 'Começar! 🚀' : 'Continuar! ▶️'}
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <Progress value={overallProgress} className="h-2 mb-2" />
        
        {currentGame === 0 && (
          <AttentionGame onComplete={(m) => handleGameComplete('attention', m)} />
        )}
        {currentGame === 1 && (
          <MemoryGame onComplete={(m) => handleGameComplete('memory', m)} />
        )}
        {currentGame === 2 && (
          <LanguageGame onComplete={(m) => handleGameComplete('language', m)} />
        )}
        {currentGame === 3 && (
          <ExecutiveFunctionGame onComplete={(m) => handleGameComplete('executive_function', m)} />
        )}
      </CardContent>
    </Card>
  );
}
