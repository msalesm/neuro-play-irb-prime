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
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header - Mobile First */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Por que o 
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> NeuroPlay?</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mx-auto px-4">
            Criado especificamente para crianças neurodiversas, seguindo as melhores práticas pedagógicas e terapêuticas
          </p>
        </div>

        {/* Features Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 sm:p-8 text-center">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-soft`}>
                  <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold font-heading text-card-foreground mb-3 sm:mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Statistics - Mobile First */}
        <div className="mt-16 sm:mt-20">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-card">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground text-sm sm:text-base">Jogos Cognitivos</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">3</div>
                <div className="text-muted-foreground text-sm sm:text-base">Módulos Especializados</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground text-sm sm:text-base">Baseado em Ciência</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};