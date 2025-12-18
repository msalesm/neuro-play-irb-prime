import { useAuth } from '@/hooks/useAuth';
import { DailyGameSection } from '@/components/DailyGameSection';
import { ModernGameCard } from '@/components/ModernGameCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
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

export default function ModernIndex() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const popularGames = [
    {
      id: 'memoria-colorida',
      title: t('games.memoriaColorida'),
      description: t('games.descriptions.memoriaColorida'),
      icon: Target,
      gradient: 'gradient-memory',
      progress: { current: 8, total: 25 },
      difficulty: t('games.difficulty.easy'),
      duration: '3-7 min',
      path: '/games/memoria-colorida'
    },
    {
      id: 'logica-rapida',
      title: t('games.logicaRapida'),
      description: t('games.descriptions.logicaRapida'),
      icon: Zap,
      gradient: 'gradient-problem',
      progress: { current: 15, total: 40 },
      difficulty: t('games.difficulty.hard'),
      duration: '4-8 min',
      path: '/games/logica-rapida'
    },
    {
      id: 'ritmo-musical',
      title: t('games.ritmoMusical'),
      description: t('games.descriptions.ritmoMusical'),
      icon: Music,
      gradient: 'gradient-playful',
      progress: { current: 6, total: 30 },
      difficulty: t('games.difficulty.intermediate'),
      duration: '3-6 min',
      path: '/games/ritmo-musical'
    },
    {
      id: 'aventura-numeros',
      title: t('games.aventuraNumeros'),
      description: t('games.descriptions.aventuraNumeros'),
      icon: Calculator,
      gradient: 'gradient-math',
      progress: { current: 4, total: 35 },
      difficulty: t('games.difficulty.intermediate'),
      duration: '5-10 min',
      path: '/games/aventura-numeros'
    },
    {
      id: 'social-scenarios',
      title: t('games.socialScenarios'),
      description: t('games.descriptions.socialScenarios'),
      icon: Users,
      gradient: 'gradient-social',
      progress: { current: 2, total: 20 },
      difficulty: t('games.difficulty.adaptive'),
      duration: '8-12 min',
      path: '/games/social-scenarios'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white space-y-6 max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{t('hero.title')}</h1>
          <p className="text-white/80">
            {t('hero.cognitiveDescription')}
          </p>
          <Button asChild size="lg" className="bg-white/20 hover:bg-white/30 text-white">
            <Link to="/auth">{t('hero.startJourney')}</Link>
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
              {t('common.hello')}, {user.user_metadata?.name || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/70 text-sm">{t('hero.continueDevelopment')}</p>
          </div>
        </div>
        
        {/* Link para Meu Aprendizado centralizado */}
        <div className="flex justify-center mb-6">
          <Button 
            variant="outline" 
            asChild
            className="bg-card/50 border-border text-foreground hover:bg-accent"
          >
            <Link to="/educational-dashboard">
              <BookOpen className="w-4 h-4 mr-2" />
              {t('common.myLearning')}
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
          <h2 className="text-xl font-bold text-yellow-400">{t('games.popular')}</h2>
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
            className="bg-card/50 border-border text-foreground hover:bg-accent"
            asChild
          >
            <Link to="/games">
              <Gamepad2 className="w-4 h-4 mr-2" />
              {t('common.viewAll')}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}