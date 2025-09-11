import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Target, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const gamesList = [
  {
    id: 'mindful-breath',
    title: "MindfulBreath Adventures",
    category: "Regulação Emocional",
    description: "Uma jornada interativa que ensina técnicas de respiração através de aventuras calmantes com personagens acolhedores.",
    features: ["Técnicas de respiração gamificadas", "Personagens empáticos", "Progresso visual"],
    ageRange: "5-15 anos",
    duration: "10-20 min",
    players: "1 jogador",
    status: "Disponível",
    color: "bg-green-100 text-green-800",
    gradient: "from-green-400 to-teal-400",
    unlocked: true,
  },
  {
    id: 'focus-forest',
    title: "Focus Forest",
    category: "Atenção & Foco",
    description: "Cultive uma floresta mágica mantendo a atenção em tarefas progressivamente mais desafiadoras, com recompensas visuais satisfatórias.",
    features: ["Atenção sustentada", "Níveis adaptativos", "Recompensas naturais"],
    ageRange: "8-25 anos",
    duration: "15-30 min",
    players: "1-2 jogadores",
    status: "Disponível",
    color: "bg-blue-100 text-blue-800",
    gradient: "from-blue-400 to-purple-400",
    unlocked: true,
  },
  {
    id: 'social-scenarios',
    title: "Social Scenarios Simulator",
    category: "Habilidades Sociais",
    description: "Pratique interações sociais em cenários realistas com feedback terapêutico e sistema de progresso.",
    features: ["Cenários interativos", "Múltiplas escolhas", "Feedback terapêutico", "Sistema de progresso"],
    ageRange: "12-30 anos",
    duration: "5-15 min por cenário",
    players: "Individual",
    status: "Disponível",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-pink-400",
    unlocked: true,
  },
  {
    id: 'sensory-flow',
    title: "SensoryFlow",
    category: "Integração Sensorial",
    description: "Desenvolva discriminação auditiva e processamento temporal através de sequências sonoras progressivas.",
    features: ["Discriminação de frequências", "Processamento sequencial", "Memória auditiva"],
    ageRange: "6-25 anos",
    duration: "10-25 min",
    players: "1 jogador",
    status: "Novo!",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-pink-400",
    unlocked: true,
  },
  {
    id: 'touch-mapper',
    title: "TouchMapper",
    category: "Integração Sensorial",
    description: "Explore texturas virtuais para desenvolver processamento tátil e dessensibilização gradual.",
    features: ["Discriminação tátil", "Dessensibilização", "Propriocepção"],
    ageRange: "5-20 anos",
    duration: "10-20 min",
    players: "1 jogador",
    status: "Novo!",
    color: "bg-orange-100 text-orange-800",
    gradient: "from-orange-400 to-red-400",
    unlocked: true,
  },
  {
    id: 'visual-sync',
    title: "VisualSync",
    category: "Integração Sensorial",
    description: "Aprimore integração visuo-motora e percepção espacial através de rastreamento visual dinâmico.",
    features: ["Rastreamento visual", "Coordenação olho-mão", "Processamento espacial"],
    ageRange: "7-25 anos",
    duration: "12-25 min",
    players: "1 jogador",
    status: "Novo!",
    color: "bg-blue-100 text-blue-800",
    gradient: "from-blue-400 to-indigo-400",
    unlocked: true,
  },
  {
    id: 'balance-quest',
    title: "BalanceQuest",
    category: "Sistema Vestibular",
    description: "Fortaleça equilíbrio e coordenação motora usando sensores de movimento ou controle por mouse.",
    features: ["Controle postural", "Sistema vestibular", "Propriocepção"],
    ageRange: "8-30 anos",
    duration: "15-25 min",
    players: "1 jogador",
    status: "Novo!",
    color: "bg-teal-100 text-teal-800",
    gradient: "from-teal-400 to-cyan-400",
    unlocked: true,
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
            Jogos Terapêuticos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Desenvolva suas habilidades através de experiências divertidas e cientificamente validadas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {gamesList.map((game) => (
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
  );
}