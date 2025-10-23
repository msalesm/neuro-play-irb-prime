import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FocoRapido() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState<Array<{id: number; x: number; y: number; isCorrect: boolean}>>([]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    generateTargets();
  };

  const generateTargets = () => {
    const newTargets = Array.from({length: 5}, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      isCorrect: Math.random() > 0.3,
    }));
    setTargets(newTargets);
  };

  const handleTargetClick = (target: typeof targets[0]) => {
    if (target.isCorrect) {
      setScore(s => s + 10);
      generateTargets();
    } else {
      setScore(s => Math.max(0, s - 5));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500/20 to-cyan-500/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/games">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Target className="w-12 h-12 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">🎯 Foco Rápido</h1>
              <p className="text-muted-foreground">Toque apenas nos alvos corretos</p>
            </div>
          </div>

          <div className="text-2xl font-bold mb-6">Pontuação: {score}</div>

          {!gameActive ? (
            <Button size="lg" onClick={startGame}>Começar Jogo</Button>
          ) : (
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              {targets.map(target => (
                <button
                  key={target.id}
                  onClick={() => handleTargetClick(target)}
                  className={`absolute w-16 h-16 rounded-full transition-all ${
                    target.isCorrect ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
