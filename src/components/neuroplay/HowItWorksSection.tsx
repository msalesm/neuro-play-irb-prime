import { Gamepad2, Brain, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Gamepad2,
    title: 'Jogue',
    description: 'Escolha jogos divertidos e estimulantes',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'IA Analisa',
    description: 'Algoritmo avalia seu desempenho em tempo real',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Receba Relatório',
    description: 'Entenda seu perfil cognitivo único',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Evolua',
    description: 'Acompanhe seu progresso diário',
    color: 'from-orange-500 to-yellow-500',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Como Funciona</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Um caminho simples para entender e desenvolver suas habilidades cognitivas
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="relative overflow-hidden border-2 hover:shadow-glow transition-smooth hover:scale-105">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {index + 1}
                </div>

                <CardContent className="p-6 pt-8">
                  {/* Icon with Gradient */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>

                {/* Connecting Line (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </Card>
            </div>
          ))}
        </div>

        {/* Mini Metrics Animation */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Análise em tempo real</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">85%</div>
                <div className="text-xs text-muted-foreground">Atenção</div>
              </div>
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <div className="text-2xl font-bold text-secondary mb-1">92%</div>
                <div className="text-xs text-muted-foreground">Memória</div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">78%</div>
                <div className="text-xs text-muted-foreground">Linguagem</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
