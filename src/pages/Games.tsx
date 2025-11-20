import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Target, Lock, Trophy, Gamepad2, Activity, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { GameIllustration } from "@/components/GameIllustration";

const gamesList = [
  // Jogos Básicos
  {
    id: 'memoria-colorida',
    title: "Memória Colorida",
    category: "Memória & Atenção",
    description: "Repita sequências de cores em ordem crescente de dificuldade. Desenvolva memória de trabalho e atenção sequencial.",
    features: ["Memória de trabalho", "Atenção sequencial", "Coordenação mão-olho", "Progressão adaptativa"],
    ageRange: "6-16 anos",
    duration: "5-15 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-purple-600",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'caca-foco',
    title: "Caça ao Foco",
    category: "Atenção & Concentração",
    description: "Encontre objetos específicos entre distrações visuais. Desenvolva atenção seletiva e controle inibitório.",
    features: ["Atenção seletiva", "Controle inibitório", "Processamento visual", "Resistência a distrações"],
    ageRange: "5-14 anos",
    duration: "3-10 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-blue-100 text-blue-800",
    gradient: "from-blue-400 to-blue-600",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'logica-rapida',
    title: "Lógica Rápida",
    category: "Raciocínio & Lógica",
    description: "Resolva quebra-cabeças de padrões em tempo limitado. Desenvolva raciocínio lógico e velocidade de processamento.",
    features: ["Raciocínio lógico", "Reconhecimento de padrões", "Velocidade de processamento", "Resolução de problemas"],
    ageRange: "8-18 anos",
    duration: "5-12 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-green-100 text-green-800",
    gradient: "from-green-400 to-green-600",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'ritmo-musical',
    title: "Ritmo Musical",
    category: "Coordenação & Ritmo",
    description: "Replique padrões rítmicos musicais usando teclado ou toques. Desenvolva coordenação e percepção temporal.",
    features: ["Coordenação motora", "Percepção temporal", "Memória auditiva", "Sincronização"],
    ageRange: "6-16 anos",
    duration: "4-10 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-orange-100 text-orange-800",
    gradient: "from-orange-400 to-orange-600",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'caca-letras',
    title: "Caça Letras",
    category: "Leitura & Dislexia",
    description: "Encontre letras específicas dentro de palavras. Desenvolva reconhecimento visual rápido e consciência fonológica.",
    features: ["Reconhecimento visual", "Processamento fonológico", "Atenção seletiva", "Velocidade de leitura"],
    ageRange: "5-14 anos",
    duration: "3-8 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-emerald-100 text-emerald-800",
    gradient: "from-emerald-400 to-emerald-600",
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
      color: 'bg-emerald-100 text-emerald-800',
      gradient: 'from-emerald-400 to-emerald-600',
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
      color: 'bg-purple-100 text-purple-800',
      gradient: 'from-purple-400 to-purple-600',
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
      color: 'bg-yellow-100 text-yellow-800',
      gradient: 'from-yellow-400 to-orange-600',
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
      color: 'bg-pink-100 text-pink-800',
      gradient: 'from-pink-400 to-purple-600',
      unlocked: true,
      type: 'basic'
    },
    {
      id: 'focus-forest',
      title: 'Floresta do Foco',
      category: 'Atenção & Biofeedback',
      description: 'Desenvolva concentração e controle emocional através de um jogo de tiro ao alvo com sistema de biofeedback integrado.',
      features: ['Biofeedback emocional', 'Exercícios de respiração', 'Progressão adaptativa', 'Análise comportamental'],
      ageRange: '8-18 anos',
      duration: '10-20 min',
      players: '1 jogador',
      status: 'Disponível',
      color: 'bg-emerald-100 text-emerald-800',
      gradient: 'from-emerald-400 to-green-600',
      unlocked: true,
      type: 'basic'
    },
  
  // Jogos Diagnósticos
  {
    id: 'attention-sustained',
    title: "Teste de Atenção Sustentada",
    category: "Diagnóstico • TDAH",
    description: "Avaliação científica da capacidade de manter atenção focada. Identifica déficits característicos do TDAH.",
    features: ["Vigilância sustentada", "Tempo de reação", "Controle inibitório", "Declínio da atenção"],
    ageRange: "6-18 anos",
    duration: "8-12 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-red-100 text-red-800",
    gradient: "from-red-400 to-red-600",
    unlocked: true,
    type: "diagnostic"
  },
  {
    id: 'cognitive-flexibility',
    title: "Flexibilidade Cognitiva",
    category: "Diagnóstico • TEA",
    description: "Teste baseado no Wisconsin Card Sorting. Detecta rigidez cognitiva e dificuldades executivas típicas do TEA.",
    features: ["Mudança de regras", "Adaptabilidade", "Função executiva", "Perseveração"],
    ageRange: "8-18 anos",
    duration: "10-15 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-indigo-100 text-indigo-800",
    gradient: "from-indigo-400 to-indigo-600",
    unlocked: true,
    type: "diagnostic"
  },
  {
    id: 'phonological-processing',
    title: "Processamento Fonológico",
    category: "Diagnóstico • Dislexia",
    description: "Avalia habilidades de consciência fonológica. Principal indicador de risco para dificuldades de leitura.",
    features: ["Rimas", "Segmentação", "Síntese", "Manipulação fonêmica"],
    ageRange: "5-16 anos",
    duration: "6-10 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-teal-100 text-teal-800",
    gradient: "from-teal-400 to-teal-600",
    unlocked: true,
    type: "diagnostic"
  },
  {
    id: 'emotion-lab',
    title: "Laboratório das Emoções",
    category: "Regulação Emocional & Social",
    description: "Desenvolva reconhecimento e regulação emocional através de cenários interativos e exercícios de inteligência emocional.",
    features: ["Reconhecimento facial", "Regulação emocional", "Situações sociais", "Inteligência emocional"],
    ageRange: "6-16 anos",
    duration: "10-20 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-pink-100 text-pink-800",
    gradient: "from-pink-400 to-purple-600",
    unlocked: true,
    type: "basic"
  },
  {
    id: 'spatial-architect',
    title: "Arquiteto Espacial",
    category: "Habilidades Visuoespaciais & Planejamento",
    description: "Construa estruturas 3D, resolva quebra-cabeças de rotação e desenvolva habilidades visuoespaciais através de desafios arquitetônicos.",
    features: ["Rotação mental", "Construção 3D", "Planejamento espacial", "Coordenação mão-olho"],
    ageRange: "7-15 anos",
    duration: "8-15 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-cyan-100 text-cyan-800",
    gradient: "from-blue-400 to-green-500",
    unlocked: true,
    type: "basic"
  }
];

