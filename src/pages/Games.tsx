import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Target, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="min-h-screen bg-gradient-card py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-balance">
            Jogos 
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">NeuroPlay</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Jogos terapêuticos e testes diagnósticos para desenvolvimento cognitivo e detecção precoce.
          </p>
        </div>

        {/* Seção de Jogos Básicos */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Jogos Terapêuticos
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {gamesList.filter(game => game.type === 'basic').map((game) => (
              <Card 
                key={game.id}
                className={`p-6 border-0 shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group bg-card relative overflow-hidden ${
                  !game.unlocked ? 'opacity-75' : ''
                }`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-5`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className={`${game.color} font-semibold text-xs`}>
                      {game.category}
                    </Badge>
                    {!game.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  <h3 className="font-heading text-lg font-bold mb-3 group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                    {game.description}
                  </p>

                  <div className="space-y-2 mb-4 text-xs text-muted-foreground">
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
                    className={`w-full text-sm ${game.unlocked ? 'group-hover:bg-primary group-hover:text-primary-foreground' : ''} transition-colors`}
                    variant={game.unlocked ? "default" : "secondary"}
                    disabled={!game.unlocked}
                    asChild={game.unlocked}
                    size="sm"
                  >
                    {game.unlocked ? (
                      <Link to={`/games/${game.id}`} className="flex items-center gap-2">
                        <Play className="h-3 w-3" />
                        Jogar
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Em Breve
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Seção de Jogos Diagnósticos */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">
            <span className="bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
              Testes Diagnósticos
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Avaliações científicas para identificação precoce de TEA, TDAH e Dislexia
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {gamesList.filter(game => game.type === 'diagnostic').map((game) => (
            <Card 
              key={game.id}
              className={`p-8 border-0 shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group bg-card relative overflow-hidden ${
                !game.unlocked ? 'opacity-75' : ''
              }`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-5`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <Badge className={`${game.color} font-semibold`}>
                    {game.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {game.status}
                    </Badge>
                    {!game.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                <h3 className="font-heading text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {game.title}
                </h3>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {game.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>{game.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{game.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{game.players}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Características Principais
                  </h4>
                  {game.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${game.unlocked ? 'group-hover:bg-primary group-hover:text-primary-foreground' : ''} transition-colors`}
                  variant={game.unlocked ? "default" : "secondary"}
                  disabled={!game.unlocked}
                  asChild={game.unlocked}
                >
                  {game.unlocked ? (
                    <Link to={`/games/${game.id}`} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Jogar Agora
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