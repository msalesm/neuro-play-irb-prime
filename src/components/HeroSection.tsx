import { Button } from "@/components/ui/button";
import { Brain, Gamepad2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/hero-gaming.jpg)' }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Brain className="h-12 w-12" />
            </div>
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Gamepad2 className="h-12 w-12" />
            </div>
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Heart className="h-12 w-12" />
            </div>
          </div>
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 text-balance">
          GameNeuro
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-light mb-8 text-balance opacity-95">
          Jogos Terapêuticos para Neurodiversidade
        </h2>
        
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-balance opacity-90">
          Transformamos desenvolvimento de habilidades em experiências divertidas e engajantes. 
          Jogos adaptativos baseados em evidências científicas que celebram a neurodiversidade.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/games')}
            className="bg-white text-primary hover:bg-white/90 shadow-glow text-lg px-8 py-4 transition-bounce font-semibold"
          >
            Explorar Jogos
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-border text-foreground hover:bg-accent text-lg px-8 py-4 transition-smooth"
          >
            Validação Científica
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">3-99</div>
            <div className="text-lg opacity-80">Anos de idade</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">5</div>
            <div className="text-lg opacity-80">Categorias terapêuticas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-lg opacity-80">Baseado em evidências</div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-32 right-20 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-1000" />
    </section>
  );
};