import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, Gamepad2, Target, Puzzle, Type, Lightbulb, Zap, Rainbow, BarChart3, School, Heart, ArrowRight, ClipboardCheck, Users } from 'lucide-react';
import { NeuralHero } from '@/components/neuroplay/NeuralHero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HowItWorksSection } from '@/components/neuroplay/HowItWorksSection';
import { CognitiveGamesGrid } from '@/components/neuroplay/CognitiveGamesGrid';
import { AIDiagnosticSection } from '@/components/neuroplay/AIDiagnosticSection';
import { ResultsDashboardPreview } from '@/components/neuroplay/ResultsDashboardPreview';
import { InstitutionalSection } from '@/components/neuroplay/InstitutionalSection';
import { TestimonialsCarousel } from '@/components/neuroplay/TestimonialsCarousel';
import { Footer } from '@/components/Footer';

export default function NeuroPlayIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Neural Hero Section */}
      <NeuralHero />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Neuro Play EDU - Complete Platform Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Neuro Play EDU</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Plataforma completa de identificação, intervenção e capacitação para neurodiversidade - em conformidade com a Lei 14.254/21
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Triagem Gamificada */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <CardHeader className="relative">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white w-fit mb-3">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Triagem Gamificada</CardTitle>
              <CardDescription>Identificação precoce através de jogos validados</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-blue-500/10 text-blue-500 mt-0.5">
                    <Target className="h-3 w-3" />
                  </div>
                  <span><strong>Dislexia:</strong> Processamento fonológico e leitura</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-blue-500/10 text-blue-500 mt-0.5">
                    <Zap className="h-3 w-3" />
                  </div>
                  <span><strong>TDAH:</strong> Atenção sustentada e controle inibitório</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-blue-500/10 text-blue-500 mt-0.5">
                    <Heart className="h-3 w-3" />
                  </div>
                  <span><strong>TEA:</strong> Cognição social e teoria da mente</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  ⏱️ 10-15 minutos por módulo | 📊 Relatórios instantâneos | 🎯 Baseado em percentis
                </p>
                <Button asChild className="w-full" size="lg">
                  <Link to="/screening">
                    Iniciar Triagem
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PEI Inteligente */}
          <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <CardHeader className="relative">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white w-fit mb-3">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">PEI Inteligente</CardTitle>
              <CardDescription>Plano Educacional Individualizado com IA</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-green-500/10 text-green-500 mt-0.5">
                    <Lightbulb className="h-3 w-3" />
                  </div>
                  <span><strong>Objetivos personalizados</strong> baseados na triagem</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-green-500/10 text-green-500 mt-0.5">
                    <Puzzle className="h-3 w-3" />
                  </div>
                  <span><strong>Atividades adaptativas</strong> com progressão gradual</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-green-500/10 text-green-500 mt-0.5">
                    <BarChart3 className="h-3 w-3" />
                  </div>
                  <span><strong>Monitoramento contínuo</strong> de progresso</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  🤖 Gerado por IA | ✏️ Editável pelo professor | 📈 Acompanhamento em tempo real
                </p>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/teacher-dashboard">
                    Gerenciar PEIs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Capacitação Docente */}
          <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
            <CardHeader className="relative">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white w-fit mb-3">
                <School className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Capacitação Docente</CardTitle>
              <CardDescription>Formação gamificada em neurodiversidade</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-purple-500/10 text-purple-500 mt-0.5">
                    <Type className="h-3 w-3" />
                  </div>
                  <span><strong>6 módulos especializados</strong> em dislexia, TDAH e TEA</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-purple-500/10 text-purple-500 mt-0.5">
                    <Gamepad2 className="h-3 w-3" />
                  </div>
                  <span><strong>Quizzes interativos</strong> com explicações detalhadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-1 rounded bg-purple-500/10 text-purple-500 mt-0.5">
                    <Rainbow className="h-3 w-3" />
                  </div>
                  <span><strong>Certificados digitais</strong> e ranking de desempenho</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  🎓 30 questões por módulo | 🏆 Sistema de pontuação | 📜 Certificação automática
                </p>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/training">
                    Iniciar Capacitação
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Panel */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle className="text-center">Acesso Rápido - Painel do Professor</CardTitle>
            <CardDescription className="text-center">
              Gerencie triagens, visualize PEIs e acompanhe o progresso de todos os alunos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="min-w-[200px]">
                <Link to="/screening">
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Nova Triagem
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[200px]">
                <Link to="/teacher-dashboard">
                  <Users className="h-5 w-5 mr-2" />
                  Painel do Professor
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[200px]">
                <Link to="/training">
                  <School className="h-5 w-5 mr-2" />
                  Minha Capacitação
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cognitive Games Grid */}
      <CognitiveGamesGrid />

      {/* AI Diagnostic Section */}
      <AIDiagnosticSection />

      {/* Results Dashboard Preview */}
      <ResultsDashboardPreview />

      {/* Institutional Section */}
      <InstitutionalSection />

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Footer */}
      <Footer />
    </div>
  );
}
