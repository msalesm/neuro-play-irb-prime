import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Heart, Sparkles } from "lucide-react";

export const NeuroPlayHero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Floating elements for playful design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-12 h-12 bg-primary-glow/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-secondary/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-accent/25 rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        {/* Logo/Mascot Area */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-glow">
            <Brain className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold font-heading text-foreground mb-6">
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            NeuroPlay
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto font-medium">
          Jogos cognitivos divertidos para crianças e jovens neurodiversos
        </p>

        <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
          Minigames de 1-3 minutos que apoiam o desenvolvimento de crianças com 
          <span className="text-primary font-semibold"> Dislexia</span>, 
          <span className="text-primary font-semibold"> TDAH</span> e 
          <span className="text-primary font-semibold"> TEA</span>
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-bounce px-8 py-4 text-lg"
          >
            <Link to="/games" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Começar a Jogar
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg"
          >
            <Link to="/dashboard" className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Ver Progresso
            </Link>
          </Button>
        </div>

        {/* Features highlight */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Jogos Rápidos</h3>
            <p className="text-sm text-muted-foreground">Atividades de 1-3 minutos para manter o foco</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Recompensas</h3>
            <p className="text-sm text-muted-foreground">Sistema de pontos e conquistas motivadoras</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Acompanhamento</h3>
            <p className="text-sm text-muted-foreground">Relatórios simples para pais e professores</p>
          </div>
        </div>
      </div>
    </section>
  );
};