import { useAuth } from '@/hooks/useAuth';
import { useNeuroplasticity } from '@/hooks/useNeuroplasticity';
import { ModernGameCard, ModernMetricCard } from '@/components/games';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Zap, 
  Music, 
  Eye,
  Users,
  BookOpen,
  Calculator,
  Puzzle,
  TrendingUp,
  Award,
  Clock,
  Gamepad2
} from 'lucide-react';

// Jogos de neuroplasticidade organizados por categoria
const neuroplasticityGames = [
  // Atenção & Foco
  {
    id: 'caca-foco',
    title: 'Caça ao Foco',
    description: 'Encontre objetos específicos desenvolvendo atenção seletiva',
    icon: Target,
    gradient: 'bg-gradient-to-br from-info to-info/80',
    category: 'attention',
    categoryName: 'Atenção & Foco',
    difficulty: 'Intermediário',
    duration: '3-10 min',
    path: '/games/caca-foco'
  },
  
  // Memória
  {
    id: 'memoria-colorida',
    title: 'Memória Colorida',
    description: 'Fortaleça a memória visual através de sequências de cores',
    icon: Eye,
    gradient: 'bg-gradient-to-br from-secondary to-accent',
    category: 'memory',
    categoryName: 'Memória',
    difficulty: 'Fácil',
    duration: '3-8 min',
    path: '/games/memoria-colorida'
  },
  
  // Funções Executivas
  {
    id: 'logica-rapida',
    title: 'Lógica Rápida',
    description: 'Acelere o raciocínio lógico e flexibilidade cognitiva',
    icon: Zap,
    gradient: 'bg-gradient-to-br from-warning to-accent',
    category: 'executive',
    categoryName: 'Funções Executivas',
    difficulty: 'Avançado',
    duration: '4-12 min',
    path: '/games/logica-rapida'
  },
  {
    id: 'quebra-cabeca-magico',
    title: 'Quebra-Cabeça Mágico',
    description: 'Desenvolva resolução de problemas com puzzles interativos',
    icon: Puzzle,
    gradient: 'bg-gradient-to-br from-primary to-secondary',
    category: 'executive',
    categoryName: 'Funções Executivas',
    difficulty: 'Intermediário',
    duration: '8-20 min',
    path: '/games/quebra-cabeca-magico'
  },
  
  // Processamento Auditivo
  {
    id: 'ritmo-musical',
    title: 'Ritmo Musical',
    description: 'Sincronize-se com ritmos desenvolvendo processamento temporal',
    icon: Music,
    gradient: 'bg-gradient-to-br from-destructive to-accent',
    category: 'auditory',
    categoryName: 'Processamento Auditivo',
    difficulty: 'Intermediário',
    duration: '3-10 min',
    path: '/games/ritmo-musical'
  },
  
  // Habilidades Sociais
  {
    id: 'social-scenarios',
    title: 'Cenários Sociais',
    description: 'Pratique interações sociais em situações do dia a dia',
    icon: Users,
    gradient: 'bg-gradient-to-br from-success to-info',
    category: 'social',
    categoryName: 'Habilidades Sociais',
    difficulty: 'Adaptável',
    duration: '8-15 min',
    path: '/games/social-scenarios'
  },
  
  // Linguagem
  {
    id: 'caca-letras',
    title: 'Caça Letras',
    description: 'Desenvolva processamento visual e reconhecimento de padrões',
    icon: BookOpen,
    gradient: 'bg-gradient-to-br from-success to-success/80',
    category: 'language',
    categoryName: 'Linguagem',
    difficulty: 'Fácil',
    duration: '3-8 min',
    path: '/games/caca-letras'
  },
  {
    id: 'silaba-magica',
    title: 'Sílaba Mágica',
    description: 'Aprimore consciência fonológica separando sílabas',
    icon: BookOpen,
    gradient: 'bg-gradient-to-br from-neuroplay-green to-success',
    category: 'language',
    categoryName: 'Linguagem',
    difficulty: 'Fácil',
    duration: '5-12 min',
    path: '/games/silaba-magica'
  },
  
  // Matemática
  {
    id: 'aventura-numeros',
    title: 'Aventura dos Números',
    description: 'Explore conceitos matemáticos em aventuras divertidas',
    icon: Calculator,
    gradient: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    category: 'math',
    categoryName: 'Matemática',
    difficulty: 'Intermediário',
    duration: '8-20 min',
    path: '/games/aventura-numeros'
  }
];

// Agrupar jogos por categoria
const gamesByCategory = neuroplasticityGames.reduce((acc, game) => {
  if (!acc[game.category]) {
    acc[game.category] = [];
  }
  acc[game.category].push(game);
  return acc;
}, {} as Record<string, typeof neuroplasticityGames>);

export default function Neuroplasticity() {
  const { user } = useAuth();
  const { 
    neuroplasticityData, 
    getCategoryProgress, 
    loading 
  } = useNeuroplasticity();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background text-foreground py-12 pb-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-muted-foreground mb-6">Faça login para acessar os jogos de neuroplasticidade</p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background text-foreground py-12 pb-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Neuroplasticidade</h1>
            <p className="text-muted-foreground mb-6">Carregando seus dados...</p>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-primary-foreground/20 rounded"></div>
              <div className="h-4 bg-primary-foreground/20 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(neuroplasticityData.overall_score);
  const totalGamesCompleted = neuroplasticityData.games_completed;
  const totalSessions = neuroplasticityData.total_sessions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-background text-foreground py-12 pb-32 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-info/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/25">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Neuro
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                plasticidade
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Desenvolva seu cérebro através de jogos cientificamente validados
          </p>
        </div>
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ModernMetricCard
          title="Score Geral"
          value={overallScore + '%'}
          icon={TrendingUp}
        />
        <ModernMetricCard
          title="Jogos Completados"
          value={totalGamesCompleted.toString()}
          icon={Award}
        />
        <ModernMetricCard
          title="Sessões Totais"
          value={totalSessions.toString()}
          icon={Clock}
        />
      </div>

      {/* Progresso por Categoria */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Progresso por Categoria
          </span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries({
            attention: 'Atenção',
            memory: 'Memória', 
            executive: 'Executivas',
            social: 'Social'
          }).map(([key, label]) => {
            const progress = getCategoryProgress(key as any);
            return (
              <div key={key} className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-sm mb-2 text-foreground/90">{label}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jogos por Categoria */}
      {Object.entries(gamesByCategory).map(([categoryKey, games]) => {
        const categoryName = games[0]?.categoryName || categoryKey;
        
        return (
          <div key={categoryKey} className="mb-12">
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-lg"></div>
              {categoryName}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <ModernGameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  gradient={game.gradient}
                  difficulty={game.difficulty}
                  duration={game.duration}
                  path={game.path}
                  gameId={game.id}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Call to Action */}
      <div className="text-center py-8 bg-card/30 rounded-2xl border border-border">
        <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2 text-foreground">
          Continue Desenvolvendo sua Neuroplasticidade
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Cada jogo é baseado em pesquisas científicas sobre neuroplasticidade e desenvolvimento cognitivo.
        </p>
        <Button 
          variant="outline" 
          className="bg-card/50 border-border text-foreground hover:bg-accent"
          asChild
        >
          <Link to="/games">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Ver Todos os Jogos
          </Link>
        </Button>
      </div>
      
    </div>
    </div>
  );
}