import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, Star, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  image: string;
  isPlaced: boolean;
}

export default function QuebraCabecaMagico() {
  const { toast } = useToast();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [completedPuzzles, setCompletedPuzzles] = useState(0);
  const [magicEffect, setMagicEffect] = useState(false);

  // Generate puzzle pieces for current level
  useEffect(() => {
    const numPieces = Math.min(4 + level, 9); // 4-9 pieces based on level
    const newPieces: PuzzlePiece[] = [];
    
    for (let i = 0; i < numPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: Math.floor(Math.random() * numPieces),
        image: `🧩`, // Using emoji as placeholder for puzzle pieces
        isPlaced: false
      });
    }
    
    // Shuffle pieces
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5);
    shuffled.forEach((piece, index) => {
      piece.currentPosition = index;
    });
    
    setPieces(shuffled);
  }, [level]);

  const handleDragStart = (pieceId: number) => {
    setDraggedPiece(pieceId);
  };

  const handleDrop = (targetPosition: number) => {
    if (draggedPiece === null) return;

    const piece = pieces.find(p => p.id === draggedPiece);
    if (!piece) return;

    if (piece.correctPosition === targetPosition) {
      // Correct placement
      setMagicEffect(true);
      setTimeout(() => setMagicEffect(false), 1000);
      
      const newPieces = pieces.map(p => 
        p.id === draggedPiece 
          ? { ...p, isPlaced: true, currentPosition: targetPosition }
          : p
      );
      
      setPieces(newPieces);
      setScore(score + 10);
      
      // Check if puzzle is complete
      if (newPieces.every(p => p.isPlaced)) {
        setCompletedPuzzles(completedPuzzles + 1);
        toast({
          title: "🎉 Puzzle Completo!",
          description: `O mago está orgulhoso! Nível ${level} concluído!`,
        });
        
        setTimeout(() => {
          setLevel(level + 1);
          setScore(score + 50); // Bonus for completing level
        }, 2000);
      }
    } else {
      // Wrong placement - visual feedback
      toast({
        title: "🔮 Tente novamente!",
        description: "O mago sussurra: 'Esta peça pertence a outro lugar...'",
        variant: "destructive"
      });
    }
    
    setDraggedPiece(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetLevel = () => {
    setLevel(1);
    setScore(0);
    setCompletedPuzzles(0);
  };

  const progress = (pieces.filter(p => p.isPlaced).length / pieces.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
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
              <div className="text-2xl font-bold text-purple-700">⭐ {score}</div>
              <div className="text-sm text-purple-600">Pontos Mágicos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">🎯 {level}</div>
              <div className="text-sm text-blue-600">Nível</div>
            </div>
          </div>
        </div>

        {/* Wizard Character */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`text-6xl transition-transform duration-1000 ${magicEffect ? 'animate-bounce' : ''}`}>
                🧙‍♂️
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Mago Puzzle</h2>
                <p className="text-lg">
                  {pieces.every(p => p.isPlaced) 
                    ? "✨ Incrível! Você dominou a magia dos quebra-cabeças!" 
                    : `🔮 Arraste as peças para seus lugares corretos e desvende a magia! ${pieces.filter(p => p.isPlaced).length}/${pieces.length} peças colocadas.`
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
              <Sparkles className="w-5 h-5 text-purple-500" />
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Puzzle Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Puzzle Board */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Área do Puzzle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`grid gap-2 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 ${
                  Math.sqrt(pieces.length) === Math.floor(Math.sqrt(pieces.length)) 
                    ? `grid-cols-${Math.floor(Math.sqrt(pieces.length))}` 
                    : 'grid-cols-3'
                }`}
                style={{
                  gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(pieces.length))}, 1fr)`
                }}
              >
                {Array.from({ length: pieces.length }).map((_, index) => {
                  const placedPiece = pieces.find(p => p.isPlaced && p.correctPosition === index);
                  return (
                    <div
                      key={index}
                      className={`aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-4xl transition-all duration-300 ${
                        placedPiece 
                          ? 'border-green-400 bg-green-100' 
                          : 'border-purple-300 bg-white hover:bg-purple-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                    >
                      {placedPiece ? (
                        <div className="animate-pulse">
                          {placedPiece.image}
                          <Star className="w-4 h-4 text-yellow-500 absolute" />
                        </div>
                      ) : (
                        <div className="text-gray-400">?</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pieces Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Peças Mágicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {pieces.filter(p => !p.isPlaced).map((piece) => (
                  <div
                    key={piece.id}
                    draggable
                    onDragStart={() => handleDragStart(piece.id)}
                    className="aspect-square border-2 border-purple-300 rounded-lg flex items-center justify-center text-4xl cursor-move hover:border-purple-500 hover:scale-105 transition-all duration-200 bg-gradient-to-br from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200"
                  >
                    {piece.image}
                  </div>
                ))}
              </div>
              
              {pieces.filter(p => !p.isPlaced).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-lg text-purple-700 font-semibold">
                    Todas as peças foram colocadas!
                  </p>
                  <Button 
                    onClick={resetLevel} 
                    className="mt-4"
                    variant="outline"
                  >
                    Jogar Novamente
                  </Button>
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
                <div className="text-2xl font-bold text-purple-600">{completedPuzzles}</div>
                <div className="text-sm text-purple-500">Puzzles Completos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Math.floor(score / 10)}</div>
                <div className="text-sm text-blue-500">Peças Corretas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{level}</div>
                <div className="text-sm text-green-500">Nível Atual</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}