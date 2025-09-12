import { NeuroPlayHero } from "@/components/NeuroPlayHero";
import { MVPGameModules } from "@/components/MVPGameModules";
import { NeuroPlayFeatures } from "@/components/NeuroPlayFeatures";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <AccessibilityControls />
      <NeuroPlayHero />
      <MVPGameModules />
      
      {/* Clinical Dashboard Section */}
      {user && (
        <section className="py-24 bg-gradient-to-br from-muted/30 to-accent/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-red-100 text-red-800 border-red-200">
                Novidade • Análise Comportamental
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  Painel Clínico Avançado
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Sistema de análise comportamental com IA para identificação precoce de TEA, TDAH e Dislexia
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Card className="shadow-card border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <Stethoscope className="w-5 h-5 mr-2" />
                      Avaliações Diagnósticas
                    </CardTitle>
                    <CardDescription>
                      Testes baseados em evidências científicas para detecção precoce
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                        Teste de Atenção Sustentada (TDAH)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                        Flexibilidade Cognitiva (TEA)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3" />
                        Processamento Fonológico (Dislexia)
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <Brain className="w-5 h-5 mr-2" />
                      Análise Comportamental
                    </CardTitle>
                    <CardDescription>
                      IA analisa padrões de comportamento em tempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                        Métricas de função executiva
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                        Padrões de atenção e concentração
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        Indicadores de desenvolvimento social
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="shadow-glow border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Relatórios Automáticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Receba análises detalhadas com recomendações personalizadas baseadas no desempenho dos jogos.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Avaliação de Risco</span>
                        <Badge variant="outline">Automática</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Sugestões de Intervenção</span>
                        <Badge variant="outline">Personalizada</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Acompanhamento Contínuo</span>
                        <Badge variant="outline">Em Tempo Real</Badge>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full mt-6 shadow-soft">
                      <Link to="/clinical" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Acessar Painel Clínico
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}
      
      <NeuroPlayFeatures />
      <Footer />
    </div>
  );
};

export default Index;