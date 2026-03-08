import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Coins, MapPin, Trophy, Target, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GameOnboarding } from '@/components/games';
import { GameAchievements } from '@/components/games';

interface Treasure {
  id: number;
  operation: string;
  answer: number;
  options: number[];
  collected: boolean;
  x: number;
  y: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'instant' | 'progress' | 'milestone';
  value?: number;
  maxValue?: number;
  unlocked: boolean;
  justUnlocked?: boolean;
}

export default function AventuraNumeros() {
  const { toast } = useToast();
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [currentTreasure, setCurrentTreasure] = useState<Treasure | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [explorerPosition, setExplorerPosition] = useState({ x: 50, y: 50 });
  const [discoveredTreasures, setDiscoveredTreasures] = useState(0);
  const [celebrationEffect, setCelebrationEffect] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_treasure',
      title: 'Primeiro Tesouro',
      description: 'Encontre seu primeiro tesouro matemático!',
      icon: '💎',
      type: 'instant',
      unlocked: false
    },
    {
      id: 'quick_solver',
      title: 'Explorador Rápido',
      description: 'Resolva 5 problemas consecutivos rapidamente',
      icon: '⚡',
      type: 'progress',
      value: 0,
      maxValue: 5,
      unlocked: false
    },
    {
      id: 'level_master',
      title: 'Mestre dos Níveis',
      description: 'Complete o nível 5',
      icon: '🏆',
      type: 'milestone',
      unlocked: false
    },
    {
      id: 'treasure_hunter',
      title: 'Caçador de Tesouros',
      description: 'Colete 50 moedas',
      icon: '🪙',
      type: 'progress',
      value: 0,
      maxValue: 50,
      unlocked: false
    }
  ]);

  // Generate treasures for current level
  useEffect(() => {
    const numTreasures = 3 + level; // 4-8 treasures based on level
    const newTreasures: Treasure[] = [];
    
    for (let i = 0; i < numTreasures; i++) {
      let operation: string;
      let answer: number;
      
      // Generate operations based on level
      if (level <= 2) {
        // Simple addition
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        operation = `${a} + ${b}`;
        answer = a + b;
      } else if (level <= 4) {
        // Addition and subtraction
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * a) + 1;
        const isAddition = Math.random() > 0.5;
        if (isAddition) {
          operation = `${a} + ${b}`;
          answer = a + b;
        } else {
          operation = `${a} - ${b}`;
          answer = a - b;
        }
      } else {
        // Multiplication and division
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const isMultiplication = Math.random() > 0.5;
        if (isMultiplication) {
          operation = `${Math.min(a, 12)} × ${Math.min(b, 12)}`;
          answer = Math.min(a, 12) * Math.min(b, 12);
        } else {
          const product = a * b;
          operation = `${product} ÷ ${a}`;
          answer = b;
        }
      }
      
      // Generate wrong options
      const options = [answer];
      while (options.length < 4) {
        const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
        if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }
      
      newTreasures.push({
        id: i,
        operation,
        answer,
        options: options.sort(() => Math.random() - 0.5),
        collected: false,
        x: Math.random() * 80 + 10, // Random position on map
        y: Math.random() * 60 + 20
      });
    }
    
    setTreasures(newTreasures);
    setCurrentTreasure(null);
    setSelectedAnswer(null);
  }, [level]);

  const updateAchievements = (newCoins: number, newLevel: number, isCorrect: boolean) => {
    const updatedAchievements = [...achievements];
    
    // First treasure
    if (isCorrect && discoveredTreasures === 0 && !achievements[0].unlocked) {
      updatedAchievements[0].unlocked = true;
      updatedAchievements[0].justUnlocked = true;
    }
    
    // Quick solver
    if (isCorrect) {
      updatedAchievements[1].value = Math.min((updatedAchievements[1].value || 0) + 1, 5);
      if (updatedAchievements[1].value >= 5 && !achievements[1].unlocked) {
        updatedAchievements[1].unlocked = true;
        updatedAchievements[1].justUnlocked = true;
      }
    } else {
      updatedAchievements[1].value = 0; // Reset streak
    }
    
    // Level master
    if (newLevel >= 5 && !achievements[2].unlocked) {
      updatedAchievements[2].unlocked = true;
      updatedAchievements[2].justUnlocked = true;
    }
    
    // Treasure hunter
    updatedAchievements[3].value = newCoins;
    if (newCoins >= 50 && !achievements[3].unlocked) {
      updatedAchievements[3].unlocked = true;
      updatedAchievements[3].justUnlocked = true;
    }
    
    setAchievements(updatedAchievements);
  };

  const handleTreasureClick = (treasure: Treasure) => {
    if (treasure.collected) return;
    
    // Move explorer to treasure
    setExplorerPosition({ x: treasure.x, y: treasure.y });
    setCurrentTreasure(treasure);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentTreasure || selectedAnswer === null) return;

    if (selectedAnswer === currentTreasure.answer) {
      // Correct answer
      setCelebrationEffect(true);
      setTimeout(() => setCelebrationEffect(false), 1500);
      
      const newCoins = coins + 10;
      const newDiscovered = discoveredTreasures + 1;
      const newTreasures = treasures.map(t => 
        t.id === currentTreasure.id ? { ...t, collected: true } : t
      );
      
      setTreasures(newTreasures);
      setCoins(newCoins);
      setDiscoveredTreasures(newDiscovered);
      updateAchievements(newCoins, level, true);
      
      toast({
        title: "🏆 Tesouro Descoberto!",
        description: `Você ganhou 10 moedas douradas! 💰`,
      });
      
      // Check if all treasures are collected
      if (newTreasures.every(t => t.collected)) {
        toast({
          title: "🎉 Nível Completo!",
          description: `Todos os tesouros foram encontrados! Próximo nível desbloqueado!`,
        });
        
        setTimeout(() => {
          const newLevel = level + 1;
          setLevel(newLevel);
          setCoins(newCoins + 50); // Level completion bonus
          updateAchievements(newCoins + 50, newLevel, true);
        }, 2000);
      }
      
      setCurrentTreasure(null);
    } else {
      // Wrong answer
      updateAchievements(coins, level, false);
      toast({
        title: "❌ Resposta Incorreta",
        description: "O explorador precisa tentar novamente!",
        variant: "destructive"
      });
    }
  };

  const resetGame = () => {
    setLevel(1);
    setCoins(0);
    setDiscoveredTreasures(0);
    setExplorerPosition({ x: 50, y: 50 });
    setCurrentTreasure(null);
    setSelectedAnswer(null);
  };

  const onboardingSteps = [
    {
      title: "Bem-vindo à Aventura dos Números!",
      description: "Torne-se um explorador matemático e descubra tesouros resolvendo problemas!",
      visual: <div className="text-4xl">🏴‍☠️⚡</div>,
      tips: ["Cada tesouro esconde um problema matemático", "Resolva corretamente para ganhar moedas!"]
    },
    {
      title: "Como Encontrar Tesouros",
      description: "Clique nos diamantes brilhantes no mapa para revelar os desafios matemáticos.",
      visual: (
        <div className="flex gap-3 items-center">
          <div className="text-3xl animate-pulse">💎</div>
          <div className="text-2xl">→</div>
          <div className="bg-info/10 p-2 rounded">
            <div className="text-lg font-bold">5 + 3 = ?</div>
          </div>
        </div>
      ),
      tips: ["Tesouros coletados ficam dourados", "Cada tesouro vale 10 moedas!"]
    },
    {
      title: "Resolvendo Problemas",
      description: "Escolha a resposta correta entre as opções para descobrir o tesouro!",
      visual: (
        <div className="space-y-2">
          <div className="text-lg font-bold">8 × 2 = ?</div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="bg-muted p-2 rounded">14</div>
            <div className="bg-primary text-primary-foreground p-2 rounded">16 ✓</div>
          </div>
        </div>
      ),
      tips: ["Respostas corretas ganham moedas", "Complete todos os tesouros para subir de nível!"]
    }
  ];

  const progress = (treasures.filter(t => t.collected).length / treasures.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/games">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Jogos
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">💰 {coins}</div>
              <div className="text-sm text-warning/80">Moedas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">🎯 {level}</div>
              <div className="text-sm text-orange-600">Nível</div>
            </div>
          </div>
        </div>

        {/* Explorer Character */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`text-6xl transition-transform duration-1000 ${celebrationEffect ? 'animate-bounce' : ''}`}>
                🧭
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Explorador dos Números</h2>
                <p className="text-lg">
                  {treasures.every(t => t.collected) 
                    ? "🎉 Fantástico! Você encontrou todos os tesouros matemáticos!" 
                    : `🗺️ Clique nos tesouros do mapa e resolva as operações matemáticas! ${discoveredTreasures}/${treasures.length} tesouros descobertos.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-warning" />
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Treasure Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-destructive" />
                Mapa do Tesouro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-green-200 via-yellow-100 to-brown-200 rounded-lg border-4 border-brown-400 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 text-2xl">🏔️</div>
                <div className="absolute top-4 right-4 text-2xl">🌴</div>
                <div className="absolute bottom-4 left-4 text-2xl">🏝️</div>
                <div className="absolute bottom-4 right-4 text-2xl">🌊</div>
                
                {/* Explorer */}
                <div 
                  className="absolute transition-all duration-1000 text-3xl z-10"
                  style={{ 
                    left: `${explorerPosition.x}%`, 
                    top: `${explorerPosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  🚶‍♂️
                </div>
                
                {/* Treasures */}
                {treasures.map((treasure) => (
                  <div
                    key={treasure.id}
                    className={`absolute cursor-pointer transition-all duration-300 text-3xl hover:scale-125 ${
                      treasure.collected ? 'opacity-50' : 'animate-pulse'
                    }`}
                    style={{ 
                      left: `${treasure.x}%`, 
                      top: `${treasure.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => handleTreasureClick(treasure)}
                  >
                    {treasure.collected ? '💰' : '💎'}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Math Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-info" />
                Desafio Matemático
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTreasure ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💎</div>
                    <h3 className="text-lg font-semibold">Resolva para descobrir o tesouro:</h3>
                  </div>
                  
                  <div className="text-center text-3xl font-bold text-info py-4 bg-info/10 rounded-lg">
                    {currentTreasure.operation} = ?
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {currentTreasure.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        className="h-12 text-lg"
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full h-12 text-lg"
                  >
                    Descobrir Tesouro! 🏆
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-lg text-gray-600">
                    Clique em um tesouro no mapa para começar a aventura!
                  </p>
                  
                  {treasures.every(t => t.collected) && (
                    <Button 
                      onClick={resetGame} 
                      className="mt-4"
                      variant="outline"
                    >
                      Nova Aventura
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{discoveredTreasures}</div>
                  <div className="text-sm text-yellow-500">Tesouros Descobertos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{coins}</div>
                  <div className="text-sm text-orange-500">Moedas Coletadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{level}</div>
                  <div className="text-sm text-red-500">Nível Atual</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
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
    </div>
  );
}