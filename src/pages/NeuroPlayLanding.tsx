import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Gamepad2, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Users, 
  Heart, 
  BarChart3, 
  GraduationCap, 
  Building2, 
  Watch, 
  Video, 
  ShoppingBag, 
  MessageCircle,
  Shield,
  Globe,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Target,
  Palette,
  Volume2,
  Eye,
  Hand,
  Home,
  School,
  Stethoscope,
  TrendingUp,
  Clock,
  Smile,
  AlertTriangle,
  Lightbulb,
  Lock,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter
} from "lucide-react";
import { Footer } from "@/components/Footer";

// Hero Section
const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    {/* Animated background elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
    </div>

    <div className="container mx-auto px-6 py-20 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 mr-2" />
          Plataforma Completa de Desenvolvimento Infantil
        </Badge>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Neuro Play
          </span>
          <br />
          <span className="text-foreground text-3xl md:text-4xl lg:text-5xl">
            O futuro do desenvolvimento neurodivergente
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Jogos terapêuticos, histórias sociais ilustradas, rotinas inteligentes, 
          IA emocional personalizada e acompanhamento profissional integrado — 
          tudo em uma única plataforma para transformar o desenvolvimento da sua criança.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">
              <Sparkles className="w-5 h-5 mr-2" />
              Experimentar Grátis
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
            <Link to="/subscription">
              Ver Planos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>100% Seguro para Crianças</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span>Disponível em PT/ES/EN</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>Validado por Especialistas</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Problem Section
const ProblemSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="outline" className="mb-4">
          <AlertTriangle className="w-4 h-4 mr-2" />
          O Desafio
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Os desafios do dia a dia neurodivergente
        </h2>
        <p className="text-lg text-muted-foreground">
          Famílias, escolas e terapeutas enfrentam obstáculos semelhantes no apoio ao desenvolvimento infantil
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            icon: Calendar,
            title: "Dificuldade com Rotinas",
            description: "Crianças neurodivergentes frequentemente lutam para manter rotinas consistentes, causando estresse para toda a família."
          },
          {
            icon: Heart,
            title: "Regulação Emocional",
            description: "Crises emocionais e dificuldade em identificar e expressar sentimentos são desafios constantes."
          },
          {
            icon: Users,
            title: "Habilidades Sociais",
            description: "Interações sociais, fazer amigos e entender normas sociais representam grandes desafios."
          },
          {
            icon: Volume2,
            title: "Sobrecarga Sensorial",
            description: "Ambientes com muitos estímulos podem causar desconforto intenso e comportamentos de evitação."
          },
          {
            icon: GraduationCap,
            title: "Dificuldades Escolares",
            description: "O ambiente escolar tradicional nem sempre acomoda as necessidades específicas de cada criança."
          },
          {
            icon: Target,
            title: "Falta de Continuidade",
            description: "Desconexão entre intervenções em casa, escola e terapia diminui a eficácia do tratamento."
          }
        ].map((item, index) => (
          <Card key={index} className="border-none shadow-lg bg-background/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Solution Section
const SolutionSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          <Lightbulb className="w-4 h-4 mr-2" />
          A Solução
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          A Neuro Play conecta todos os pontos
        </h2>
        <p className="text-lg text-muted-foreground">
          Uma plataforma integrada que une família, escola e terapia em um ecossistema de desenvolvimento contínuo
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[
          { icon: Gamepad2, title: "Jogos Terapêuticos", description: "35+ jogos cognitivos baseados em evidências científicas", color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: BookOpen, title: "Histórias Sociais", description: "Narrativas ilustradas para habilidades do dia a dia", color: "text-purple-500", bg: "bg-purple-500/10" },
          { icon: Calendar, title: "Rotinas Inteligentes", description: "Sequências visuais com reforço positivo", color: "text-green-500", bg: "bg-green-500/10" },
          { icon: Target, title: "Trilhas de Habilidades", description: "Desenvolvimento socioemocional personalizado", color: "text-orange-500", bg: "bg-orange-500/10" },
          { icon: Brain, title: "IA Emocional", description: "Assistente contextual que entende cada criança", color: "text-pink-500", bg: "bg-pink-500/10" },
          { icon: Stethoscope, title: "Painel Profissional", description: "Dashboards completos para terapeutas", color: "text-teal-500", bg: "bg-teal-500/10" },
          { icon: Palette, title: "Acessibilidade Total", description: "Presets para TEA, TDAH, baixa visão e mais", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { icon: Watch, title: "Biofeedback", description: "Integração com wearables para monitoramento", color: "text-red-500", bg: "bg-red-500/10" },
          { icon: Users, title: "Comunidade Segura", description: "Espaço protegido para famílias e profissionais", color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { icon: ShoppingBag, title: "Marketplace", description: "Conteúdos criados por especialistas", color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Video, title: "Teleorientação", description: "Sessões remotas integradas à plataforma", color: "text-violet-500", bg: "bg-violet-500/10" },
          { icon: BarChart3, title: "Analytics Avançado", description: "Relatórios inteligentes de evolução", color: "text-emerald-500", bg: "bg-emerald-500/10" }
        ].map((item, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// AI Section
const AISection = () => (
  <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="w-4 h-4 mr-2" />
              Inteligência Artificial
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              IA que entende e se adapta a cada criança
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nossa inteligência artificial aprende continuamente com cada interação, 
              personalizando toda a experiência para maximizar o desenvolvimento.
            </p>

            <div className="space-y-4">
              {[
                { title: "Trilhas Personalizadas", description: "Recomendações baseadas no perfil cognitivo e emocional" },
                { title: "Dificuldade Adaptativa", description: "Jogos que se ajustam automaticamente ao nível da criança" },
                { title: "Histórias Geradas", description: "Narrativas únicas criadas para situações específicas" },
                { title: "Camada Emocional", description: "Detecção de estados emocionais e sugestões de intervenção" },
                { title: "Insights Preditivos", description: "Alertas antecipados de possíveis crises ou regressões" }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
            <Card className="relative border-2 border-primary/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Assistente IA</h3>
                    <p className="text-sm text-muted-foreground">Sempre disponível</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm italic">"João, notei que você está se sentindo ansioso. Que tal fazermos uma respiração juntos?"</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm">"Baseado no progresso de hoje, recomendo a história 'Fazendo Amigos' antes de dormir."</p>
                  </div>
                  <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/20">
                    <p className="text-sm">"Parabéns! Você completou 5 dias seguidos de rotina matinal. Continue assim! 🎉"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features Section
const FeaturesSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <Zap className="w-4 h-4 mr-2" />
          Funcionalidades
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Tudo que você precisa em um só lugar
        </h2>
        <p className="text-lg text-muted-foreground">
          Explore as funcionalidades que tornam a Neuro Play a plataforma mais completa do mercado
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {[
          {
            icon: BookOpen,
            title: "Histórias Sociais",
            description: "Narrativas ilustradas passo a passo que ensinam habilidades sociais, rotinas e comportamentos adequados de forma visual e acessível.",
            features: ["8+ histórias ilustradas", "Áudio integrado (TTS)", "Personalização por idade"]
          },
          {
            icon: Gamepad2,
            title: "Jogos Terapêuticos",
            description: "Mais de 35 jogos cognitivos desenvolvidos com base em evidências científicas para trabalhar atenção, memória e funções executivas.",
            features: ["35+ jogos disponíveis", "5 planetas temáticos", "Dificuldade adaptativa"]
          },
          {
            icon: Calendar,
            title: "Rotinas Inteligentes",
            description: "Sistema visual de rotinas com checkboxes, reforço positivo e acompanhamento de progresso para criar hábitos saudáveis.",
            features: ["Templates prontos", "Rotinas personalizáveis", "Sistema de recompensas"]
          },
          {
            icon: Target,
            title: "Trilhas de Desenvolvimento",
            description: "Percursos estruturados de aprendizagem socioemocional adaptados ao perfil e necessidades de cada criança.",
            features: ["Trilhas por habilidade", "Progresso gamificado", "Certificados digitais"]
          },
          {
            icon: Brain,
            title: "IA Emocional",
            description: "Assistente inteligente que oferece suporte emocional, orientações para pais e intervenções personalizadas em tempo real.",
            features: ["Chat terapêutico", "Detecção de humor", "Orientação parental"]
          },
          {
            icon: BarChart3,
            title: "Analytics Avançado",
            description: "Relatórios inteligentes com métricas de evolução, insights preditivos e recomendações baseadas em dados.",
            features: ["3 tipos de relatório", "Gráficos temporais", "Exportação PDF"]
          },
          {
            icon: Stethoscope,
            title: "Painel do Terapeuta",
            description: "Dashboard completo para profissionais gerenciarem pacientes, visualizarem progresso e criarem intervenções.",
            features: ["Gestão de pacientes", "PEI integrado", "Notas clínicas"]
          },
          {
            icon: School,
            title: "Painel Escolar",
            description: "Ferramentas para professores e coordenadores acompanharem alunos neurodivergentes e colaborarem com famílias.",
            features: ["Turmas e alunos", "Relatórios pedagógicos", "Comunicação com pais"]
          },
          {
            icon: Users,
            title: "Comunidade",
            description: "Espaço seguro e moderado para famílias e profissionais compartilharem experiências e se apoiarem mutuamente.",
            features: ["Grupos temáticos", "Eventos online", "Mentoria entre pais"]
          },
          {
            icon: ShoppingBag,
            title: "Marketplace",
            description: "Conteúdos premium criados por especialistas: histórias, jogos, trilhas e materiais exclusivos.",
            features: ["Conteúdo verificado", "Autores especialistas", "Compras seguras"]
          },
          {
            icon: Watch,
            title: "Wearables",
            description: "Integração com dispositivos vestíveis para monitoramento de biofeedback, sono e níveis de estresse.",
            features: ["Frequência cardíaca", "Padrões de sono", "Alertas de estresse"]
          },
          {
            icon: Video,
            title: "Teleorientação",
            description: "Sessões de orientação remota integradas à plataforma, com histórico e dados de progresso acessíveis.",
            features: ["Videochamadas HD", "Histórico integrado", "Agendamento fácil"]
          }
        ].map((feature, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Audience Section
const AudienceSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="outline" className="mb-4">
          <Users className="w-4 h-4 mr-2" />
          Para Quem
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Uma plataforma para cada necessidade
        </h2>
        <p className="text-lg text-muted-foreground">
          A Neuro Play foi projetada para atender diferentes públicos com necessidades específicas
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {[
          {
            icon: Home,
            title: "Famílias",
            description: "Pais e cuidadores que buscam ferramentas práticas para apoiar o desenvolvimento em casa.",
            benefits: ["Rotinas estruturadas", "Orientação parental", "Acompanhamento de progresso", "Comunidade de apoio"]
          },
          {
            icon: Stethoscope,
            title: "Terapeutas e Clínicas",
            description: "Profissionais de saúde que precisam de ferramentas clínicas integradas e escaláveis.",
            benefits: ["Dashboard clínico", "Gestão de pacientes", "Relatórios inteligentes", "PEI digital"]
          },
          {
            icon: School,
            title: "Escolas",
            description: "Instituições educacionais que desejam apoiar alunos neurodivergentes de forma estruturada.",
            benefits: ["Painel do professor", "Relatórios pedagógicos", "Comunicação com famílias", "Intervenções em sala"]
          },
          {
            icon: Building2,
            title: "Redes de Ensino",
            description: "Secretarias e redes que buscam soluções em escala para políticas de inclusão.",
            benefits: ["Dashboard administrativo", "Métricas regionais", "Licenciamento em volume", "Suporte dedicado"]
          }
        ].map((audience, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-secondary" />
            <CardContent className="p-6 pt-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <audience.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
              <p className="text-muted-foreground text-sm mb-6">{audience.description}</p>
              <ul className="space-y-3">
                {audience.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Benefits Section
const BenefitsSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          <TrendingUp className="w-4 h-4 mr-2" />
          Benefícios
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Resultados que transformam vidas
        </h2>
        <p className="text-lg text-muted-foreground">
          Benefícios comprovados por famílias, terapeutas e escolas que utilizam a Neuro Play
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[
          { icon: Clock, title: "Autonomia e Rotina", description: "Crianças desenvolvem independência através de rotinas visuais estruturadas", stat: "+85%", statLabel: "mais autonomia" },
          { icon: Heart, title: "Regulação Emocional", description: "Melhora significativa na identificação e gestão de emoções", stat: "+72%", statLabel: "menos crises" },
          { icon: TrendingUp, title: "Melhora Comportamental", description: "Redução de comportamentos desafiadores com reforço positivo", stat: "+68%", statLabel: "melhora" },
          { icon: Zap, title: "Engajamento Diário", description: "Gamificação mantém crianças motivadas e engajadas", stat: "15min", statLabel: "uso diário" },
          { icon: Smile, title: "Redução de Crises", description: "Estratégias de regulação previnem e diminuem crises", stat: "-60%", statLabel: "crises semanais" },
          { icon: Target, title: "Continuidade", description: "Conexão entre casa, escola e terapia para resultados consistentes", stat: "3x", statLabel: "mais eficaz" },
          { icon: BarChart3, title: "Dados Reais", description: "Métricas objetivas para acompanhar evolução ao longo do tempo", stat: "100%", statLabel: "rastreável" },
          { icon: Users, title: "Família Unida", description: "Fortalecimento do vínculo através de atividades compartilhadas", stat: "+90%", statLabel: "satisfação" }
        ].map((benefit, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-border/50">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{benefit.stat}</div>
              <div className="text-xs text-muted-foreground mb-3">{benefit.statLabel}</div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Pricing Section
const PricingSection = () => (
  <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <Star className="w-4 h-4 mr-2" />
          Planos
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Escolha o plano ideal para você
        </h2>
        <p className="text-lg text-muted-foreground">
          Do uso gratuito ao institucional, temos o plano perfeito para cada necessidade
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[
          {
            name: "Free",
            price: "Grátis",
            period: "para sempre",
            description: "Ideal para experimentar a plataforma",
            features: ["3 jogos por dia", "2 histórias sociais", "1 rotina ativa", "Relatório básico mensal"],
            cta: "Começar Grátis",
            popular: false
          },
          {
            name: "Pro Família",
            price: "R$ 49",
            period: "/mês",
            description: "Para famílias comprometidas com o desenvolvimento",
            features: ["Jogos ilimitados", "Todas as histórias", "Rotinas ilimitadas", "IA emocional", "Relatórios avançados", "Suporte prioritário"],
            cta: "Assinar Agora",
            popular: true
          },
          {
            name: "Terapeuta",
            price: "R$ 149",
            period: "/mês",
            description: "Para profissionais de saúde",
            features: ["Até 30 pacientes", "Dashboard clínico", "PEI digital", "Relatórios clínicos", "Teleorientação", "API de integração"],
            cta: "Começar Trial",
            popular: false
          },
          {
            name: "Institucional",
            price: "Sob consulta",
            period: "",
            description: "Para escolas e redes de ensino",
            features: ["Usuários ilimitados", "White-label", "Dashboard admin", "Suporte dedicado", "Treinamento incluído", "SLA garantido"],
            cta: "Falar com Vendas",
            popular: false
          }
        ].map((plan, index) => (
          <Card key={index} className={`relative overflow-hidden ${plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border-border/50'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs py-1 font-semibold">
                MAIS POPULAR
              </div>
            )}
            <CardContent className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.popular ? '' : 'variant-outline'}`} variant={plan.popular ? 'default' : 'outline'} asChild>
                <Link to="/subscription">{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-2xl mx-auto mt-12 text-center">
        <Card className="bg-muted/50 border-none">
          <CardContent className="p-6">
            <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Marketplace de Conteúdos</h3>
            <p className="text-sm text-muted-foreground">
              Além dos planos, explore nosso marketplace com conteúdos premium criados por especialistas: 
              histórias exclusivas, jogos temáticos, trilhas especializadas e materiais de apoio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

// Testimonials Section
const TestimonialsSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="outline" className="mb-4">
          <MessageCircle className="w-4 h-4 mr-2" />
          Depoimentos
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          O que dizem sobre a Neuro Play
        </h2>
        <p className="text-lg text-muted-foreground">
          Histórias reais de famílias, terapeutas e escolas que transformaram o desenvolvimento infantil
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            quote: "A Neuro Play revolucionou nossa rotina. Meu filho com TEA agora consegue seguir a rotina matinal sozinho, e as histórias sociais ajudaram muito na preparação para situações novas.",
            author: "Maria S.",
            role: "Mãe de criança com TEA",
            avatar: "👩‍👦"
          },
          {
            quote: "Como terapeuta ocupacional, a plataforma me permite acompanhar o progresso dos meus pacientes entre sessões. Os relatórios são precisos e economizam horas do meu trabalho.",
            author: "Dr. Carlos M.",
            role: "Terapeuta Ocupacional",
            avatar: "👨‍⚕️"
          },
          {
            quote: "Implementamos a Neuro Play em toda nossa rede de escolas inclusivas. Os professores agora têm ferramentas práticas e dados concretos para apoiar cada aluno.",
            author: "Ana L.",
            role: "Coordenadora Pedagógica",
            avatar: "👩‍🏫"
          }
        ].map((testimonial, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">{testimonial.avatar}</div>
              <p className="text-muted-foreground italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-12">
        <Card className="bg-muted/30 border-none">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-center">Validação e Parcerias</h3>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              {["Universidade Federal", "Instituto de Pesquisa", "Associação de Pais", "Conselho Profissional", "Rede de Escolas"].map((partner, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <span className="text-xs">{partner}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

// Internationalization Section
const InternationalizationSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          <Globe className="w-4 h-4 mr-2" />
          Global
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Uma plataforma global, localmente adaptada
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          A Neuro Play está disponível em múltiplos idiomas e é adaptada às necessidades de cada região
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { lang: "Português", flag: "🇧🇷", region: "Brasil", status: "Disponível" },
            { lang: "Español", flag: "🇪🇸", region: "América Latina", status: "Disponível" },
            { lang: "English", flag: "🇺🇸", region: "Estados Unidos", status: "Disponível" }
          ].map((language, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-5xl mb-4">{language.flag}</div>
                <h3 className="text-xl font-bold mb-1">{language.lang}</h3>
                <p className="text-sm text-muted-foreground mb-2">{language.region}</p>
                <Badge variant="secondary" className="text-xs">{language.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-none">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">Expansão em andamento</h3>
            <p className="text-muted-foreground mb-6">
              Estamos expandindo para novos mercados na América Latina, Europa e América do Norte. 
              Se você representa uma instituição interessada em levar a Neuro Play para sua região, 
              entre em contato conosco.
            </p>
            <Button variant="outline" asChild>
              <Link to="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Falar sobre Expansão
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

// Final CTA Section
const CTASection = () => (
  <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Comece a transformação hoje
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Junte-se a milhares de famílias, terapeutas e escolas que estão revolucionando 
          o desenvolvimento infantil neurodivergente com a Neuro Play.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">
              <Sparkles className="w-5 h-5 mr-2" />
              Criar Conta Grátis
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/subscription">
              Ver Planos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

// Custom Footer for Landing
const LandingFooter = () => (
  <footer className="bg-foreground text-primary-foreground py-16">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold">Neuro Play</span>
          </div>
          <p className="text-sm opacity-70 mb-4">
            Transformando o desenvolvimento infantil neurodivergente através de tecnologia, ciência e amor.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Linkedin, Youtube, Twitter].map((Icon, index) => (
              <a key={index} href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold mb-4">Plataforma</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/games" className="hover:opacity-100">Jogos</Link></li>
            <li><Link to="/social-stories" className="hover:opacity-100">Histórias Sociais</Link></li>
            <li><Link to="/routines" className="hover:opacity-100">Rotinas</Link></li>
            <li><Link to="/reports" className="hover:opacity-100">Relatórios</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Para Quem</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/subscription" className="hover:opacity-100">Famílias</Link></li>
            <li><Link to="/subscription" className="hover:opacity-100">Terapeutas</Link></li>
            <li><Link to="/subscription" className="hover:opacity-100">Escolas</Link></li>
            <li><Link to="/subscription" className="hover:opacity-100">Institucional</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Empresa</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><a href="#" className="hover:opacity-100">Sobre Nós</a></li>
            <li><a href="#" className="hover:opacity-100">Blog</a></li>
            <li><a href="#" className="hover:opacity-100">Carreiras</a></li>
            <li><a href="#" className="hover:opacity-100">Imprensa</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Suporte</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/platform-manual" className="hover:opacity-100">Central de Ajuda</Link></li>
            <li><a href="#" className="hover:opacity-100">Contato</a></li>
            <li><Link to="/accessibility-settings" className="hover:opacity-100">Acessibilidade</Link></li>
            <li><a href="#" className="hover:opacity-100">Status</a></li>
          </ul>
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-primary-foreground/20 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm opacity-70">
            <a href="#" className="hover:opacity-100">Privacidade</a>
            <a href="#" className="hover:opacity-100">Termos de Uso</a>
            <a href="#" className="hover:opacity-100">LGPD</a>
            <a href="#" className="hover:opacity-100">Cookies</a>
          </div>
          <div className="text-sm opacity-70">
            © 2024 Neuro Play. Todos os direitos reservados.
          </div>
        </div>

        {/* Child Safety */}
        <div className="mt-6 p-4 bg-primary-foreground/5 rounded-xl">
          <div className="flex items-center justify-center gap-3 text-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="opacity-80">
              <strong>Segurança Infantil:</strong> A Neuro Play segue rigorosos padrões de proteção infantil, 
              incluindo LGPD, COPPA e diretrizes da Lei 14.254/21. Todos os dados são criptografados e 
              nunca compartilhados com terceiros.
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
export default function NeuroPlayLanding() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <AISection />
      <FeaturesSection />
      <AudienceSection />
      <BenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <InternationalizationSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
