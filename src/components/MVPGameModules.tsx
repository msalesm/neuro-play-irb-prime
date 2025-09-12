import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Palette, Target, Zap, Music, ArrowRight, Star, Trophy, Clock } from "lucide-react";

export const MVPGameModules = () => {
  const mvpGames = [
    {
      id: "memoria-colorida",
      title: "Memória Colorida", 
      subtitle: "Estilo Simon",
      description: "Repita sequências de cores em ordem crescente de dificuldade. Desenvolva memória de trabalho e atenção sequencial.",
      icon: Palette,
      color: "bg-gradient-to-br from-purple-400/20 to-purple-600/30",
      iconBg: "bg-purple-100 text-purple-600",
      duration: "1-3 min",
      benefits: ["Memória de trabalho", "Atenção sequencial", "Concentração"],
      emoji: "🎨",
      route: "/games/memoria-colorida",
      difficulty: "Básico → Avançado",
    },
    {
      id: "caca-foco",
      title: "Caça ao Foco",
      subtitle: "Encontrar objetos",
      description: "Encontre o objeto correto entre distrações visuais. Treine atenção seletiva e controle inibitório.",
      icon: Target,
      color: "bg-gradient-to-br from-blue-400/20 to-blue-600/30", 
      iconBg: "bg-blue-100 text-blue-600",
      duration: "1-2 min",
      benefits: ["Atenção seletiva", "Controle inibitório", "Rapidez visual"],
      emoji: "🎯",
      route: "/games/caca-foco",
      difficulty: "3 níveis adaptativos",
    },
    {
      id: "logica-rapida",
      title: "Lógica Rápida",
      subtitle: "Quebra-cabeças",
      description: "Resolva padrões e sequências lógicas progressivas. Desenvolva raciocínio lógico e flexibilidade cognitiva.",
      icon: Zap,
      color: "bg-gradient-to-br from-green-400/20 to-green-600/30",
      iconBg: "bg-green-100 text-green-600", 
      duration: "2-3 min",
      benefits: ["Raciocínio lógico", "Resolução de problemas", "Flexibilidade cognitiva"],
      emoji: "🧩",
      route: "/games/logica-rapida",
      difficulty: "Padrões progressivos",
    },
    {
      id: "ritmo-musical",
      title: "Ritmo Musical",
      subtitle: "Coordenação temporal",
      description: "Toque notas no tempo certo seguindo ritmos musicais. Melhore coordenação motora e processamento auditivo.",
      icon: Music,
      color: "bg-gradient-to-br from-orange-400/20 to-orange-600/30",
      iconBg: "bg-orange-100 text-orange-600",
      duration: "1-3 min", 
      benefits: ["Coordenação motora", "Processamento auditivo", "Ritmo temporal"],
      emoji: "🎵",
      route: "/games/ritmo-musical",
      difficulty: "Ritmos adaptativos",
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Nossos 
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Mini-Jogos</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mx-auto px-4 max-w-3xl">
            4 jogos cientificamente desenvolvidos para treinar diferentes habilidades cognitivas
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Cada jogo dura apenas 1-3 minutos</span>
          </div>
        </div>

        {/* MVP Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {mvpGames.map((game, index) => (
            <Card 
              key={game.id} 
              className={`relative overflow-hidden border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] ${game.color}`}
            >
              <CardContent className="p-6 sm:p-8">
                {/* Game Icon & Emoji */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${game.iconBg} flex items-center justify-center shadow-soft`}>
                    <game.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-3xl sm:text-4xl">{game.emoji}</div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground mb-2">
                    {game.title}
                  </h3>
                  <p className="text-primary font-semibold text-base sm:text-lg">
                    {game.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                  {game.description}
                </p>

                {/* Game Details */}
                <div className="space-y-4 mb-6">
                  {/* Duration */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium text-card-foreground">{game.duration}</span>
                  </div>
                  
                  {/* Difficulty */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dificuldade:</span>
                    <span className="font-medium text-card-foreground">{game.difficulty}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                  <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Desenvolve:
                  </h4>
                  <div className="space-y-2">
                    {game.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-bounce"
                  size="lg"
                >
                  <Link to={game.route} className="flex items-center justify-center gap-2">
                    Jogar Agora
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 bg-primary/5 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-12 sm:w-16 h-12 sm:h-16 bg-accent/10 rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-card mx-auto max-w-2xl">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground mb-4">
              Pronto para o desafio?
            </h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Cada jogo foi desenvolvido para ser divertido, rápido e eficaz no desenvolvimento cognitivo
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center mb-6">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">4</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Mini-Jogos</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">3</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Níveis</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">1-3</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Minutos</div>
              </div>
            </div>
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground shadow-soft transition-bounce"
            >
              <Link to="/auth" className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                Começar Agora - É Grátis!
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};