import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, Gamepad2, Heart, Sparkles, Target, BookOpen, Clock, 
  TrendingUp, BarChart3, Users, GraduationCap, Stethoscope,
  Star, Trophy, Map, Zap, ArrowRight, CheckCircle, 
  ChevronLeft, ChevronRight, Shield, Mail
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-children-learning.jpg';
import childFocused from '@/assets/child-focused-learning.jpg';
import groupTherapy from '@/assets/group-therapy-session.jpg';
import neuroplayLogo from '@/assets/neuroplay-logo.png';

// ─── 1. HEADER ────────────────────────────────────────────
const LandingHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={neuroplayLogo} alt="NeuroPlay" className="h-16 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a>
          <a href="#gamificacao" className="hover:text-primary transition-colors">Gamificação</a>
          <a href="#para-quem" className="hover:text-primary transition-colors">Para quem</a>
          <a href="#beneficios" className="hover:text-primary transition-colors">Benefícios</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex">
            Entrar
          </Button>
          <Button size="sm" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-secondary text-white">
            Começar agora
          </Button>
        </div>
      </div>
    </header>
  );
};

// ─── 2. HERO SECTION ──────────────────────────────────────
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Cada cérebro é único — e merece ser celebrado
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6">
              <span className="text-foreground">Desenvolvimento cognitivo</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                infantil através de jogos
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              NeuroPlay ajuda crianças a desenvolver atenção, memória, organização e 
              habilidades socioemocionais por meio de experiências interativas.
            </p>
            <p className="text-base text-muted-foreground/70 mb-10 max-w-2xl mx-auto">
              Jogos cognitivos, rotina inteligente, histórias interativas e análise comportamental 
              — tudo em uma experiência lúdica e envolvente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:opacity-90 transition-smooth"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Começar agora
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-lg px-8 py-6"
              >
                Conhecer a plataforma
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-14 max-w-5xl mx-auto"
          >
            <div className="rounded-3xl overflow-hidden shadow-strong border border-border/50">
              <img 
                src={heroImage} 
                alt="Crianças aprendendo com jogos educativos interativos" 
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: '15+', label: 'Jogos cognitivos', color: 'text-primary' },
              { value: '5', label: 'Mundos exploráveis', color: 'text-secondary' },
              { value: '100%', label: 'Baseado em ciência', color: 'text-accent' },
              { value: 'IA', label: 'Adaptação inteligente', color: 'text-neuroplay-orange' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-card border border-border/50">
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── 3. COMO FUNCIONA ─────────────────────────────────────
const HowItWorksSection = () => (
  <section id="como-funciona" className="py-20 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">Como funciona</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Três pilares que transformam desenvolvimento em aventura
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          {
            icon: Gamepad2,
            title: 'Jogos Cognitivos',
            description: 'Jogos interativos que estimulam atenção, memória, flexibilidade cognitiva e coordenação motora.',
            gradient: 'from-primary to-primary/70',
            border: 'border-primary/20',
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
          },
          {
            icon: Clock,
            title: 'Rotina Inteligente',
            description: 'Ferramenta visual para ajudar crianças a desenvolver organização, autonomia e consistência diária.',
            gradient: 'from-secondary to-secondary/70',
            border: 'border-secondary/20',
            image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80',
          },
          {
            icon: BookOpen,
            title: 'Histórias Interativas',
            description: 'Narrativas que estimulam empatia, tomada de decisão e regulação emocional de forma lúdica.',
            gradient: 'from-accent to-accent/70',
            border: 'border-accent/20',
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
          },
        ].map((item, i) => (
          <Card key={i} className={`border-2 ${item.border} bg-card hover:shadow-glow transition-smooth hover:scale-[1.02] overflow-hidden`}>
            <div className="aspect-[16/10] overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-card-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// ─── 4. PERFIL COMPORTAMENTAL ─────────────────────────────
const BehavioralProfileSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Perfil cognitivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
            Entenda o perfil único de cada criança
          </h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            A plataforma identifica padrões de desenvolvimento e evolução ao longo do tempo, 
            baseado em tarefas cognitivas, rotina diária e decisões socioemocionais.
          </p>
          <ul className="space-y-3">
            {['Análise contínua de desempenho', 'Radar cognitivo visual', 'Evolução ao longo do tempo', 'Sem linguagem diagnóstica'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Radar mock */}
        <div className="bg-muted/50 rounded-3xl p-8 border border-border">
          <div className="text-center mb-6">
            <h3 className="font-bold text-foreground mb-1">Radar Cognitivo</h3>
            <p className="text-sm text-muted-foreground">Perfil de desenvolvimento</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Atenção', value: 85, color: 'bg-primary' },
              { label: 'Memória', value: 92, color: 'bg-secondary' },
              { label: 'Linguagem', value: 78, color: 'bg-accent' },
              { label: 'Lógica', value: 88, color: 'bg-neuroplay-orange' },
              { label: 'Social', value: 70, color: 'bg-neuroplay-yellow' },
              { label: 'Motor', value: 95, color: 'bg-primary' },
            ].map((skill, i) => (
              <div key={i} className="text-center p-3 bg-card rounded-xl border border-border/50">
                <div className={`text-xl font-bold mb-1`} style={{ color: `hsl(var(--${skill.color === 'bg-primary' ? 'primary' : skill.color === 'bg-secondary' ? 'secondary' : skill.color === 'bg-accent' ? 'accent' : 'neuroplay-orange'}))` }}>
                  {skill.value}%
                </div>
                <div className="text-xs text-muted-foreground">{skill.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── 5. ADAPTAÇÃO INTELIGENTE ─────────────────────────────
const AdaptiveSection = () => (
  <section className="py-20 bg-gradient-to-b from-primary/5 to-card">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          IA adaptativa
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
          Dificuldade que se adapta automaticamente
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          A IA do NeuroPlay ajusta a dificuldade dos jogos em tempo real com base no 
          desempenho, tempo de resposta e taxa de acerto de cada criança.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: Target, title: 'Desempenho', desc: 'Analisa acertos e erros em cada atividade' },
            { icon: Clock, title: 'Tempo', desc: 'Mede velocidade de resposta e pausas' },
            { icon: TrendingUp, title: 'Evolução', desc: 'Mantém desafio ideal para crescimento' },
          ].map((item, i) => (
            <Card key={i} className="border-border/50 bg-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress mock */}
        <div className="mt-12 max-w-md mx-auto bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">Ajuste em tempo real</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Sessão 1', width: '40%' },
              { label: 'Sessão 5', width: '60%' },
              { label: 'Sessão 10', width: '75%' },
              { label: 'Sessão 20', width: '90%' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">{s.label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: s.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── 6. GAMIFICAÇÃO ───────────────────────────────────────
const GamificationSection = () => (
  <section id="gamificacao" className="py-20 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neuroplay-orange/10 text-neuroplay-orange text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" />
          Gamificação
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
          Uma aventura cognitiva completa
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Níveis, conquistas, mundos exploráveis e recompensas que mantêm as crianças engajadas
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
        {[
          { icon: Star, title: 'Níveis & XP', desc: 'Progressão clara com títulos e experiência', color: 'text-neuroplay-yellow' },
          { icon: Trophy, title: 'Conquistas', desc: 'Insígnias e badges desbloqueáveis', color: 'text-neuroplay-orange' },
          { icon: Map, title: 'Mundos', desc: 'Explore ambientes temáticos cognitivos', color: 'text-primary' },
          { icon: Heart, title: 'Recompensas', desc: 'Colecionáveis e personalização', color: 'text-secondary' },
        ].map((item, i) => (
          <Card key={i} className="border-border/50 bg-card hover:shadow-card transition-smooth">
            <CardContent className="p-6 text-center">
              <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-4`} />
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Worlds preview */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { emoji: '🌳', name: 'Floresta da Atenção', bg: 'bg-accent/10 border-accent/20' },
            { emoji: '🌌', name: 'Planeta da Memória', bg: 'bg-secondary/10 border-secondary/20' },
            { emoji: '🏙️', name: 'Cidade da Lógica', bg: 'bg-primary/10 border-primary/20' },
            { emoji: '🔥', name: 'Vale da Persistência', bg: 'bg-neuroplay-orange/10 border-neuroplay-orange/20' },
            { emoji: '🌊', name: 'Oceano Social', bg: 'bg-neuroplay-blue/10 border-neuroplay-blue/20' },
          ].map((world, i) => (
            <div key={i} className={`${world.bg} border rounded-2xl p-4 text-center`}>
              <div className="text-3xl mb-2">{world.emoji}</div>
              <div className="text-xs font-medium text-foreground">{world.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── 7. PARA QUEM ────────────────────────────────────────
const AudienceSection = () => (
  <section id="para-quem" className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
          Para quem é o NeuroPlay?
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          {
            icon: Users,
            title: 'Para Famílias',
            description: 'Pais acompanham o desenvolvimento da criança com dashboards visuais, relatórios de progresso e atividades para fazer juntos.',
            color: 'from-primary to-primary/70',
            border: 'border-primary/20',
            image: childFocused,
          },
          {
            icon: Stethoscope,
            title: 'Para Terapeutas',
            description: 'Ferramenta de acompanhamento com atividades cognitivas, histórico evolutivo e relatórios detalhados para cada paciente.',
            color: 'from-secondary to-secondary/70',
            border: 'border-secondary/20',
            image: groupTherapy,
          },
          {
            icon: GraduationCap,
            title: 'Para Escolas',
            description: 'Atividades que ajudam alunos a desenvolver habilidades cognitivas, com acompanhamento por turma e integração com famílias.',
            color: 'from-accent to-accent/70',
            border: 'border-accent/20',
            image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&q=80',
          },
        ].map((item, i) => (
          <Card key={i} className={`border-2 ${item.border} bg-card hover:shadow-glow transition-smooth overflow-hidden`}>
            <div className="aspect-[16/10] overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-card-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// ─── 8. SCREENSHOTS CAROUSEL ─────────────────────────────
const ScreenshotsSection = () => {
  const [current, setCurrent] = useState(0);
  const screens = [
    { title: 'Home da Criança', desc: 'Missões diárias, streaks e progressão visual', image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=2400&q=100&auto=format&fit=crop&sharp=20' },
    { title: 'Jogo Cognitivo', desc: 'Atividades adaptativas com feedback imediato', image: 'https://images.unsplash.com/photo-1610500796385-3ffc1ae2f046?w=2400&q=100&auto=format&fit=crop&sharp=20' },
    { title: 'História Interativa', desc: 'Narrativas que desenvolvem empatia e decisão', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=2400&q=100&auto=format&fit=crop&sharp=20' },
    { title: 'Dashboard de Progresso', desc: 'Relatórios visuais para pais e terapeutas', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2400&q=100&auto=format&fit=crop&sharp=20' },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
            Conheça a plataforma
          </h2>
          <p className="text-lg text-muted-foreground">Uma experiência pensada para cada detalhe</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card border border-border rounded-3xl overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img 
                src={screens[current].image} 
                alt={screens[current].title} 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">{screens[current].title}</h3>
              <p className="text-muted-foreground">{screens[current].desc}</p>
            </div>

            <button
              onClick={() => setCurrent(c => c === 0 ? screens.length - 1 : c - 1)}
              className="absolute left-3 top-[35%] -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => setCurrent(c => c === screens.length - 1 ? 0 : c + 1)}
              className="absolute right-3 top-[35%] -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {screens.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── 9. BENEFÍCIOS ────────────────────────────────────────
const BenefitsSection = () => (
  <section id="beneficios" className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
          Benefícios principais
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {[
          { icon: Brain, text: 'Desenvolvimento cognitivo baseado em ciência' },
          { icon: Gamepad2, text: 'Engajamento através de jogos adaptativos' },
          { icon: Clock, text: 'Rotina estruturada com suporte visual' },
          { icon: BookOpen, text: 'Histórias educativas e socioemocionais' },
          { icon: TrendingUp, text: 'Acompanhamento de progresso contínuo' },
          { icon: Heart, text: 'Reforço positivo e inclusão' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── 10. CTA FINAL ────────────────────────────────────────
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-white">
            Comece hoje a jornada de desenvolvimento com o NeuroPlay
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Uma experiência que transforma aprendizado em aventura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Criar conta
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
            >
              <Mail className="w-5 h-5 mr-2" />
              Agendar demonstração
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── 11. FOOTER ───────────────────────────────────────────
const LandingFooter = () => (
  <footer className="py-12 bg-foreground text-white/70">
    <div className="container mx-auto px-4">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold font-heading">NeuroPlay</span>
          </div>
          <p className="text-sm leading-relaxed">
            Plataforma de desenvolvimento cognitivo infantil através de jogos, rotina e histórias interativas.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Plataforma</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/games" className="hover:text-white transition-colors">Jogos Cognitivos</Link></li>
            <li><Link to="/rotina" className="hover:text-white transition-colors">Rotina Inteligente</Link></li>
            <li><Link to="/historias" className="hover:text-white transition-colors">Histórias Interativas</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Para quem</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#para-quem" className="hover:text-white transition-colors">Famílias</a></li>
            <li><a href="#para-quem" className="hover:text-white transition-colors">Terapeutas</a></li>
            <li><a href="#para-quem" className="hover:text-white transition-colors">Escolas</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs">© {new Date().getFullYear()} NeuroPlay. Todos os direitos reservados.</p>
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-4 h-4" />
          <span>LGPD Compliant</span>
        </div>
      </div>
    </div>
  </footer>
);

// ─── MAIN LANDING ─────────────────────────────────────────
export default function NeuroPlayMainLanding() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <HowItWorksSection />
      <BehavioralProfileSection />
      <AdaptiveSection />
      <GamificationSection />
      <AudienceSection />
      <ScreenshotsSection />
      <BenefitsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
