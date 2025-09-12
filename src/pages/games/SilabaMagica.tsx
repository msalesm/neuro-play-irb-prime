import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowLeft, Puzzle, Sparkles, Trophy, Volume2, VolumeX, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LevelProgress } from "@/components/LevelProgress";
import { GameAchievements } from "@/components/GameAchievement";

interface GameStats {
  level: number;
  score: number;
  accuracy: number;
  correctMatches: number;
  totalAttempts: number;
  xp: number;
  xpToNext: number;
  justLeveledUp: boolean;
  recentXpGain: number;
}

const SYLLABLE_WORDS = {
  1: [
    { word: "CASA", syllables: ["CA", "SA"] },
    { word: "GATO", syllables: ["GA", "TO"] },
    { word: "BOLA", syllables: ["BO", "LA"] },
    { word: "DOCE", syllables: ["DO", "CE"] }
  ],
  2: [
    { word: "ESCOLA", syllables: ["ES", "CO", "LA"] },
    { word: "FAMÍLIA", syllables: ["FA", "MÍ", "LIA"] },
    { word: "CRIANÇA", syllables: ["CRI", "AN", "ÇA"] },
    { word: "LIVRO", syllables: ["LI", "VRO"] }
  ],
  3: [
    { word: "BIBLIOTECA", syllables: ["BI", "BLI", "O", "TE", "CA"] },
    { word: "AMIZADE", syllables: ["A", "MI", "ZA", "DE"] },
    { word: "AVENTURA", syllables: ["A", "VEN", "TU", "RA"] },
    { word: "NATUREZA", syllables: ["NA", "TU", "RE", "ZA"] }
  ]
};

type GameMode = 'split' | 'join';

