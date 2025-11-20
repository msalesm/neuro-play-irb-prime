import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Target, Clock, Trophy, Volume2, VolumeX, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LevelProgress } from "@/components/LevelProgress";
import { GameAchievements } from "@/components/GameAchievement";

interface GameStats {
  level: number;
  score: number;
  accuracy: number;
  correctFinds: number;
  totalAttempts: number;
  timeRemaining: number;
  xp: number;
  xpToNext: number;
  justLeveledUp: boolean;
  recentXpGain: number;
}

const WORDS_BY_LEVEL = {
  1: ["CASA", "GATO", "BOLA", "AZUL", "AMOR"],
  2: ["ESCOLA", "CRIANÇA", "FAMÍLIA", "LIVRO", "FELIZ"],
  3: ["BIBLIOTECA", "NATUREZA", "AMIZADE", "AVENTURA", "CRIATIVO"],
  4: ["EXTRAORDINÁRIO", "PERSEVERANÇA", "SOLIDARIEDADE", "CONSCIÊNCIA", "IMAGINAÇÃO"]    
};

const TARGET_LETTERS = ["A", "E", "I", "O", "U", "B", "C", "D", "F", "G", "H", "J", "L", "M", "N", "P", "R", "S", "T", "V"];

export default function CacaLetras() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  const [currentWord, setCurrentWord] = useState<string>("");
  const [targetLetter, setTargetLetter] = useState<string>("");
  const [foundPositions, setFoundPositions] = useState<number[]>([]);
  const [wrongClicks, setWrongClicks] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    accuracy: 100,
    correctFinds: 0,
    totalAttempts: 0,
    timeRemaining: 30,
    xp: 0,
    xpToNext: 100,
    justLeveledUp: false,
    recentXpGain: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([
    {
      id: 'first_find',
      title: 'Primeira Descoberta',
      description: 'Encontre sua primeira letra correta',
      icon: '🎯',
      type: 'instant',
      unlocked: false
    },
    {
      id: 'speed_reader',
      title: 'Leitor Veloz',
      description: 'Encontre 10 letras em menos de 20 segundos',
      icon: '⚡',
      type: 'progress',
      value: 0,
      maxValue: 10,
      unlocked: false
    },
    {
      id: 'perfect_word',
      title: 'Palavra Perfeita',
      description: 'Encontre todas as letras de uma palavra sem erros',
      icon: '💎',
      type: 'instant',
      unlocked: false
    }
  ]);

  // Start new round
  const startNewRound = useCallback(() => {
    const levelWords = WORDS_BY_LEVEL[stats.level as keyof typeof WORDS_BY_LEVEL] || WORDS_BY_LEVEL[4];
    const randomWord = levelWords[Math.floor(Math.random() * levelWords.length)];
    const availableLetters = [...new Set(randomWord.split(''))];
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    
    setCurrentWord(randomWord);
    setTargetLetter(randomLetter);
    setFoundPositions([]);
    setWrongClicks([]);
    setStats(prev => ({ ...prev, timeRemaining: 30 }));
    setGameState('playing');
  }, [stats.level]);

  // Handle letter click
  const handleLetterClick = (position: number, letter: string) => {
    if (gameState !== 'playing') return;
    
    const isCorrect = letter === targetLetter;
    const newStats = { ...stats, totalAttempts: stats.totalAttempts + 1 };
    
    if (isCorrect) {
      setFoundPositions(prev => [...prev, position]);
      newStats.correctFinds += 1;
      newStats.score += 10 * stats.level;
      
      // XP gain
      const xpGain = 15 * stats.level;
      newStats.xp += xpGain;
      newStats.recentXpGain = xpGain;
      
      // Check if all instances found
      const targetPositions = currentWord.split('').map((char, idx) => char === targetLetter ? idx : -1).filter(idx => idx !== -1);
      if (foundPositions.length + 1 >= targetPositions.length) {
        // Perfect bonus
        if (wrongClicks.length === 0) {
          newStats.xp += 25;
          newStats.recentXpGain += 25;
        }
        
        setTimeout(() => startNewRound(), 1500);
      }
    } else {
      setWrongClicks(prev => [...prev, position]);
    }
    
    // Calculate accuracy
    newStats.accuracy = newStats.totalAttempts > 0 ? (newStats.correctFinds / newStats.totalAttempts) * 100 : 100;
    
    // Level progression
    const requiredXP = newStats.level * 100;
    if (newStats.xp >= requiredXP) {
      newStats.level += 1;
      newStats.xp -= requiredXP;
      newStats.xpToNext = newStats.level * 100;
      newStats.justLeveledUp = true;
    } else {
      newStats.xpToNext = requiredXP;
    }
    
    setStats(newStats);
    
    // Update achievements
    updateAchievements(newStats, isCorrect);
  };

  // Update achievements
  const updateAchievements = (newStats: GameStats, isCorrect: boolean) => {
    const updatedAchievements = [...achievements];
    
    // First find
    if (isCorrect && newStats.correctFinds === 1 && !achievements[0].unlocked) {
      updatedAchievements[0].unlocked = true;
      updatedAchievements[0].justUnlocked = true;
    }
    
    // Speed reader (simplified)
    if (isCorrect && newStats.timeRemaining > 10) {
      updatedAchievements[1].value = Math.min(updatedAchievements[1].value + 1, 10);
      if (updatedAchievements[1].value >= 10 && !achievements[1].unlocked) {
        updatedAchievements[1].unlocked = true;
        updatedAchievements[1].justUnlocked = true;
      }
    }
    
    // Perfect word
    const targetCount = currentWord.split('').filter(char => char === targetLetter).length;
    if (foundPositions.length + 1 === targetCount && wrongClicks.length === 0 && !achievements[2].unlocked) {
      updatedAchievements[2].unlocked = true;
      updatedAchievements[2].justUnlocked = true;
    }
    
    setAchievements(updatedAchievements);
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && stats.timeRemaining > 0) {
      const timer = setTimeout(() => {
        setStats(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stats.timeRemaining === 0) {
      setGameState('gameOver');
    }
  }, [gameState, stats.timeRemaining]);

  // Login check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para jogar Caça Letras, você precisa fazer login.
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
    <div className="min-h-screen bg-gradient-dislexia py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/games">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Jogos
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              📚 Caça Letras
            </h1>
            <p className="text-white/80 text-sm">Processamento fonológico</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2 border-border text-foreground hover:bg-accent"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <LevelProgress
            currentLevel={stats.level}
            currentXP={stats.xp}
            xpToNext={stats.xpToNext}
            levelProgress={(stats.xp / stats.xpToNext) * 100}
            recentGain={stats.recentXpGain}
            showLevelUp={stats.justLeveledUp}
          />
          
          <div className="grid grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-dislexia">{stats.score}</div>
                <div className="text-xs text-muted-foreground">Pontos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-green-600">{Math.round(stats.accuracy)}%</div>
                <div className="text-xs text-muted-foreground">Precisão</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{stats.timeRemaining}s</div>
                <div className="text-xs text-muted-foreground">Tempo</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-purple-600">{stats.correctFinds}</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {gameState === 'idle' && (
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold">Como Jogar</h2>
                      <div className="space-y-2 text-left max-w-md mx-auto">
                        <p className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-dislexia" />
                          Encontre todas as ocorrências da letra destacada
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-dislexia" />
                          Você tem 30 segundos por palavra
                        </p>
                        <p className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-dislexia" />
                          Sem erros = bônus perfeito!
                        </p>
                      </div>
                    </div>
                    <Button onClick={startNewRound} size="lg" className="gap-2 gradient-dislexia text-white">
                      <Target className="w-5 h-5" />
                      Começar Caça
                    </Button>
                  </div>
                )}

                {gameState === 'playing' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="outline" className="text-lg p-3 mb-4 border-dislexia text-dislexia">
                        Encontre a letra: <span className="font-bold text-2xl mx-2">{targetLetter}</span>
                      </Badge>
                      <Progress value={(30 - stats.timeRemaining) / 30 * 100} className="w-full max-w-xs mx-auto mb-4" />
                    </div>

                    {/* Word Display */}
                    <div className="bg-white rounded-lg p-6 shadow-inner">
                      <div className="flex flex-wrap justify-center gap-2">
                        {currentWord.split('').map((letter, index) => (
                          <button
                            key={index}
                            onClick={() => handleLetterClick(index, letter)}
                            className={`w-12 h-12 text-2xl font-bold rounded-lg border-2 transition-all duration-200 ${
                              foundPositions.includes(index)
                                ? 'bg-green-500 text-white border-green-600 shadow-lg'
                                : wrongClicks.includes(index)
                                ? 'bg-red-500 text-white border-red-600 shake'
                                : letter === targetLetter
                                ? 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200'
                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                            }`}
                            disabled={foundPositions.includes(index)}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      Palavra: <span className="font-semibold">{currentWord}</span> | 
                      Encontradas: {foundPositions.length} | 
                      Total: {currentWord.split('').filter(char => char === targetLetter).length}
                    </div>
                  </div>
                )}

                {gameState === 'gameOver' && (
                  <div className="text-center space-y-6">
                    <h2 className="text-xl font-bold">Tempo Esgotado!</h2>
                    <p className="text-muted-foreground">
                      Você chegou ao nível {stats.level} com {stats.score} pontos
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-dislexia" />
                        Precisão: {Math.round(stats.accuracy)}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-green-500" />
                        Acertos: {stats.correctFinds}
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => {
                        setGameState('idle');
                        setStats(prev => ({ ...prev, timeRemaining: 30 }));
                      }} className="gap-2 gradient-dislexia text-white">
                        <Target className="w-4 h-4" />
                        Jogar Novamente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GameAchievements 
                  achievements={achievements} 
                  onAchievementComplete={(achievementId) => {
                    setAchievements(prev => prev.map(a => 
                      a.id === achievementId ? { ...a, justUnlocked: false } : a
                    ));
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-dislexia" />
              Benefícios para Dislexia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-dislexia">Reconhecimento Visual</h4>
                <p className="text-muted-foreground">Fortalece identificação rápida de letras e padrões</p>
              </div>
              <div>
                <h4 className="font-medium text-dislexia">Processamento Fonológico</h4>
                <p className="text-muted-foreground">Associação entre som e símbolo da letra</p>
              </div>
              <div>
                <h4 className="font-medium text-dislexia">Atenção Seletiva</h4>
                <p className="text-muted-foreground">Foco em elementos específicos do texto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}