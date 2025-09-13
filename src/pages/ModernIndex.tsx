import { useAuth } from '@/hooks/useAuth';
import { DailyGameSection } from '@/components/DailyGameSection';
import { ModernGameCard } from '@/components/ModernGameCard';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Gamepad2, 
  Zap, 
  Music, 
  BookOpen,
  Calculator,
  Eye,
  Puzzle,
  Users,
  Heart
} from 'lucide-react';

const popularGames = [
  {
    id: 'focus-forest',
    title: 'Focus Forest',
    description: 'Desenvolva sua atenção sustentada',
    icon: Brain,
    gradient: 'gradient-focus',
    progress: { current: 12, total: 50 },
    difficulty: 'Intermediário',
    duration: '5-10 min',
    path: '/games/focus-forest'
  },
  {
    id: 'memoria-colorida',
    title: 'Memória Colorida',
    description: 'Fortaleça sua memória visual',
    icon: Target,
    gradient: 'gradient-memory',
    progress: { current: 8, total: 25 },
    difficulty: 'Fácil',
    duration: '3-7 min',
    path: '/games/memoria-colorida'
  },
  {
    id: 'logica-rapida',
    title: 'Lógica Rápida',
    description: 'Acelere seu raciocínio lógico',
    icon: Zap,
    gradient: 'gradient-problem',
    progress: { current: 15, total: 40 },
    difficulty: 'Difícil',
    duration: '4-8 min',
    path: '/games/logica-rapida'
  },
  {
    id: 'ritmo-musical',
    title: 'Ritmo Musical',
    description: 'Sincronize com o ritmo',
    icon: Music,
    gradient: 'gradient-playful',
    progress: { current: 6, total: 30 },
    difficulty: 'Intermediário',
    duration: '3-6 min',
    path: '/games/ritmo-musical'
  },
  {
    id: 'aventura-numeros',
    title: 'Aventura dos Números',
    description: 'Explore o mundo da matemática',
    icon: Calculator,
    gradient: 'gradient-math',
    progress: { current: 4, total: 35 },
    difficulty: 'Intermediário',
    duration: '5-10 min',
    path: '/games/aventura-numeros'
  },
  {
    id: 'social-scenarios',
    title: 'Cenários Sociais',
    description: 'Desenvolva habilidades sociais',
    icon: Users,
    gradient: 'gradient-social',
    progress: { current: 2, total: 20 },
    difficulty: 'Adaptável',
    duration: '8-12 min',
    path: '/games/social-scenarios'
  }
];

export default function ModernIndex() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white space-y-6 max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">NeuroPlay</h1>
          <p className="text-white/80">
            Desenvolva suas habilidades cognitivas através de jogos terapêuticos personalizados.
          </p>
          <Button asChild size="lg" className="bg-white/20 hover:bg-white/30 text-white">
            <Link to="/auth">Começar Jornada</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header com Neuroplasticidade */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Olá, {user.user_metadata?.name || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/70 text-sm">Continue seu desenvolvimento cognitivo</p>
          </div>
        </div>
        
        {/* Link para Meu Aprendizado centralizado */}
        <div className="flex justify-center mb-6">
          <Button 
            variant="outline" 
            asChild
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Link to="/educational-dashboard">
              <BookOpen className="w-4 h-4 mr-2" />
              Meu Aprendizado
            </Link>
          </Button>
        </div>
      </div>

      {/* Jogo Diário */}
      <DailyGameSection />

      {/* Seção Popular */}
      <section className="px-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-yellow-400 fill-current" />
          <h2 className="text-xl font-bold text-yellow-400">Popular</h2>
        </div>

        {/* Grid de Jogos */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {popularGames.map((game) => (
            <ModernGameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              gradient={game.gradient}
              progress={game.progress}
              difficulty={game.difficulty}
              duration={game.duration}
              path={game.path}
            />
          ))}
        </div>

        {/* Ver Todos os Jogos */}
        <div className="text-center pb-8">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            asChild
          >
            <Link to="/games">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Ver Todos os Jogos
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}