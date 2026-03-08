import { Card } from "@/components/ui/card";
import { Focus, Users, Heart, Brain, Headphones } from "lucide-react";

const gameCategories = [
  {
    icon: Focus,
    title: "Atenção & Foco",
    description: "Jogos que treinam sustentação atencional de forma progressiva e personalizada",
    features: ["Flow state adaptativo", "Níveis progressivos", "Feedback positivo"],
    color: "from-blue-400/20 to-blue-600/20"
  },
  {
    icon: Users,
    title: "Social Skills",
    description: "Simuladores de interação social segura para desenvolvimento de habilidades sociais",
    features: ["Ambiente controlado", "Cenários reais", "Multiplayer cooperativo"],
    color: "from-purple-400/20 to-purple-600/20"
  },
  {
    icon: Heart,
    title: "Regulação Emocional",
    description: "Aventuras que ensinam estratégias de calm-down e autorregulação emocional",
    features: ["Técnicas de respiração", "Mindfulness lúdico", "Estratégias personalizadas"],
    color: "from-green-400/20 to-green-600/20"
  },
  {
    icon: Brain,
    title: "Funções Executivas",
    description: "Puzzles e desafios que desenvolvem planejamento, organização e memória",
    features: ["Puzzles adaptativos", "Planejamento estratégico", "Memória de trabalho"],
    color: "from-orange-400/20 to-orange-600/20"
  },
  {
    icon: Headphones,
    title: "Integração Sensorial",
    description: "Jogos que trabalham processamento e integração sensorial de forma lúdica",
    features: ["Estímulos customizáveis", "Ambientes sensoriais", "Dessensibilização gradual"],
    color: "from-teal-400/20 to-teal-600/20"
  }
];

export const GameCategories = () => {
  return (
    <section className="py-24 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-balance">
            Categorias Terapêuticas
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Cada categoria é projetada com base em evidências científicas para desenvolver 
            habilidades específicas de forma natural e divertida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.title}
                className="p-8 border-0 shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group cursor-pointer bg-gradient-card"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                
                <h3 className="font-heading text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {category.description}
                </p>

                <ul className="space-y-2">
                  {category.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};