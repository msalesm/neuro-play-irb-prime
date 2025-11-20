import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Microscope, FileText, TrendingUp, Award } from "lucide-react";

const validationAreas = [
  {
    icon: Microscope,
    title: "Parcerias Universitárias",
    description: "Colaboração com centros de pesquisa em neurociência e psicologia cognitiva para validação rigorosa.",
    partners: ["USP", "UNIFESP", "PUC-SP"]
  },
  {
    icon: FileText,
    title: "Publicações Científicas",
    description: "Cada mecânica de jogo é baseada em estudos peer-reviewed e contribui para novas pesquisas.",
    metrics: ["15+ artigos base", "3 estudos próprios", "1 meta-análise"]
  },
  {
    icon: TrendingUp,
    title: "Analytics Terapêuticos",
    description: "Métricas de desenvolvimento disfarçadas de gameplay, permitindo acompanhamento objetivo.",
    features: ["Progress tracking", "Adaptação em tempo real", "Relatórios para terapeutas"]
  },
  {
    icon: Award,
    title: "Certificações",
    description: "Reconhecimento de órgãos reguladores e organizações profissionais de saúde mental.",
    certifications: ["ISO 27001", "LGPD Compliance", "Aprovação CRP"]
  }
];

const researchHighlights = [
  {
    metric: "87%",
    description: "Melhoria em atenção sustentada após 4 semanas"
  },
  {
    metric: "92%",
    description: "Redução de ansiedade em situações sociais"
  },
  {
    metric: "95%",
    description: "Engajamento mantido por mais de 3 meses"
  },
  {
    metric: "78%",
    description: "Transferência de habilidades para vida real"
  }
];

export const ScientificValidation = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            Baseado em Evidências
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-balance">
            Validação Científica Rigorosa
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Cada elemento do GameNeuro é fundamentado em pesquisa científica sólida e 
            continuamente validado através de estudos controlados.
          </p>
        </div>

        {/* Research Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {researchHighlights.map((highlight, index) => (
            <Card key={index} className="p-6 text-center border-0 shadow-soft bg-gradient-accent">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {highlight.metric}
              </div>
              <div className="text-sm text-muted-foreground leading-tight">
                {highlight.description}
              </div>
            </Card>
          ))}
        </div>

        {/* Validation Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {validationAreas.map((area, index) => {
            const IconComponent = area.icon;
            return (
              <Card 
                key={area.title}
                className="p-8 border-0 shadow-card hover:shadow-glow transition-all duration-500 bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-semibold mb-3">
                      {area.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {area.description}
                    </p>

                    {area.partners && (
                      <div className="flex flex-wrap gap-2">
                        {area.partners.map((partner, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {partner}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {area.metrics && (
                      <div className="space-y-2">
                        {area.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                            {metric}
                          </div>
                        ))}
                      </div>
                    )}

                    {area.features && (
                      <div className="space-y-2">
                        {area.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {area.certifications && (
                      <div className="flex flex-wrap gap-2">
                        {area.certifications.map((cert, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-800 text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <Card className="p-12 text-center bg-gradient-hero text-white border-0 shadow-glow">
          <h3 className="font-heading text-3xl font-bold mb-4">
            Participe da Pesquisa
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Seja parte da comunidade científica que está revolucionando a terapia através de jogos. 
            Cadastre-se para receber nossos estudos e participar de pesquisas futuras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-glow"
            >
              Ver Publicações
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-border text-foreground hover:bg-accent"
            >
              Participar Pesquisa
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};