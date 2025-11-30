import { ModernPageLayout } from "@/components/ModernPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Users, GraduationCap, LineChart, Shield, Sparkles, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BeneficiosTerapeuticos() {
  const { t } = useLanguage();

  const beneficiosCriancas = [
    {
      icon: Brain,
      title: "Desenvolvimento Cognitivo Estruturado",
      description: "Atividades terapêuticas baseadas em neurociência que fortalecem atenção, memória, flexibilidade cognitiva e funções executivas através de intervenção adaptativa."
    },
    {
      icon: Heart,
      title: "Regulação Emocional Terapêutica",
      description: "Sistema de check-ins emocionais, chatbot terapêutico com IA, e exercícios de mindfulness para desenvolver autoconhecimento emocional e estratégias de autorregulação."
    },
    {
      icon: Sparkles,
      title: "Engajamento Motivacional Sustentado",
      description: "Sistema de progressão terapêutica gamificada (avatares evolutivos, badges, streaks) que mantém engajamento longitudinal sem depender de recompensas externas."
    },
    {
      icon: Target,
      title: "Intervenção Personalizada por IA",
      description: "Recomendações terapêuticas individualizadas baseadas em perfil cognitivo, histórico de desempenho, e necessidades específicas detectadas por análise de padrões comportamentais."
    }
  ];

  const beneficiosPais = [
    {
      icon: LineChart,
      title: "Visibilidade Longitudinal de Evolução",
      description: "Dashboards clínicos com métricas objetivas de progresso cognitivo, emocional e comportamental. Gráficos temporais mostram evolução real, não apenas percepções subjetivas."
    },
    {
      icon: GraduationCap,
      title: "Educação Terapêutica Estruturada",
      description: "Módulos de capacitação parental sobre neurodivergência (TEA, TDAH, Dislexia), estratégias de intervenção domiciliar, manejo comportamental e interpretação de relatórios clínicos."
    },
    {
      icon: Users,
      title: "Coaching Terapêutico com IA",
      description: "Chatbot terapêutico contextualizado que oferece orientações imediatas baseadas em evidências, ajustadas ao estágio de desenvolvimento da criança e contexto familiar específico."
    },
    {
      icon: Shield,
      title: "Atividades Cooperativas Estruturadas",
      description: "Jogos cooperativos pais-criança que fortalecem vínculo afetivo, medem qualidade de interação (métricas de bonding), e ensinam estratégias de comunicação efetiva."
    }
  ];

  const beneficiosTerapeutas = [
    {
      icon: Brain,
      title: "Dados Clínicos Objetivos em Tempo Real",
      description: "Coleta automática de métricas cognitivas (tempos de reação, taxas de acerto, padrões de erro) durante atividades terapêuticas, eliminando viés de observação e fornecendo baseline quantitativo."
    },
    {
      icon: LineChart,
      title: "Relatórios Clínicos Automatizados",
      description: "Geração automática de relatórios estruturados com análise de perfil cognitivo, identificação de forças/vulnerabilidades, detecção de regressões, e recomendações de intervenção priorizadas."
    },
    {
      icon: Target,
      title: "Monitoramento de Adesão Terapêutica",
      description: "Tracking de frequência de uso, engajamento longitudinal, e identificação precoce de abandono de tratamento através de alertas preditivos baseados em padrões de desengajamento."
    },
    {
      icon: Users,
      title: "Continuidade de Cuidado Clínico",
      description: "Registro histórico completo de conversas terapêuticas (chatbot), check-ins emocionais, e insights comportamentais detectados por IA, garantindo documentação clínica longitudinal."
    }
  ];

  const beneficiosEscolas = [
    {
      icon: GraduationCap,
      title: "Triagem Escolar Gamificada (TUNP)",
      description: "Sistema unificado de triagem neurodivergente (TEA, TDAH, Dislexia, Discalculia, DLD) que identifica precocemente estudantes em risco, cumprindo Lei 14.254/21 sem sobrecarregar professores."
    },
    {
      icon: Brain,
      title: "PEI Inteligente Automatizado",
      description: "Geração automática de Planos Educacionais Individualizados (PEI) baseados em perfil cognitivo detectado, com estratégias pedagógicas específicas e acomodações personalizadas por IA."
    },
    {
      icon: Users,
      title: "Capacitação Docente Estruturada",
      description: "Módulos de treinamento para professores sobre neurodiversidade, estratégias de sala de aula inclusiva, adaptações pedagógicas, e uso de dados da plataforma para decisões educacionais."
    },
    {
      icon: LineChart,
      title: "Dashboards de Rede Educacional",
      description: "Visualização agregada de indicadores cognitivos por região, escola e turma. Mapas de risco por diagnóstico, análise preditiva de crises comportamentais, e relatórios institucionais automatizados."
    }
  ];

  return (
    <ModernPageLayout background="gradient">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge 
            className="mb-4 text-lg px-6 py-2"
            style={{ 
              backgroundColor: 'hsl(var(--accent))',
              color: 'white'
            }}
          >
            Plataforma Clínica Terapêutica
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Benefícios Terapêuticos e Educacionais
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            NeuroPlay 2.0 é uma plataforma de <strong>intervenção terapêutica estruturada</strong>, não um sistema recreativo de jogos. 
            Todos os recursos são projetados para gerar <strong>resultados clínicos mensuráveis</strong> em crianças e alunos neurodivergentes.
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="mb-12 border-2" style={{ borderColor: 'hsl(var(--accent))' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 flex-shrink-0" style={{ color: 'hsl(var(--accent))' }} />
              <div>
                <h3 className="text-xl font-bold mb-2">Importante: NÃO é uma Plataforma Recreativa</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Esta é uma <strong>plataforma clínica terapêutica</strong> baseada em evidências científicas, 
                  desenvolvida em parceria com IRB Prime para intervenção estruturada em neurodivergência. 
                  As atividades são projetadas para <strong>objetivos terapêuticos específicos</strong>, 
                  não entretenimento casual.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios para Crianças e Alunos */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Para Crianças e Alunos Neurodivergentes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {beneficiosCriancas.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                    >
                      <beneficio.icon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <CardTitle className="text-xl">{beneficio.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{beneficio.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefícios para Pais e Famílias */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--secondary))' }}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Para Pais e Famílias</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {beneficiosPais.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'hsl(var(--secondary) / 0.1)' }}
                    >
                      <beneficio.icon className="w-6 h-6" style={{ color: 'hsl(var(--secondary))' }} />
                    </div>
                    <CardTitle className="text-xl">{beneficio.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{beneficio.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefícios para Terapeutas */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Para Terapeutas e Profissionais</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {beneficiosTerapeutas.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'hsl(var(--accent) / 0.1)' }}
                    >
                      <beneficio.icon className="w-6 h-6" style={{ color: 'hsl(var(--accent))' }} />
                    </div>
                    <CardTitle className="text-xl">{beneficio.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{beneficio.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefícios para Escolas */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Para Escolas e Redes Educacionais</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {beneficiosEscolas.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                    >
                      <beneficio.icon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <CardTitle className="text-xl">{beneficio.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{beneficio.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <Card className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 border-2" style={{ borderColor: 'hsl(var(--primary))' }}>
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Plataforma Clínica Validada</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Desenvolvida em parceria com <strong>IRB Prime</strong>, com fundamentação em neurociência aplicada, 
              protocolos clínicos baseados em evidências, e conformidade com LGPD e Lei 14.254/21 (triagem escolar precoce).
            </p>
          </CardContent>
        </Card>
      </div>
    </ModernPageLayout>
  );
}
