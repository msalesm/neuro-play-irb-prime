import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, Sparkles } from 'lucide-react';

export function NeuralHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Neural Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
        {/* Floating Synapses Animation */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Neural Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {[...Array(15)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#neural-gradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${Math.random() * 2}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Brain Icon with Glow */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <Brain className="w-20 h-20 text-primary relative z-10" />
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
          Neuro IRB Prime
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Jogos cognitivos com IA que identificam e estimulam suas habilidades únicas
        </p>

        {/* Unique Brain Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Cada cérebro é único</span>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link to="/games">
            <Button size="lg" className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-smooth">
              Começar agora
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Jogos Cognitivos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Baseado em Ciência</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">IA</div>
            <div className="text-sm text-muted-foreground">Diagnóstico Inteligente</div>
          </div>
        </div>
      </div>
    </section>
  );
}
