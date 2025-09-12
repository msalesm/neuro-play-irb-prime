import { Card, CardContent } from "@/components/ui/card";
import { Clock, Zap, BarChart3, Users, Shield, Smile } from "lucide-react";

export const NeuroPlayFeatures = () => {
  const features = [
    {
      icon: Clock,
      title: "Jogos Rápidos",
      description: "Atividades de 1-3 minutos projetadas para manter o engajamento e evitar fadiga cognitiva",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Zap,
      title: "Feedback Imediato",
      description: "Recompensas visuais e sonoras instantâneas que motivam e celebram cada conquista",
      color: "text-yellow-500", 
      bg: "bg-yellow-50",
    },
    {
      icon: BarChart3,
      title: "Progressão Adaptativa",
      description: "A dificuldade se ajusta automaticamente baseada no desempenho individual da criança",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: Users,
      title: "Relatórios Simples",
      description: "Acompanhamento claro do progresso para pais, professores e terapeutas",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: Shield,
      title: "Ambiente Seguro",
      description: "Interface limpa, sem distrações desnecessárias, focada no bem-estar da criança",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      icon: Smile,
      title: "Design Amigável",
      description: "Cores suaves, sons leves e personagens divertidos que criam uma experiência acolhedora",
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Por que o 
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> NeuroPlay?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Criado especificamente para crianças neurodiversas, seguindo as melhores práticas pedagógicas e terapêuticas
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold font-heading text-card-foreground mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Statistics */}
        <div className="mt-20">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground">Jogos Cognitivos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <div className="text-muted-foreground">Módulos Especializados</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Baseado em Ciência</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};