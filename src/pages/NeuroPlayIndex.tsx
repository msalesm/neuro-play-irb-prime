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

      {/* Neuro Play EDU - Screening Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary/60 text-white">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Neuro Play EDU</CardTitle>
                <CardDescription>Triagem Gamificada - Lei 14.254/21</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <p className="text-muted-foreground">
              Identificação precoce de sinais de <strong>Dislexia, TDAH e TEA</strong> através de jogos validados cientificamente. 
              Gere relatórios automáticos e Planos Educacionais Individualizados (PEI) com IA.
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Triagem Rápida</h4>
                  <p className="text-xs text-muted-foreground">10-15 minutos por módulo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">PEI Automático</h4>
                  <p className="text-xs text-muted-foreground">Gerado por IA pedagógica</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Dashboard Analítico</h4>
                  <p className="text-xs text-muted-foreground">Métricas e percentis</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1">
                <Link to="/screening">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Iniciar Triagem
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link to="/teacher-dashboard">
                  <Users className="h-4 w-4 mr-2" />
                  Painel do Professor
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
