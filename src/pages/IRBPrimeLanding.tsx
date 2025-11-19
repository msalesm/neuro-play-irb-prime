import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Gamepad2, LineChart, Heart, Users, CheckCircle, Target, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import irbPrimeCareLogo from '@/assets/irb-prime-care-logo.png';

export default function IRBPrimeLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img src={irbPrimeCareLogo} alt="IRB Prime Care" className="h-12" />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre</a>
            <a href="#beneficios" className="text-sm text-muted-foreground hover:text-primary transition-colors">Benefícios</a>
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
            <Button onClick={() => navigate('/auth')} variant="default">Acessar Plataforma</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Tecnologia IRB Prime Care
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Plataforma de Jogos Terapêuticos{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Inteligentes
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transforme o desenvolvimento cognitivo de crianças com TEA, TDAH e Dislexia através de jogos adaptativos baseados em inteligência artificial e ciência.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 h-14">
                  Começar Agora
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/games')} className="text-lg px-8 h-14">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Explorar Jogos
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-6">
                <div>
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Jogos Terapêuticos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Baseado em Ciência</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">IA</div>
                  <div className="text-sm text-muted-foreground">Adaptação Inteligente</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <Card className="relative p-8 bg-card/50 backdrop-blur border-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10">
                    <Brain className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-semibold">Cognitivo</div>
                      <div className="text-xs text-muted-foreground">Atenção & Memória</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10">
                    <Heart className="w-8 h-8 text-secondary" />
                    <div>
                      <div className="font-semibold">Emocional</div>
                      <div className="text-xs text-muted-foreground">Regulação & Social</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10">
                    <Target className="w-8 h-8 text-accent" />
                    <div>
                      <div className="font-semibold">Adaptativo</div>
                      <div className="text-xs text-muted-foreground">IA Personalizada</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10">
                    <LineChart className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-semibold">Relatórios</div>
                      <div className="text-xs text-muted-foreground">Progresso Real</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Evidence Section */}
      <section id="sobre" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Ciência e Tecnologia Unidas</h2>
            <p className="text-xl text-muted-foreground">
              Desenvolvido em parceria com IRB Prime Care, nossa plataforma combina validação clínica com inteligência artificial para resultados comprovados
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Validação Clínica</h3>
              <p className="text-muted-foreground">
                Metodologias baseadas em evidências científicas e protocolos terapêuticos reconhecidos internacionalmente
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">IA Adaptativa</h3>
              <p className="text-muted-foreground">
                Algoritmos que ajustam automaticamente a dificuldade com base no desempenho individual de cada criança
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resultados Mensuráveis</h3>
              <p className="text-muted-foreground">
                Métricas objetivas e relatórios detalhados para profissionais de saúde e famílias
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Por Que Jogos Terapêuticos?</h2>
            <p className="text-xl text-muted-foreground italic">
              "Crianças aprendem melhor quando estão brincando" - Lev Vygotsky
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-primary mb-2">87%</div>
              <h3 className="font-semibold mb-2">Mais Engajamento</h3>
              <p className="text-sm text-muted-foreground">
                Terapias gamificadas aumentam significativamente a participação ativa das crianças
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-secondary mb-2">3x</div>
              <h3 className="font-semibold mb-2">Mais Prática</h3>
              <p className="text-sm text-muted-foreground">
                Crianças dedicam três vezes mais tempo à prática espontânea com jogos
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-accent mb-2">45%</div>
              <h3 className="font-semibold mb-2">Menos Resistência</h3>
              <p className="text-sm text-muted-foreground">
                Redução significativa na resistência ao processo terapêutico
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <LineChart className="w-12 h-12 text-primary mb-2" />
              <h3 className="font-semibold mb-2">Dados Objetivos</h3>
              <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real com métricas precisas e confiáveis
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Uma Solução Completa</h2>
            <p className="text-xl text-muted-foreground">
              Diversão para crianças. Dados para terapeutas. Resultados para todos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8">
              <Gamepad2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-3">Plataforma de Jogos 2D</h3>
              <p className="text-muted-foreground mb-4">
                Interface envolvente com estética retrô, múltiplos mundos temáticos e controles intuitivos adaptados para cada perfil
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>15+ jogos cognitivos especializados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Adaptação sensorial para TEA</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Sistema de recompensas motivacional</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <Sparkles className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold mb-3">Inteligência Adaptativa</h3>
              <p className="text-muted-foreground mb-4">
                IA que ajusta em tempo real e detecta padrões comportamentais para personalização automática
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Ajuste automático de dificuldade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Detecção de padrões cognitivos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Recomendações personalizadas</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <LineChart className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-3">Suporte Terapêutico</h3>
              <p className="text-muted-foreground mb-4">
                Relatórios clínicos detalhados para profissionais e dashboards intuitivos para famílias
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>Relatórios clínicos em PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>Métricas objetivas de progresso</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>Dashboard para pais e terapeutas</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Transformando Terapia em Aventura
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Para Crianças</h3>
              <p className="text-muted-foreground">
                Uma aventura envolvente e divertida que celebra suas forças únicas e torna o desenvolvimento uma experiência prazerosa
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <Target className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Para Profissionais</h3>
              <p className="text-muted-foreground">
                Dados objetivos e insights baseados em IA para intervenções mais eficazes e decisões clínicas fundamentadas
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <Users className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Para Famílias</h3>
              <p className="text-muted-foreground">
                Acompanhamento claro do progresso e celebração de conquistas com informações acessíveis e motivadoras
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Começar a Transformação?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a profissionais de saúde e famílias que já estão transformando o desenvolvimento de crianças com nossa plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-10 h-14">
              Criar Conta Grátis
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/diagnostico-completo')} className="text-lg px-10 h-14">
              <Target className="w-5 h-5 mr-2" />
              Testes Diagnósticos
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={irbPrimeCareLogo} alt="IRB Prime Care" className="h-8" />
              <span className="text-sm text-muted-foreground">© 2024 IRB Prime Care. Todos os direitos reservados.</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-primary transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