export default function Games() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
              Jogos 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Terapêuticos
              </span>
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-3xl mx-auto text-balance mb-8">
            Desenvolva habilidades cognitivas através de jogos divertidos e envolventes.
          </p>
        </div>

        {/* Clinical Dashboard CTA Card */}
        <Card className="mb-12 bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-md border-purple-400/50 shadow-2xl overflow-hidden max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">Descubra Seu Perfil Cognitivo</h3>
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg">
                    IA
                  </Badge>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  Complete os <strong>testes diagnósticos</strong> e receba uma análise clínica detalhada gerada por IA. 
                  Identifique padrões de TEA, TDAH e Dislexia com precisão científica.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs text-white/70">
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                    <Target className="h-3 w-3" />
                    <span>TDAH: Atenção Sustentada</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                    <Trophy className="h-3 w-3" />
                    <span>TEA: Flexibilidade Cognitiva</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                    <Target className="h-3 w-3" />
                    <span>Dislexia: Processamento Fonológico</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  asChild
                >
                  <Link to="/clinical" className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Acessar Painel Clínico
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="bg-card/50 border-border text-foreground hover:bg-accent"
                >
                  <Link to="/diagnostic-tests" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Ver Testes Diagnósticos
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Jogos Básicos */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Jogos Disponíveis
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {gamesList.filter(game => game.type === 'basic').map((game) => (
              <Card 
                key={game.id}
                className={`p-6 border-white/20 backdrop-blur-sm bg-white/10 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 group relative overflow-hidden ${
                  !game.unlocked ? 'opacity-75' : ''
                }`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-20`} />
                
                {/* Game Illustration Background */}
                <div className="absolute top-4 right-4 opacity-15">
                  <GameIllustration gameId={game.id} className="w-24 h-24" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <GameIllustration gameId={game.id} className="w-5 h-5" animated />
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white border-0 shadow-lg">
                        {game.category}
                      </Badge>
                    </div>
                    {!game.unlocked && <Lock className="h-4 w-4 text-white/50" />}
                  </div>

                  <h3 className="font-heading text-xl font-bold mb-3 text-white group-hover:text-purple-200 transition-colors">
                    {game.title}
                  </h3>

                  <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-3">
                    {game.description}
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      <span>{game.ageRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{game.duration}</span>
                    </div>
                  </div>

                  <Button 
                    className={cn(
                      'w-full text-sm transition-all duration-300',
                      game.unlocked 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25' 
                        : 'bg-white/20 text-white/70 cursor-not-allowed'
                    )}
                    disabled={!game.unlocked}
                    asChild={game.unlocked}
                    size="sm"
                  >
                    {game.unlocked ? (
                      <Link to={`/games/${game.id}`} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Jogar
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Em Breve
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}