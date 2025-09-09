import { Card } from "@/components/ui/card";
import { Accessibility, Award, Settings, Sparkles, Shield, Users } from "lucide-react";

const principles = [
  {
    icon: Sparkles,
    title: "Flow State Personalizado",
    description: "Cada perfil neurológico tem seu próprio ritmo de aprendizado e engajamento otimizado"
  },
  {
    icon: Award,
    title: "Feedback Positivo",
    description: "Focamos no processo, não no resultado, celebrando cada pequeno progresso"
  },
  {
    icon: Settings,
    title: "Escolhas Múltiplas",
    description: "Respeitamos a autonomia do jogador com múltiplas formas de interação e progresso"
  },
  {
    icon: Accessibility,
    title: "Ambientes Customizáveis",
    description: "Configurações sensoriais personalizáveis para cada necessidade específica"
  },
  {
    icon: Users,
    title: "Celebração da Neurodiversidade",
    description: "Narrativas que apresentam a neurodiversidade como uma força, não uma limitação"
  },
  {
    icon: Shield,
    title: "Espaço Seguro",
    description: "Ambiente livre de julgamento onde erros fazem parte natural do aprendizado"
  }
];

export const DesignPrinciples = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-balance">
            Princípios de Design Inclusivo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Nossa abordagem garante que cada jogo seja acessível, engajante e 
            terapeuticamente eficaz para todos os perfis neurodivergentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => {
            const IconComponent = principle.icon;
            return (
              <Card 
                key={principle.title}
                className="p-8 border-0 shadow-soft hover:shadow-card transition-all duration-500 group bg-card hover:bg-gradient-accent"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {principle.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};