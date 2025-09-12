import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Brain, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GameIllustration } from './GameIllustration';

// Jogos que podem ser sugeridos como "jogo diário"
const dailyGames = [
  {
    id: 'focus-forest',
    title: 'Focus Forest',
    subtitle: 'Atenção Sustentada',
    description: 'Desenvolva sua capacidade de foco',
    duration: '5-10 min',
    difficulty: 'Adaptável',
    icon: Brain,
    gradient: 'gradient-focus',
    path: '/games/focus-forest'
  },
  {
    id: 'memoria-colorida',
    title: 'Memória Colorida',
    subtitle: 'Memória Visual',
    description: 'Fortaleça sua memória visual',
    duration: '3-7 min',
    difficulty: 'Intermediário',
    icon: Target,
    gradient: 'gradient-memory',
    path: '/games/memoria-colorida'
  },
  {
    id: 'logica-rapida',
    title: 'Lógica Rápida',
    subtitle: 'Raciocínio',
    description: 'Acelere seu pensamento lógico',
    duration: '4-8 min',
    difficulty: 'Desafiador',
    icon: Zap,
    gradient: 'gradient-problem',
    path: '/games/logica-rapida'
  }
];

export function DailyGameSection() {
  const { user } = useAuth();
  const [currentGameIndex] = useState(() => {
    // Selecionar jogo baseado no dia da semana
    const today = new Date().getDay();
    return today % dailyGames.length;
  });

  if (!user) return null;

  const todaysGame = dailyGames[currentGameIndex];
  const Icon = todaysGame.icon;

  return (
    <section className="px-4 mb-8">
      <div className="relative">
        {/* Background gradient */}
        <div className={`absolute inset-0 ${todaysGame.gradient} rounded-2xl opacity-90`} />
        
        {/* Game Illustration Background */}
        <div className="absolute top-4 right-4 opacity-20">
          <GameIllustration gameId={todaysGame.id} className="w-32 h-32" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
        
        {/* Content */}
        <Card className="relative bg-transparent border-0 shadow-none">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Seu Jogo Diário</h2>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>Linha única</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{todaysGame.duration}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                asChild 
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Link to={todaysGame.path}>
                  JOGAR
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GameIllustration gameId={todaysGame.id} className="w-7 h-7" animated />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{todaysGame.title}</h3>
                <p className="text-white/80 text-sm">{todaysGame.subtitle}</p>
              </div>
            </div>

            <p className="text-white/90 text-sm mb-4">{todaysGame.description}</p>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {todaysGame.difficulty}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {todaysGame.duration}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}