import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, Target, Heart, ArrowRight, Star, Trophy, Gamepad2 } from "lucide-react";

export const GameModules = () => {
  const modules = [
    {
      id: "letras",
      title: "Mundo das Letras",
      subtitle: "Para Dislexia",
      description: "Treinar leitura e escrita com tarefas divertidas: identificar palavras, separar sílabas coloridas e completar palavras mágicas.",
      icon: BookOpen,
      color: "bg-gradient-to-br from-purple-400/20 to-purple-600/30",
      iconBg: "bg-purple-100 text-purple-600",
      games: ["Palavras Mágicas", "Sílabas Coloridas", "Caça Letras"],
      rewards: "Desbloqueie novos mapas e personagens",
      emoji: "📚",
      route: "/games/focus-forest", // Adapting existing games
    },
    {
      id: "foco", 
      title: "Mestre do Foco",
      subtitle: "Para TDAH",
      description: "Minigames de atenção e memória: tocar sequências de cores, manter ritmo com toques e evitar distrações visuais.",
      icon: Target,
      color: "bg-gradient-to-br from-blue-400/20 to-blue-600/30",
      iconBg: "bg-blue-100 text-blue-600",
      games: ["Sequência Cores", "Ritmo Perfeito", "Foco Total"],
      rewards: "Ganhe skins exclusivas e troféus",
      emoji: "🎯",
      route: "/games/focus-quest",
    },
    {
      id: "emocoes",
      title: "Missão Emoções", 
      subtitle: "Para TEA",
      description: "Situações sociais simples: escolher como cumprimentar, reconhecer emoções em rostos e montar rotinas visuais.",
      icon: Heart,
      color: "bg-gradient-to-br from-green-400/20 to-green-600/30", 
      iconBg: "bg-green-100 text-green-600",
      games: ["Reconhecer Emoções", "Rotina Visual", "Situações Sociais"],
      rewards: "Novos personagens e cenários",
      emoji: "😊",
      route: "/games/social-scenarios",
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header - Mobile First */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Escolha seu 
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Módulo</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mx-auto px-4">
            Três mundos especialmente criados para apoiar diferentes tipos de neurodiversidade
          </p>
        </div>

        {/* Game Modules Grid - Mobile First */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {modules.map((module, index) => (
            <Card 
              key={module.id} 
              className={`relative overflow-hidden border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] ${module.color}`}
            >
              <CardContent className="p-6 sm:p-8">
                {/* Module Icon & Emoji - Mobile Optimized */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${module.iconBg} flex items-center justify-center shadow-soft`}>
                    <module.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-3xl sm:text-4xl">{module.emoji}</div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground mb-2">
                    {module.title}
                  </h3>
                  <p className="text-primary font-semibold text-base sm:text-lg">
                    {module.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                  {module.description}
                </p>

                {/* Mini Games List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Gamepad2 className="w-4 h-4" />
                    Jogos Inclusos:
                  </h4>
                  <ul className="space-y-2">
                    {module.games.map((game, gameIndex) => (
                      <li key={gameIndex} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        {game}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rewards */}
                <div className="mb-8">
                  <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Recompensas:
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>{module.rewards}</span>
                  </p>
                </div>

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-bounce"
                  size="lg"
                >
                  <Link to={module.route} className="flex items-center justify-center gap-2">
                    Explorar Mundo
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

        {/* Bottom CTA - Mobile First */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-card mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground mb-4">
              Pronto para começar a jornada?
            </h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Cada jogo foi desenvolvido por especialistas para apoiar o desenvolvimento cognitivo e emocional
            </p>
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground shadow-soft transition-bounce"
            >
              <Link to="/auth" className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Criar Conta Gratuita
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};