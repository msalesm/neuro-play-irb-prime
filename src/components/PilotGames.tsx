import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pilotGames = [
  {
    title: "MindfulBreath Adventures",
    category: "Regulação Emocional",
    description: "Uma jornada interativa que ensina técnicas de respiração através de aventuras calmantes com personagens acolhedores.",
    features: ["Técnicas de respiração gamificadas", "Personagens empáticos", "Progresso visual"],
    ageRange: "5-15 anos",
    duration: "10-20 min",
    players: "1 jogador",
    status: "Em desenvolvimento",
    color: "bg-green-100 text-green-800",
    route: "/games/mindful-breath"
  },
  {
    title: "Focus Forest",
    category: "Atenção & Foco",
    description: "Cultive uma floresta mágica mantendo a atenção em tarefas progressivamente mais desafiadoras, com recompensas visuais satisfatórias.",
    features: ["Atenção sustentada", "Níveis adaptativos", "Recompensas naturais"],
    ageRange: "8-25 anos",
    duration: "15-30 min",
    players: "1-2 jogadores",
    status: "Alpha testing",
    color: "bg-blue-100 text-blue-800",
    route: "/games/focus-forest"
  },
  {
    title: "Social Scenarios Simulator",
    category: "Social Skills",
    description: "Pratique interações sociais em ambientes seguros e controlados, com feedback construtivo e múltiplas abordagens possíveis.",
    features: ["Cenários reais", "Múltiplas escolhas", "Feedback positivo"],
    ageRange: "12-30 anos",
    duration: "20-40 min",
    players: "1-4 jogadores",
    status: "Conceito validado",
    color: "bg-purple-100 text-purple-800",
    route: "/games/social-scenarios"
  }
];

export const PilotGames = () => {
  const navigate = useNavigate();

  const handleGameClick = (route: string) => {
    navigate(route);
  };

  return (
    <section className="py-24 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-balance">
            Jogos Piloto Prioritários
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Nossos três primeiros jogos foram selecionados com base no maior potencial 
            de impacto terapêutico e validação científica.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pilotGames.map((game, index) => (
            <Card 
              key={game.title}
              className="p-8 border-0 shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group bg-card"
            >
              <div className="flex justify-between items-start mb-6">
                <Badge className={`${game.color} font-semibold`}>
                  {game.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {game.status}
                </Badge>
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
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                variant="outline"
                onClick={() => handleGameClick(game.route)}
              >
                Jogar Agora
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};