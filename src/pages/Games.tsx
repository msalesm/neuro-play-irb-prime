import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Play, Clock, Users, Target, Lock, Trophy, Gamepad2, Activity, BookOpen, ArrowLeft, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { GameIllustration } from "@/components/games";
import { PlatformOnboarding } from "@/components/PlatformOnboarding";

const gamesList = [
  // Jogos Básicos
  {
    id: 'memoria-colorida',
    title: "Memória Colorida",
    category: "Memória & Atenção",
    description: "Repita sequências de cores em ordem crescente de dificuldade.",
    features: ["Memória de trabalho", "Atenção sequencial", "Coordenação mão-olho", "Progressão adaptativa"],
    ageRange: "6-16 anos",
    duration: "5-15 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'caca-foco',
    title: "Caça ao Foco",
    category: "Atenção & Concentração",
    description: "Encontre objetos específicos entre distrações visuais.",
    features: ["Atenção seletiva", "Controle inibitório", "Processamento visual", "Resistência a distrações"],
    ageRange: "5-14 anos",
    duration: "3-10 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'logica-rapida',
    title: "Lógica Rápida",
    category: "Raciocínio & Lógica",
    description: "Resolva quebra-cabeças de padrões em tempo limitado.",
    features: ["Raciocínio lógico", "Reconhecimento de padrões", "Velocidade de processamento", "Resolução de problemas"],
    ageRange: "8-18 anos",
    duration: "5-12 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'ritmo-musical',
    title: "Ritmo Musical",
    category: "Coordenação & Ritmo",
    description: "Replique padrões rítmicos musicais usando teclado ou toques.",
    features: ["Coordenação motora", "Percepção temporal", "Memória auditiva", "Sincronização"],
    ageRange: "6-16 anos",
    duration: "4-10 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'caca-letras',
    title: "Caça Letras",
    category: "Leitura & Dislexia",
    description: "Encontre letras específicas dentro de palavras.",
    features: ["Reconhecimento visual", "Processamento fonológico", "Atenção seletiva", "Velocidade de leitura"],
    ageRange: "5-14 anos",
    duration: "3-8 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'silaba-magica',
    title: 'Sílaba Mágica',
    category: 'Linguagem',
    description: 'Forme e separe palavras através de sílabas de forma lúdica',
    features: ['Separação silábica', 'Formação de palavras', 'Feedback visual'],
    ageRange: '6-10 anos',
    duration: '15-20 min',
    players: '1 jogador',
    status: 'Disponível',
    unlocked: true,
    type: 'basic'
  },
  {
    id: 'quebra-cabeca-magico',
    title: 'Quebra-Cabeça Mágico',
    category: 'Resolução de Problemas',
    description: 'Ajude o mago a resolver quebra-cabeças com personagens animados',
    features: ['Puzzles progressivos', 'Personagem mago', 'Efeitos visuais'],
    ageRange: '5-12 anos',
    duration: '10-25 min',
    players: '1 jogador',
    status: 'Disponível',
    unlocked: true,
    type: 'basic'
  },
  {
    id: 'aventura-numeros',
    title: 'Aventura dos Números',
    category: 'Matemática',
    description: 'Explore mapas do tesouro resolvendo operações matemáticas',
    features: ['Exploração', 'Operações básicas', 'Coleta de moedas'],
    ageRange: '6-12 anos',
    duration: '15-30 min',
    players: '1 jogador',
    status: 'Disponível',
    unlocked: true,
    type: 'basic'
  },
  {
    id: 'contador-historias',
    title: 'Contador de Histórias',
    category: 'Linguagem',
    description: 'Complete histórias mágicas escolhendo as palavras certas',
    features: ['Narrativas interativas', 'Escolhas múltiplas', 'Personagens'],
    ageRange: '5-10 anos',
    duration: '20-30 min',
    players: '1 jogador',
    status: 'Disponível',
    unlocked: true,
    type: 'basic'
  },
  // Jogos Diagnósticos
  {
    id: 'attention-sustained',
    title: "Teste de Atenção Sustentada",
    category: "Diagnóstico • TDAH",
    description: "Avaliação científica da capacidade de manter atenção focada.",
    features: ["Vigilância sustentada", "Tempo de reação", "Controle inibitório", "Declínio da atenção"],
    ageRange: "6-18 anos",
    duration: "8-12 min",
    players: "1 jogador",
    status: "Diagnóstico",
    unlocked: true,
    type: "diagnostic"
  },
  {
    id: 'cognitive-flexibility',
    title: "Flexibilidade Cognitiva",
    category: "Diagnóstico • TEA",
    description: "Teste baseado no Wisconsin Card Sorting. Detecta rigidez cognitiva.",
    features: ["Mudança de regras", "Adaptabilidade", "Função executiva", "Perseveração"],
    ageRange: "8-18 anos",
    duration: "10-15 min",
    players: "1 jogador",
    status: "Diagnóstico",
    unlocked: true,
    type: "diagnostic"
  },
  {
    id: 'phonological-processing',
    title: "Processamento Fonológico",
    category: "Diagnóstico • Dislexia",
    description: "Avalia habilidades de consciência fonológica.",
    features: ["Rimas", "Segmentação", "Síntese", "Manipulação fonêmica"],
    ageRange: "5-16 anos",
    duration: "6-10 min",
    players: "1 jogador",
    status: "Diagnóstico",
    unlocked: true,
    type: "diagnostic"
  },
  {
    id: 'emotion-lab',
    title: "Laboratório das Emoções",
    category: "Regulação Emocional & Social",
    description: "Desenvolva reconhecimento e regulação emocional através de cenários interativos.",
    features: ["Reconhecimento facial", "Regulação emocional", "Situações sociais", "Inteligência emocional"],
    ageRange: "6-16 anos",
    duration: "10-20 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'spatial-architect',
    title: "Arquiteto Espacial",
    category: "Habilidades Visuoespaciais & Planejamento",
    description: "Construa estruturas 3D e resolva quebra-cabeças de rotação.",
    features: ["Rotação mental", "Construção 3D", "Planejamento espacial", "Coordenação mão-olho"],
    ageRange: "7-15 anos",
    duration: "8-15 min",
    players: "1 jogador",
    status: "Disponível",
    unlocked: true,
    type: "basic"
  }
];

