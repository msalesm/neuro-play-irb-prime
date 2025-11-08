import { NeuroPlayHero } from "@/components/NeuroPlayHero";
import { MVPGameModules } from "@/components/MVPGameModules";
import { NeuroPlayFeatures } from "@/components/NeuroPlayFeatures";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Target, TrendingUp, ArrowRight, GraduationCap, Zap, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <AccessibilityControls />
      <NeuroPlayHero />
      
      {/* Triagens - Seção Principal */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Destaque • Triagens Diagnósticas
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Identifique Precocemente
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Testes gamificados baseados em evidências científicas para detecção de TEA, TDAH e Dislexia
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-glow transition-all duration-300 border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Triagem TEA</CardTitle>
                <CardDescription>Transtorno do Espectro Autista</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Avaliação de habilidades sociais, comunicação e padrões comportamentais
                </p>
                <Button asChild className="w-full">
                  <Link to="/diagnostico-completo">
                    Iniciar Triagem
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 border-secondary/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Triagem TDAH</CardTitle>
                <CardDescription>Déficit de Atenção e Hiperatividade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Avaliação de atenção, impulsividade e controle executivo
                </p>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/diagnostico-completo">
                    Iniciar Triagem
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 border-accent/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Triagem Dislexia</CardTitle>
                <CardDescription>Dificuldades de Leitura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Avaliação de processamento fonológico e habilidades de leitura
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/diagnostico-completo">
                    Iniciar Triagem
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="shadow-soft">
              <Link to="/diagnostico-completo" className="flex items-center gap-2">
                Ver Todos os Testes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <MVPGameModules />
      
      {/* Dashboard dos Pais Section */}
      {user && (
        <section className="py-24 bg-gradient-to-br from-muted/30 to-primary/10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Para Pais
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Acompanhe o Desenvolvimento
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Dashboard completo para monitorar progresso, ver relatórios e acessar capacitação
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-card">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Dashboard da Família</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Acompanhe o progresso e desempenho do seu filho
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/dashboard-pais">
                      Acessar Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle>Relatórios Clínicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Relatórios detalhados com análise de IA
                  </p>
                  <Button asChild className="w-full" variant="secondary">
                    <Link to="/clinical">
                      Ver Relatórios
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Capacitação para Pais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Aprenda a apoiar o desenvolvimento do seu filho
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/capacitacao-pais">
                      Iniciar Capacitação
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
      
      {/* Educational System Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {t('common.newFeature')} • {t('educational.title')}
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('educational.title')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('educational.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('educational.features.unifiedScoring.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {t('educational.features.unifiedScoring.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-lg">{t('educational.features.pedagogicalFeedback.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {t('educational.features.pedagogicalFeedback.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{t('educational.features.adaptiveLearning.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {t('educational.features.adaptiveLearning.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('educational.features.progressTracking.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {t('educational.features.progressTracking.description')}
                </p>
              </CardContent>
            </Card>
          </div>

          {user && (
            <div className="text-center mt-12">
              <Button asChild size="lg" className="shadow-soft">
                <Link to="/educational-dashboard" className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t('common.myLearning')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Clinical Dashboard Section */}
      {user && (
        <section className="py-24 bg-gradient-to-br from-muted/30 to-accent/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-red-100 text-red-800 border-red-200">
                {t('common.newFeature')} • {t('clinical.behavioralAnalysis')}
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  {t('clinical.title')}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('clinical.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Card className="shadow-card border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <Stethoscope className="w-5 h-5 mr-2" />
                      {t('clinical.diagnosticTests')}
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
                      {t('clinical.behavioralAnalysis')}
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
                      {t('clinical.automaticReports')}
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
                        {t('clinical.accessPanel')}
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