import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Heart, Sparkles } from "lucide-react";

export const NeuroPlayHero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Floating elements for playful design - adjusted for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-8 sm:w-16 h-8 sm:h-16 bg-accent/20 rounded-full animate-pulse"></div>
        <div className="absolute top-16 sm:top-32 right-8 sm:right-20 w-6 sm:w-12 h-6 sm:h-12 bg-primary-glow/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 sm:bottom-40 left-6 sm:left-32 w-10 sm:w-20 h-10 sm:h-20 bg-secondary/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-8 sm:bottom-20 right-4 sm:right-10 w-7 sm:w-14 h-7 sm:h-14 bg-accent/25 rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto py-12 sm:py-20 text-center relative z-10 max-w-4xl">
        {/* Logo/Mascot Area - Mobile First */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-glow">
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary animate-pulse" />
          </div>
        </div>

        {/* Main Title - Mobile First */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-heading text-foreground mb-4 sm:mb-6">
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            NeuroPlay
          </span>
        </h1>

        {/* Subtitle - Mobile First */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-3 sm:mb-4 mx-auto font-medium px-4">
          Jogos cognitivos divertidos para crianças e jovens neurodiversos
        </p>

        <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 sm:mb-12 mx-auto px-4 leading-relaxed">
          Minigames de 1-3 minutos que apoiam o desenvolvimento de crianças com 
          <span className="text-dislexia font-semibold"> Dislexia</span>, 
          <span className="text-tdah font-semibold"> TDAH</span> e 
          <span className="text-tea font-semibold"> TEA</span>
        </p>

        {/* Call to Action - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-bounce px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
          >
            <Link to="/games" className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Começar a Jogar
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
          >
            <Link to="/dashboard" className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Ver Progresso
            </Link>
          </Button>
        </div>

        {/* Features highlight with neurodiversity colors - Mobile First */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mx-auto px-4">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-card border border-orange-200/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-tdah rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow">
              <span className="text-xl sm:text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2 text-sm sm:text-base text-tdah">TDAH - Foco</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Jogos de atenção e concentração</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-card border border-blue-200/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-tea rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow">
              <span className="text-xl sm:text-2xl">🧩</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2 text-sm sm:text-base text-tea">TEA - Rotinas</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Estrutura e previsibilidade social</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-card border border-green-200/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-dislexia rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow">
              <span className="text-xl sm:text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2 text-sm sm:text-base text-dislexia">Dislexia - Leitura</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Processamento fonológico e palavras</p>
          </div>
        </div>
      </div>
    </section>
  );
};