export default function SilabaMagica() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed' | 'failed'>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('split');
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    accuracy: 100,
    correctMatches: 0,
    totalAttempts: 0,
    xp: 0,
    xpToNext: 100,
    justLeveledUp: false,
    recentXpGain: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([
    {
      id: 'first_split',
      title: 'Primeira Divisão',
      description: 'Separe sua primeira palavra em sílabas',
      icon: '✂️',
      type: 'instant',
      unlocked: false
    },
    {
      id: 'perfect_join',
      title: 'Construtor Perfeito',
      description: 'Monte 5 palavras corretamente seguidas',
      icon: '🔧',
      type: 'progress',
      value: 0,
      maxValue: 5,
      unlocked: false
    },
    {
      id: 'syllable_master',
      title: 'Mestre das Sílabas',
      description: 'Complete 20 desafios com 90%+ de precisão',
      icon: '🎓',
      type: 'progress',
      value: 0,
      maxValue: 20,
      unlocked: false
    }
  ]);

  // Generate new challenge
  const generateChallenge = useCallback(() => {
    const levelWords = SYLLABLE_WORDS[stats.level as keyof typeof SYLLABLE_WORDS] || SYLLABLE_WORDS[3];
    const randomWord = levelWords[Math.floor(Math.random() * levelWords.length)];
    
    if (gameMode === 'split') {
      // Show word, player needs to select correct syllables
      const allSyllables = Object.values(SYLLABLE_WORDS).flat().flatMap(w => w.syllables);
      const distractors = allSyllables.filter(s => !randomWord.syllables.includes(s)).slice(0, 4);
      const options = [...randomWord.syllables, ...distractors].sort(() => Math.random() - 0.5);
      
      setCurrentChallenge(randomWord);
      setAvailableOptions(options);
      setSelectedSyllables([]);
    } else {
      // Show syllables, player needs to form word
      const shuffledSyllables = [...randomWord.syllables].sort(() => Math.random() - 0.5);
      setCurrentChallenge(randomWord);
      setAvailableOptions(shuffledSyllables);
      setSelectedSyllables([]);
    }
    
    setGameState('playing');
  }, [gameMode, stats.level]);

  // Handle syllable selection
  const handleSyllableClick = (syllable: string) => {
    if (gameState !== 'playing') return;
    
    if (selectedSyllables.includes(syllable)) {
      // Remove if already selected
      setSelectedSyllables(prev => prev.filter(s => s !== syllable));
    } else {
      // Add to selection
      setSelectedSyllables(prev => [...prev, syllable]);
    }
  };

  // Check answer
  const checkAnswer = () => {
    if (!currentChallenge) return;
    
    const isCorrect = gameMode === 'split' 
      ? selectedSyllables.length === currentChallenge.syllables.length && 
        selectedSyllables.every(s => currentChallenge.syllables.includes(s))
      : selectedSyllables.join('') === currentChallenge.word;
    
    const newStats = { ...stats, totalAttempts: stats.totalAttempts + 1 };
    
    if (isCorrect) {
      newStats.correctMatches += 1;
      newStats.score += 20 * stats.level;
      
      // XP gain
      const xpGain = 25 * stats.level;
      newStats.xp += xpGain;
      newStats.recentXpGain = xpGain;
      
      setGameState('completed');
      
      // Update achievements
      updateAchievements(newStats, true);
      
      setTimeout(() => generateChallenge(), 2000);
    } else {
      setGameState('failed');
      setTimeout(() => {
        setSelectedSyllables([]);
        setGameState('playing');
      }, 1500);
    }
    
    // Calculate accuracy
    newStats.accuracy = newStats.totalAttempts > 0 ? (newStats.correctMatches / newStats.totalAttempts) * 100 : 100;
    
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
  };

  // Update achievements
  const updateAchievements = (newStats: GameStats, isCorrect: boolean) => {
    const updatedAchievements = [...achievements];
    
    // First split
    if (isCorrect && gameMode === 'split' && newStats.correctMatches === 1 && !achievements[0].unlocked) {
      updatedAchievements[0].unlocked = true;
      updatedAchievements[0].justUnlocked = true;
    }
    
    // Perfect join streak
    if (isCorrect && gameMode === 'join') {
      updatedAchievements[1].value = Math.min(updatedAchievements[1].value + 1, 5);
      if (updatedAchievements[1].value >= 5 && !achievements[1].unlocked) {
        updatedAchievements[1].unlocked = true;
        updatedAchievements[1].justUnlocked = true;
      }
    } else if (!isCorrect) {
      updatedAchievements[1].value = 0; // Reset streak
    }
    
    // Syllable master
    if (isCorrect && newStats.accuracy >= 90) {
      updatedAchievements[2].value = Math.min(updatedAchievements[2].value + 1, 20);
      if (updatedAchievements[2].value >= 20 && !achievements[2].unlocked) {
        updatedAchievements[2].unlocked = true;
        updatedAchievements[2].justUnlocked = true;
      }
    }
    
    setAchievements(updatedAchievements);
  };

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
              Para jogar Sílaba Mágica, você precisa fazer login.
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
              ✨ Sílaba Mágica
            </h1>
            <p className="text-white/80 text-sm">Segmentação fonológica</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2 border-white/20 text-white hover:bg-white/10"
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
          
          <div className="grid grid-cols-3 gap-2">
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
                <div className="text-lg font-bold text-purple-600">{stats.correctMatches}</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Mode Selector */}
        {gameState === 'idle' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-center">Escolha o Modo de Jogo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={gameMode === 'split' ? 'default' : 'outline'}
                  onClick={() => setGameMode('split')}
                  className="p-6 h-auto flex-col gap-2"
                >
                  <Puzzle className="w-8 h-8" />
                  <div>
                    <div className="font-semibold">Separar Sílabas</div>
                    <div className="text-xs text-muted-foreground">Divida a palavra em sílabas</div>
                  </div>
                </Button>
                <Button
                  variant={gameMode === 'join' ? 'default' : 'outline'}
                  onClick={() => setGameMode('join')}
                  className="p-6 h-auto flex-col gap-2"
                >
                  <Sparkles className="w-8 h-8" />
                  <div>
                    <div className="font-semibold">Formar Palavras</div>
                    <div className="text-xs text-muted-foreground">Una as sílabas para formar palavras</div>
                  </div>
                </Button>
              </div>
              <div className="text-center mt-6">
                <Button onClick={generateChallenge} size="lg" className="gap-2 gradient-dislexia text-white">
                  <Sparkles className="w-5 h-5" />
                  Começar Desafio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {gameState === 'playing' && currentChallenge && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Badge variant="outline" className="text-lg p-3 mb-4 border-dislexia text-dislexia">
                        {gameMode === 'split' ? 'Separe em sílabas:' : 'Forme a palavra:'}
                      </Badge>
                      
                      {gameMode === 'split' ? (
                        <div className="text-4xl font-bold text-dislexia mb-6">
                          {currentChallenge.word}
                        </div>
                      ) : (
                        <div className="text-2xl text-muted-foreground mb-6">
                          Palavra: {currentChallenge.word}
                        </div>
                      )}
                    </div>

                    {/* Selection Area */}
                    <div className="bg-white rounded-lg p-6 border-2 border-dashed border-dislexia/30 min-h-[100px]">
                      <div className="text-center text-sm text-muted-foreground mb-3">
                        {gameMode === 'split' ? 'Sílabas selecionadas:' : 'Palavra formada:'}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {selectedSyllables.length === 0 ? (
                          <div className="text-muted-foreground italic">Selecione as sílabas...</div>
                        ) : (
                          selectedSyllables.map((syllable, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-lg p-2 bg-dislexia text-white cursor-pointer"
                              onClick={() => handleSyllableClick(syllable)}
                            >
                              {syllable}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="text-center text-sm text-muted-foreground">
                        Opções disponíveis:
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {availableOptions.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedSyllables.includes(option) ? 'default' : 'outline'}
                            onClick={() => handleSyllableClick(option)}
                            className="text-lg p-3"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Check Answer Button */}
                    <div className="text-center">
                      <Button
                        onClick={checkAnswer}
                        disabled={selectedSyllables.length === 0}
                        className="gap-2 gradient-dislexia text-white"
                        size="lg"
                      >
                        <Star className="w-5 h-5" />
                        Verificar Resposta
                      </Button>
                    </div>
                  </div>
                )}

                {gameState === 'completed' && (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h2 className="text-xl font-bold text-dislexia">Perfeito!</h2>
                    <p className="text-muted-foreground">
                      Você {gameMode === 'split' ? 'separou' : 'formou'} a palavra corretamente!
                    </p>
                  </div>
                )}

                {gameState === 'failed' && (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">😅</div>
                    <h2 className="text-xl font-bold text-red-500">Tente novamente!</h2>
                    <p className="text-muted-foreground">
                      Não foi dessa vez. Vamos tentar de novo?
                    </p>
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
                <h4 className="font-medium text-dislexia">Consciência Fonológica</h4>
                <p className="text-muted-foreground">Desenvolve percepção dos sons da fala</p>
              </div>
              <div>
                <h4 className="font-medium text-dislexia">Segmentação</h4>
                <p className="text-muted-foreground">Ensina a quebrar palavras em partes menores</p>
              </div>
              <div>
                <h4 className="font-medium text-dislexia">Decodificação</h4>
                <p className="text-muted-foreground">Facilita a leitura através da análise silábica</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Mode Selection */}
        {gameState !== 'idle' && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setGameState('idle');
                setSelectedSyllables([]);
                setCurrentChallenge(null);
              }}
              className="gap-2"
            >
              <Puzzle className="w-4 h-4" />
              Trocar Modo de Jogo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}