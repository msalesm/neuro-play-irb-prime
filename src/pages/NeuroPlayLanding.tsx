import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Gamepad2, Heart, CheckCircle, Target, Award, Sparkles, FileText, Users, BarChart3, BookOpen, Zap, Shield, TrendingUp, MapPin, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';

export default function NeuroPlayLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20 pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-white/5" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Plataforma Terapêutica Completa
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              NeuroPlay 2.0
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
              Jogos Terapêuticos Inteligentes para TEA, TDAH e Dislexia
            </p>
            
            <p className="text-lg text-foreground/80 max-w-3xl italic">
              Transformando o desenvolvimento cognitivo através de tecnologia adaptativa validada cientificamente
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary"
                onClick={() => navigate('/auth')}
              >
                <Brain className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/sistema-planeta-azul')}
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                🪐 Sistema Planeta Azul
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-6 opacity-70">
              Em parceria com IRB Prime Care para validação clínica
            </div>
          </div>
        </div>
      </section>

      {/* Sistema Planeta Azul - Visual Showcase */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Sistema Planeta Azul
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Uma jornada terapêutica através de cinco planetas temáticos, cada um focado em diagnósticos e habilidades específicas
              </p>
            </div>

            {/* Planets Visual */}
            <div className="relative w-full aspect-[2/1] max-w-4xl mx-auto mb-12">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Central system */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-yellow-500 animate-pulse shadow-2xl flex items-center justify-center text-4xl">
                  ☀️
                </div>
              </div>
              
              {/* Orbiting planets */}
              {[
                { emoji: '🌟', name: 'Aurora', color: '#7C3AED', position: 'top-0 left-1/4', description: 'TEA' },
                { emoji: '🌀', name: 'Vortex', color: '#EF4444', position: 'top-1/4 right-0', description: 'TDAH' },
                { emoji: '💡', name: 'Lumen', color: '#F59E0B', position: 'bottom-1/4 right-0', description: 'Dislexia' },
                { emoji: '🌊', name: 'Calm', color: '#10B981', position: 'bottom-0 left-1/4', description: 'Regulação' },
                { emoji: '⚙️', name: 'Order', color: '#3B82F6', position: 'top-1/2 left-0', description: 'Exec.' },
              ].map((planet, idx) => (
                <div
                  key={idx}
                  className={`absolute ${planet.position} w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-xl border-2 border-white/20 animate-bounce hover:scale-110 transition-transform cursor-pointer`}
                  style={{
                    backgroundColor: `${planet.color}90`,
                    animationDelay: `${idx * 0.2}s`,
                    animationDuration: '3s',
                  }}
                  title={`${planet.name} - ${planet.description}`}
                >
                  {planet.emoji}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {[
                { emoji: '🌟', name: 'Aurora', desc: 'TEA', color: 'bg-purple-500/20' },
                { emoji: '🌀', name: 'Vortex', desc: 'TDAH', color: 'bg-red-500/20' },
                { emoji: '💡', name: 'Lumen', desc: 'Dislexia', color: 'bg-amber-500/20' },
                { emoji: '🌊', name: 'Calm', desc: 'Regulação', color: 'bg-emerald-500/20' },
                { emoji: '⚙️', name: 'Order', desc: 'Exec.', color: 'bg-blue-500/20' },
              ].map((planet) => (
                <Card key={planet.name} className={`${planet.color} border-none hover-scale`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{planet.emoji}</div>
                    <div className="font-bold text-sm">{planet.name}</div>
                    <div className="text-xs text-muted-foreground">{planet.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personas - Storytelling */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Para Cada Jornada, Uma História
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Três perspectivas, um objetivo comum: transformar o desenvolvimento infantil
            </p>
          </div>

          {/* Pais - Sofia's Story */}
          <div className="max-w-6xl mx-auto mb-20">
            <Card className="overflow-hidden border-none shadow-2xl hover-scale">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 mb-4 text-purple-600">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Para Pais</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    "Finalmente entendo o progresso do meu filho"
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    Sofia, mãe de Lucas (8 anos, TEA), estava perdida entre relatórios técnicos e recomendações conflitantes. 
                    Com o <strong>Dashboard dos Pais</strong>, ela acompanha em tempo real as conquistas de Lucas, 
                    recebe orientações personalizadas e celebra cada progresso com dados claros e acionáveis.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm">Missões diárias personalizadas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm">Histórico de evolução semanal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm">Recomendações de IA personalizadas</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-purple-600 hover:bg-purple-700 w-fit"
                    onClick={() => navigate('/dashboard-pais')}
                  >
                    Ver Dashboard dos Pais
                  </Button>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-8 flex items-center justify-center">
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/80 text-sm font-medium">Missão de Hoje</span>
                        <span className="text-accent text-xs font-bold">75%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full w-3/4" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-2">🌟 Conquista Recente</div>
                      <div className="text-white font-bold">Planeta Aurora: Nível 3 completado!</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-2">📊 Esta Semana</div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-accent font-bold text-xl">12</div>
                          <div className="text-white/60 text-xs">Jogos</div>
                        </div>
                        <div>
                          <div className="text-accent font-bold text-xl">87%</div>
                          <div className="text-white/60 text-xs">Precisão</div>
                        </div>
                        <div>
                          <div className="text-accent font-bold text-xl">45min</div>
                          <div className="text-white/60 text-xs">Tempo</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Terapeuta - Dr. Carla's Story */}
          <div className="max-w-6xl mx-auto mb-20">
            <Card className="overflow-hidden border-none shadow-2xl hover-scale">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Dashboard Preview */}
                <div className="bg-gradient-to-br from-blue-900 to-cyan-900 p-8 flex items-center justify-center order-2 md:order-1">
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-3">👥 Pacientes Ativos</div>
                      <div className="space-y-2">
                        {['Lucas M.', 'Ana P.', 'João S.'].map((name) => (
                          <div key={name} className="flex items-center justify-between bg-white/5 rounded p-2">
                            <span className="text-white text-sm font-medium">{name}</span>
                            <Activity className="w-4 h-4 text-emerald-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-2">🎯 Alertas de IA</div>
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded p-2">
                        <div className="text-amber-200 text-xs font-medium">
                          Ana P.: Queda de 15% na atenção sustentada
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-2">📈 Evolução Geral</div>
                      <div className="flex items-end gap-1 h-16">
                        {[60, 70, 65, 80, 85, 90, 95].map((height, i) => (
                          <div 
                            key={i}
                            className="flex-1 bg-secondary rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
                  <div className="inline-flex items-center gap-2 mb-4 text-blue-600">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Para Terapeutas</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    "Dados objetivos que transformam minha prática"
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    Dra. Carla, psicóloga especializada em TEA, atendia 15 crianças por semana sem dados consistentes. 
                    Com o <strong>Painel do Terapeuta</strong>, ela monitora todos os pacientes em uma única interface, 
                    recebe alertas preditivos de regressão e gera relatórios clínicos completos em segundos.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">Gestão completa de pacientes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">Alertas preditivos com IA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">Relatórios clínicos automáticos</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-blue-600 hover:bg-blue-700 w-fit"
                    onClick={() => navigate('/therapist-patients')}
                  >
                    Ver Painel do Terapeuta
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Gestor Público - Maria's Story */}
          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden border-none shadow-2xl hover-scale">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 mb-4 text-emerald-600">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Para Gestores Públicos</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    "Transformando dados em políticas públicas"
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    Maria, coordenadora de saúde municipal, precisava justificar investimentos em neurodiversidade. 
                    Com o <strong>Dashboard de Rede</strong>, ela monitora indicadores regionais, identifica áreas de risco 
                    e demonstra o impacto das intervenções com dados epidemiológicos agregados e anonimizados.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm">Mapas de risco por região</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm">Indicadores epidemiológicos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm">Relatórios de impacto para gestão</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-emerald-600 hover:bg-emerald-700 w-fit"
                    onClick={() => navigate('/admin-network-dashboard')}
                  >
                    Ver Dashboard de Rede
                  </Button>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-gradient-to-br from-emerald-900 to-teal-900 p-8 flex items-center justify-center">
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-3">🗺️ Cobertura Regional</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['Norte', 'Centro', 'Sul'].map((region) => (
                          <div key={region} className="bg-white/5 rounded p-2 text-center">
                            <div className="text-accent font-bold text-lg">
                              {Math.floor(Math.random() * 30 + 60)}%
                            </div>
                            <div className="text-white/60 text-xs">{region}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-2">📊 Indicadores Chave</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Crianças atendidas</span>
                          <span className="text-white font-bold">1.247</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Escolas integradas</span>
                          <span className="text-white font-bold">32</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Taxa de adesão</span>
                          <span className="text-accent font-bold">87%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-white/80 text-sm mb-2">⚠️ Áreas de Atenção</div>
                      <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
                        <div className="text-red-200 text-xs">
                          Zona Leste: aumento de 12% em casos de TDAH
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Plataforma Completa, Resultados Reais
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tecnologia de ponta validada cientificamente em parceria com IRB Prime Care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Gamepad2 className="w-8 h-8" />,
                title: '19+ Jogos Terapêuticos',
                desc: 'Baseados em neurociência com dificuldade adaptativa por IA',
                color: 'from-purple-500/20 to-pink-500/20'
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Testes Diagnósticos',
                desc: 'TEA, TDAH e Dislexia com algoritmos de triagem validados',
                color: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Relatórios com IA',
                desc: 'Insights clínicos automáticos e alertas preditivos',
                color: 'from-emerald-500/20 to-teal-500/20'
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: 'Educação Parental',
                desc: 'Microlearning personalizado com certificação',
                color: 'from-amber-500/20 to-orange-500/20'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Gestão Multi-perfil',
                desc: 'Dashboards específicos para cada stakeholder',
                color: 'from-red-500/20 to-pink-500/20'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Biofeedback',
                desc: 'Integração com sensores para regulação emocional',
                color: 'from-indigo-500/20 to-purple-500/20'
              },
            ].map((feature) => (
              <Card key={feature.title} className={`bg-gradient-to-br ${feature.color} border-none hover-scale`}>
                <CardContent className="p-6">
                  <div className="text-primary mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Validation */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Validação Científica e Compliance
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Desenvolvido em parceria com <strong>IRB Prime Care</strong> para validação clínica rigorosa. 
                  Protocolos baseados em evidências, compliance total com LGPD e Lei 14.254/21 de triagem escolar obrigatória.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>LGPD Compliant</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Lei 14.254/21</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>IRB Prime Care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar o desenvolvimento cognitivo?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de famílias, terapeutas e gestores que já utilizam a NeuroPlay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary"
              onClick={() => navigate('/auth')}
            >
              Criar Conta Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/sistema-planeta-azul')}
            >
              Explorar Sistema Planeta Azul
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