export default function Games() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar os jogos terapêuticos, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const basicGames = gamesList.filter(g => g.type === 'basic');
  const diagnosticGames = gamesList.filter(g => g.type === 'diagnostic');

  // Build category list from basic games (short labels)
  const categories = useMemo(() => {
    const set = new Set<string>();
    basicGames.forEach(g => {
      // Use first part before "&" as compact label
      const compact = g.category.split('&')[0].trim();
      set.add(compact);
    });
    return ['all', ...Array.from(set).sort()];
  }, [basicGames]);

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filteredBasicGames = useMemo(() => {
    const q = normalize(searchTerm.trim());
    return basicGames.filter(g => {
      const compact = g.category.split('&')[0].trim();
      const matchesCategory = activeCategory === 'all' || compact === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = normalize(`${g.title} ${g.description} ${g.category} ${g.features.join(' ')}`);
      return haystack.includes(q);
    });
  }, [basicGames, searchTerm, activeCategory]);

  return (
    <>
      <PlatformOnboarding pageName="games" />
      <div className="min-h-screen bg-gradient-to-b from-primary via-secondary to-primary text-primary-foreground pb-28 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-48 md:w-72 h-48 md:h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-3/4 -right-4 w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-4 md:pt-12">
          {/* Header */}
          <div className="text-center mb-6 md:mb-16 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 absolute left-0 top-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-6">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/50 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border border-accent/20">
                <Gamepad2 className="h-5 w-5 md:h-8 md:w-8 text-accent" />
              </div>
              <h1 className="font-heading text-2xl md:text-5xl font-bold text-primary-foreground">
                Jogos{' '}
                <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
                  Terapêuticos
                </span>
              </h1>
            </div>
            <p className="text-sm md:text-xl text-primary-foreground/70 max-w-3xl mx-auto">
              Desenvolva habilidades cognitivas através de jogos divertidos.
            </p>
          </div>

          {/* Clinical CTA - Compact on mobile */}
          <Card className="mb-6 md:mb-12 bg-primary-foreground/5 backdrop-blur-md border-accent/20 shadow-xl overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-4 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="hidden md:block shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/30 rounded-2xl flex items-center justify-center border border-accent/20">
                    <Trophy className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1 md:mb-2">
                    <h3 className="text-lg md:text-2xl font-bold text-primary-foreground">Descubra Seu Perfil Cognitivo</h3>
                    <Badge className="bg-secondary text-secondary-foreground border-0 shadow-lg text-xs">
                      IA
                    </Badge>
                  </div>
                  <p className="text-primary-foreground/70 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">
                    Complete os <strong>testes diagnósticos</strong> e receba uma análise clínica detalhada gerada por IA.
                  </p>
                  <div className="hidden md:flex flex-wrap gap-2 text-xs text-primary-foreground/60">
                    <span className="bg-primary-foreground/10 px-3 py-1 rounded-full flex items-center gap-1">
                      <Target className="h-3 w-3" /> TDAH
                    </span>
                    <span className="bg-primary-foreground/10 px-3 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> TEA
                    </span>
                    <span className="bg-primary-foreground/10 px-3 py-1 rounded-full flex items-center gap-1">
                      <Target className="h-3 w-3" /> Dislexia
                    </span>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                  <Button size="sm" className="flex-1 md:flex-none bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg" asChild>
                    <Link to="/clinical" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="text-xs md:text-sm">Painel Clínico</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    <Link to="/diagnostic-tests" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span className="text-xs md:text-sm">Testes</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Games */}
          <div className="mb-8 md:mb-16" data-tour="game-categories">
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center">
              <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
                Jogos Disponíveis
              </span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {basicGames.map((game, index) => (
                <Card 
                  key={game.id}
                  data-tour={index === 0 ? "game-card" : undefined}
                  className={cn(
                    'border-primary-foreground/10 backdrop-blur-sm bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-all duration-300 group relative overflow-hidden',
                    !game.unlocked && 'opacity-75'
                  )}
                >
                  <div className="p-3 md:p-6">
                    {/* Game Illustration Background */}
                    <div className="absolute top-2 right-2 opacity-10">
                      <GameIllustration gameId={game.id} className="w-12 h-12 md:w-24 md:h-24" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-2 md:mb-4">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                          <GameIllustration gameId={game.id} className="w-3.5 h-3.5 md:w-5 md:h-5" animated />
                        </div>
                        <Badge className="bg-secondary/60 text-primary-foreground border-0 text-[9px] md:text-xs px-1.5 md:px-2 truncate max-w-[100px] md:max-w-none">
                          {game.category}
                        </Badge>
                        {!game.unlocked && <Lock className="h-3 w-3 text-primary-foreground/50 shrink-0" />}
                      </div>

                      <h3 className="font-heading text-sm md:text-xl font-bold mb-1 md:mb-3 text-primary-foreground line-clamp-1">
                        {game.title}
                      </h3>

                      <p className="text-primary-foreground/60 text-[10px] md:text-sm mb-2 md:mb-4 leading-relaxed line-clamp-2">
                        {game.description}
                      </p>

                      <div className="hidden md:flex flex-col gap-1 mb-4 text-xs text-primary-foreground/50">
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          <span>{game.ageRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{game.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mb-2 md:hidden text-[9px] text-primary-foreground/40">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{game.duration}</span>
                      </div>

                      <Button 
                        className={cn(
                          'w-full text-xs md:text-sm transition-all',
                          game.unlocked 
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-md' 
                            : 'bg-primary-foreground/10 text-primary-foreground/50 cursor-not-allowed'
                        )}
                        disabled={!game.unlocked}
                        asChild={game.unlocked}
                        size="sm"
                      >
                        {game.unlocked ? (
                          <Link to={`/games/${game.id}`} className="flex items-center gap-1.5">
                            <Play className="h-3 w-3 md:h-4 md:w-4" />
                            Jogar
                          </Link>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Lock className="h-3 w-3 md:h-4 md:w-4" />
                            Em Breve
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Diagnostic Games */}
          {diagnosticGames.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center">
                <span className="bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">
                  Testes Diagnósticos
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {diagnosticGames.map((game) => (
                  <Card 
                    key={game.id}
                    className="border-destructive/20 backdrop-blur-sm bg-destructive/5 hover:bg-destructive/10 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="p-3 md:p-6">
                      <div className="relative z-10">
                        <div className="flex items-center gap-1.5 mb-2 md:mb-4">
                          <Badge className="bg-destructive/60 text-destructive-foreground border-0 text-[9px] md:text-xs">
                            {game.category}
                          </Badge>
                        </div>

                        <h3 className="font-heading text-sm md:text-xl font-bold mb-1 md:mb-3 text-primary-foreground">
                          {game.title}
                        </h3>

                        <p className="text-primary-foreground/60 text-[10px] md:text-sm mb-3 md:mb-4 leading-relaxed line-clamp-2">
                          {game.description}
                        </p>

                        <div className="flex items-center gap-3 mb-3 text-[10px] md:text-xs text-primary-foreground/40">
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" />{game.ageRange}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{game.duration}</span>
                        </div>

                        <Button 
                          className="w-full text-xs md:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md"
                          asChild
                          size="sm"
                        >
                          <Link to={`/games/${game.id}`} className="flex items-center gap-1.5">
                            <Play className="h-3 w-3 md:h-4 md:w-4" />
                            Iniciar Teste
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
