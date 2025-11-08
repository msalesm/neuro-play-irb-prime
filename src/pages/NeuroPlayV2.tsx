import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Gamepad2, LineChart, Heart, Users, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';

export default function NeuroPlayV2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-white/5" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-primary">
              <Brain className="w-16 h-16" />
              <Gamepad2 className="w-16 h-16" />
              <Heart className="w-16 h-16" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Neuro Play
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
              Plataforma de Jogos Terapêuticos Adaptativos para TEA, TDAH e Dislexia
            </p>
            
            <p className="text-xl md:text-2xl text-foreground font-semibold italic">
              "Onde cada cérebro é um superpoder"
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/games')}
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/diagnostico-completo')}
              >
                <Target className="w-5 h-5 mr-2" />
                Testes Diagnósticos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            O Desafio da Neurodiversidade
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">1/44</div>
              <p className="text-muted-foreground">Crianças com TEA</p>
              <p className="text-sm text-muted-foreground mt-2">Segundo CDC (2023)</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-secondary mb-2">5-7%</div>
              <p className="text-muted-foreground">Crianças com TDAH</p>
              <p className="text-sm text-muted-foreground mt-2">Prevalência global</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">10-15%</div>
              <p className="text-muted-foreground">População com Dislexia</p>
              <p className="text-sm text-muted-foreground mt-2">Estimativa mundial</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Por Que Jogos Terapêuticos?
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg italic">
            "Crianças aprendem melhor quando estão brincando" - Lev Vygotsky
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="text-5xl font-bold text-primary mb-2">87%</div>
              <p className="font-semibold mb-2">Engajamento</p>
              <p className="text-sm text-muted-foreground">
                Terapias gamificadas aumentam significativamente a participação ativa
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-5xl font-bold text-secondary mb-2">3x</div>
              <p className="font-semibold mb-2">Mais Prática</p>
              <p className="text-sm text-muted-foreground">
                Crianças dedicam três vezes mais tempo à prática espontânea
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-5xl font-bold text-accent mb-2">45%</div>
              <p className="font-semibold mb-2">Menos Resistência</p>
              <p className="text-sm text-muted-foreground">
                Redução significativa na resistência ao processo terapêutico
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <LineChart className="w-12 h-12 mx-auto text-primary mb-2" />
              <p className="font-semibold mb-2">Dados Objetivos</p>
              <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real com métricas precisas e confiáveis
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Apresentando Neuro Play
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg max-w-3xl mx-auto">
            A solução completa que une diversão, inteligência artificial e resultados terapêuticos comprovados
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8">
              <Gamepad2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Plataforma de Jogo 2D</h3>
              <p className="text-muted-foreground">
                Interface envolvente com estética retrô anos 90, múltiplos mundos temáticos e 
                controles intuitivos adaptados para cada perfil neurodiverso
              </p>
            </Card>
            
            <Card className="p-8">
              <Sparkles className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-3">Inteligência Adaptativa</h3>
              <p className="text-muted-foreground">
                IA que ajusta a dificuldade em tempo real, detecta padrões comportamentais e 
                personaliza a experiência para cada criança automaticamente
              </p>
            </Card>
            
            <Card className="p-8">
              <LineChart className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-3">Suporte Terapêutico</h3>
              <p className="text-muted-foreground">
                Relatórios clínicos detalhados para profissionais de saúde, dashboards para 
                acompanhamento familiar e métricas objetivas de progresso
              </p>
            </Card>
          </div>
          
          <p className="text-center text-xl font-semibold mt-12 text-primary">
            Divertimento para crianças. Dados para terapeutas. Resultados para todos.
          </p>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Transformando Terapia em Aventura
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Para Crianças</h3>
              <p className="text-muted-foreground">
                Uma aventura envolvente e divertida que celebra suas forças únicas
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Para Profissionais</h3>
              <p className="text-muted-foreground">
                Dados objetivos e insights para intervenções mais eficazes
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Para Famílias</h3>
              <p className="text-muted-foreground">
                Acompanhamento claro do progresso e celebração de conquistas
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar a aventura?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de famílias que já transformaram o desenvolvimento de suas crianças
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Criar Conta Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/games')}
            >
              Explorar Jogos
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
