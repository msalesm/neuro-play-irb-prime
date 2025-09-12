import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Coins, MapPin, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Treasure {
  id: number;
  operation: string;
  answer: number;
  options: number[];
  collected: boolean;
  x: number;
  y: number;
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
      
      const newTreasures = treasures.map(t => 
        t.id === currentTreasure.id ? { ...t, collected: true } : t
      );
      
      setTreasures(newTreasures);
      setCoins(coins + 10);
      setDiscoveredTreasures(discoveredTreasures + 1);
      
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
          setLevel(level + 1);
          setCoins(coins + 50); // Level completion bonus
        }, 2000);
      }
      
      setCurrentTreasure(null);
    } else {
      // Wrong answer
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
  };

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
              <div className="text-2xl font-bold text-yellow-700">💰 {coins}</div>
              <div className="text-sm text-yellow-600">Moedas</div>
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
              <Coins className="w-5 h-5 text-yellow-500" />
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
                <MapPin className="w-5 h-5 text-red-500" />
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
                <Target className="w-5 h-5 text-blue-500" />
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
                  
                  <div className="text-center text-3xl font-bold text-blue-600 py-4 bg-blue-50 rounded-lg">
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

        {/* Stats */}
        <Card className="mt-6">
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
      </div>
    </div>
  );
}