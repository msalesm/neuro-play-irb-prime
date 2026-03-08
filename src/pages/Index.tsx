import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Target, TrendingUp, ArrowRight, GraduationCap, 
  Zap, BookOpen, BarChart3, Award, Heart, Shield, Users, 
  Stethoscope, Gamepad2, CalendarCheck, MessageCircle, Star,
  CheckCircle2, Smartphone, Apple, Monitor, Activity, 
  FileText, Lightbulb, Database, School, Sparkles, Eye,
  LineChart, ClipboardList, RefreshCw, Radar, AlertTriangle,
  BellRing, Compass, Layers, Lock, Cpu, Server, PieChart,
  Fingerprint, Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

import heroImg from "@/assets/hero-children-learning.jpg";
import childFocusedImg from "@/assets/child-focused-learning.jpg";
import groupTherapyImg from "@/assets/group-therapy-session.jpg";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } }
};

const StarRating = ({ count = 5 }: { count?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-4 h-4 text-warning fill-warning" />
    ))}
  </div>
);

const SectionHeader = ({ badge, title, subtitle, stars = 5 }: { badge: string; title: string; subtitle: string; stars?: number }) => (
  <motion.div className="text-center mb-10 md:mb-16" variants={fadeIn}>
    <div className="flex justify-center mb-3">
      <StarRating count={stars} />
    </div>
    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{badge}</Badge>
    <h2 className="text-2xl md:text-4xl font-bold mb-3">
      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </span>
    </h2>
    <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">{subtitle}</p>
  </motion.div>
);

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImg} 
            alt="Crianças aprendendo com tecnologia" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-16 md:py-0">
          <motion.div 
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4 md:mb-6">
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs md:text-sm px-3 py-1">
                Cognitive Development Platform
              </Badge>
              <StarRating />
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
              variants={fadeIn}
            >
              Inteligência cognitiva infantil
              <span className="block text-primary mt-1 md:mt-2">
                baseada em dados comportamentais
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-xl text-primary-foreground/85 mb-6 md:mb-8 max-w-lg leading-relaxed"
              variants={fadeIn}
            >
              Jogos adaptativos com IA, Copilot de desenvolvimento, avaliação cognitiva automática, ABA digital 
              e recomendações personalizadas para pais, terapeutas e escolas — tudo em uma única plataforma.
            </motion.p>
            
            <motion.div className="flex flex-col sm:flex-row gap-3 md:gap-4" variants={fadeIn}>
              {user ? (
                <Button asChild size="lg" className="text-base shadow-glow">
                  <Link to="/" className="flex items-center gap-2">
                    Acessar Painel <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-base shadow-glow">
                    <Link to="/auth" className="flex items-center gap-2">
                      Começar Agora <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                    <Link to="/auth">Já tenho conta</Link>
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 md:mt-12"
              variants={fadeIn}
            >
              {[
                { icon: Shield, text: "LGPD Compliant" },
                { icon: Brain, text: "Baseado em Evidências" },
                { icon: Sparkles, text: "IA Adaptativa" },
                { icon: Heart, text: "Perfis Comportamentais" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-primary-foreground/70 text-xs md:text-sm">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PARA QUEM
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge="Ecossistema Completo"
            title="Uma plataforma, todos os contextos"
            subtitle="NeuroPlay conecta famílias, profissionais de saúde, educadores e instituições em torno do desenvolvimento da criança."
            stars={5}
          />

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Heart,
                title: "Famílias",
                desc: "Acompanhe o progresso com jogos cognitivos, rotina inteligente e recomendações personalizadas por IA.",
                features: ["Rotina executiva", "Relatório semanal automático", "Histórias interativas", "Recomendações para pais", "Missões diárias gamificadas"],
              },
              {
                icon: Stethoscope,
                title: "Terapeutas",
                desc: "Prontuário eletrônico, ABA digital, radar cognitivo e intervenção adaptativa baseada em dados clínicos.",
                features: ["ABA digital com prompting", "Prontuário eletrônico", "Avaliação cognitiva automática", "Relatórios clínicos em PDF", "Perfil comportamental integrado"],
              },
              {
                icon: GraduationCap,
                title: "Escolas",
                desc: "Dashboard por turma, PEI digital, mapa de vulnerabilidade e alertas automáticos para coordenação.",
                features: ["Dashboard por turma", "PEI integrado", "Mapa de vulnerabilidade", "Alertas pedagógicos", "Relatórios para secretaria"],
              },
              {
                icon: School,
                title: "Instituições",
                desc: "Visão agregada de toda a rede escolar com indicadores cognitivos, predição de risco e gestão de licenças.",
                features: ["Dashboard institucional", "Indicadores por região", "Predição de risco", "Gestão de licenças", "Auditoria e compliance"],
              },
            ].map((audience) => (
              <motion.div key={audience.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300 border-t-4 border-t-primary/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <audience.icon className="w-6 h-6 text-primary" />
                      </div>
                      <StarRating count={5} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{audience.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{audience.desc}</p>
                    <ul className="space-y-1.5">
                      {audience.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          JOGOS COGNITIVOS — com foto
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div className="relative rounded-2xl overflow-hidden shadow-glow order-2 lg:order-1" variants={fadeIn}>
              <img 
                src={childFocusedImg} 
                alt="Criança focada em atividade de aprendizado" 
                className="w-full h-64 md:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                     <p className="text-primary-foreground font-semibold text-sm">Motor Adaptativo com IA</p>
                     <p className="text-primary-foreground/70 text-xs">Dificuldade ajustada em tempo real</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="order-1 lg:order-2" variants={stagger}>
              <motion.div variants={fadeIn}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Jogos Cognitivos Adaptativos
                  </Badge>
                  <StarRating />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  Cada jogo gera dados comportamentais reais
                </h2>
                <p className="text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                  Mais de 25 jogos terapêuticos com dificuldade adaptativa por IA, 
                  registro de tempo de reação, acurácia, persistência e padrões de erro — 
                  alimentando o perfil comportamental e a avaliação cognitiva automática.
                </p>
              </motion.div>

              <motion.div className="grid grid-cols-2 gap-3 md:gap-4" variants={stagger}>
                {[
                  { icon: Target, label: "Atenção", value: "Sustentada e seletiva" },
                  { icon: Brain, label: "Memória", value: "Operacional e sequencial" },
                  { icon: Zap, label: "Flexibilidade", value: "Cognitiva e adaptativa" },
                  { icon: Award, label: "Persistência", value: "Tolerância à frustração" },
                  { icon: Eye, label: "Controle Inibitório", value: "Impulsividade e foco" },
                  { icon: RefreshCw, label: "Adaptação", value: "Dificuldade por IA" },
                ].map((metric) => (
                  <motion.div key={metric.label} variants={scaleIn}>
                    <Card className="shadow-card h-full">
                      <CardContent className="p-3 md:p-4">
                        <metric.icon className="w-5 h-5 text-primary mb-2" />
                        <p className="font-semibold text-sm">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">{metric.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {!user && (
                <motion.div className="mt-6" variants={fadeIn}>
                  <Button asChild size="lg">
                    <Link to="/auth" className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" /> Experimentar Jogos <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          ARQUITETURA EM 7 CAMADAS
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge="Arquitetura de Produto"
            title="7 camadas de inteligência integradas"
            subtitle="Cada camada alimenta a seguinte, criando um sistema impossível de replicar."
            stars={5}
          />

          {/* Architecture Stack */}
          <motion.div className="max-w-3xl mx-auto mb-12" variants={fadeIn}>
            <Card className="border-2 border-primary/20 shadow-glow bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-2">
                  {[
                    { icon: Compass, label: "AI Layer", desc: "Copilot + Insight Engine + Predição", color: "bg-primary text-primary-foreground" },
                    { icon: PieChart, label: "Analytics Layer", desc: "Behavioral Dataset + Metrics + Snapshots", color: "bg-primary/90 text-primary-foreground" },
                    { icon: Database, label: "Data Layer", desc: "Postgres + RLS + Audit Logs + Encryption", color: "bg-primary/80 text-primary-foreground" },
                    { icon: Server, label: "Service Layer", desc: "Edge Functions + API + AI Gateway", color: "bg-primary/70 text-primary-foreground" },
                    { icon: Cpu, label: "Domain Engines", desc: "Games · ABA · Behavioral · Assessment · Routines · Stories", color: "bg-primary/60 text-primary-foreground" },
                    { icon: Layers, label: "Application Layer", desc: "Hooks + State + Role-Based Views", color: "bg-primary/50 text-primary-foreground" },
                    { icon: Monitor, label: "Client Layer", desc: "React PWA + Mobile + Acessibilidade", color: "bg-primary/40 text-primary-foreground" },
                  ].map((layer, i) => (
                    <motion.div 
                      key={layer.label}
                      className={`flex items-center gap-4 p-3 md:p-4 rounded-xl ${layer.color}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <layer.icon className="w-5 h-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{layer.label}</p>
                        <p className="text-xs opacity-80 truncate">{layer.desc}</p>
                      </div>
                      {i < 6 && <ArrowRight className="w-4 h-4 opacity-50 rotate-90 shrink-0 hidden md:block" />}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Domain Engines Detail */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Gamepad2,
                title: "Game Engine",
                desc: "Sessões, trials, métricas cognitivas reais: reaction_time, response_variability, omission_errors, post_error_latency.",
                badge: "Core",
              },
              {
                icon: BarChart3,
                title: "ABA Engine",
                desc: "Programas, sessões, tentativas com cálculo automático de independence score, prompt fading e accuracy trend.",
                badge: "Clínico",
              },
              {
                icon: Activity,
                title: "Behavioral Engine",
                desc: "Integra jogos, ABA, rotinas e histórias para produzir attention_index, persistence_index e emotional_regulation.",
                badge: "Cross-Domain",
              },
              {
                icon: LineChart,
                title: "Assessment Engine",
                desc: "Scores automáticos de atenção, memória operacional, controle inibitório, flexibilidade e persistência (0–100).",
                badge: "Assessment",
              },
              {
                icon: Lightbulb,
                title: "Recommendation Engine",
                desc: "Sugestões baseadas em regras e IA personalizadas para cada papel: pais, professores e terapeutas.",
                badge: "Actionable",
              },
              {
                icon: Compass,
                title: "Copilot Engine",
                desc: "Inteligência contínua que cruza 5 fontes comportamentais para alertas precoces, diagnóstico e orientação.",
                badge: "IA",
              },
            ].map((mod) => (
              <motion.div key={mod.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <mod.icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{mod.badge}</Badge>
                    </div>
                    <h3 className="font-bold text-sm mb-1.5">{mod.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{mod.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          COPILOT DE DESENVOLVIMENTO
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 6px 3px hsl(var(--primary))',
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <SectionHeader
            badge="⚡ Funcionalidade Principal"
            title="NeuroPlay Copilot — Inteligência de Desenvolvimento"
            subtitle="O copiloto analisa continuamente todas as fontes de dados comportamentais e gera orientação personalizada para cada criança, profissional e família."
            stars={5}
          />

          {/* Architecture Flow */}
          <motion.div className="max-w-4xl mx-auto mb-12" variants={fadeIn}>
            <Card className="border-2 border-primary/20 shadow-glow bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                  <span className="font-semibold text-sm">Fluxo de Inteligência do Copilot</span>
                </div>

                {/* Data Sources */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                  {[
                    { icon: Gamepad2, label: "Jogos", color: "bg-primary/10 text-primary" },
                    { icon: BarChart3, label: "ABA", color: "bg-destructive/10 text-destructive" },
                    { icon: CalendarCheck, label: "Rotina", color: "bg-warning/10 text-warning" },
                    { icon: BookOpen, label: "Histórias", color: "bg-info/10 text-info" },
                    { icon: LineChart, label: "Avaliação", color: "bg-success/10 text-success" },
                  ].map((src) => (
                    <div key={src.label} className={`flex items-center gap-2 p-3 rounded-xl ${src.color.split(' ')[0]}`}>
                      <src.icon className={`w-4 h-4 ${src.color.split(' ')[1]}`} />
                      <span className="text-xs font-semibold">{src.label}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div className="flex justify-center mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-6 bg-gradient-to-b from-primary/50 to-primary" />
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Compass className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Copilot Engine</span>
                    <div className="w-px h-6 bg-gradient-to-b from-primary to-primary/50" />
                  </div>
                </div>

                {/* Outputs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Radar, label: "Monitoramento Contínuo", desc: "Padrões comportamentais" },
                    { icon: Lightbulb, label: "Recomendações", desc: "Para cada papel" },
                    { icon: RefreshCw, label: "Ajuste Automático", desc: "Atividades adaptadas" },
                    { icon: AlertTriangle, label: "Alertas Precoces", desc: "Sinais de risco" },
                  ].map((out) => (
                    <div key={out.label} className="text-center p-3 bg-muted/50 rounded-xl">
                      <out.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-semibold mb-0.5">{out.label}</p>
                      <p className="text-[10px] text-muted-foreground">{out.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Copilot Capabilities */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Radar,
                title: "Monitoramento Comportamental Contínuo",
                desc: "O Copilot detecta padrões em tempo real: queda de atenção, persistência baixa, impulsividade crescente, dificuldade de regulação emocional.",
                example: "\"Atenção caiu 20% nas últimas 2 semanas. Persistência baixa em tarefas longas.\"",
                badge: "Detecção",
              },
              {
                icon: Users,
                title: "Recomendações por Papel",
                desc: "Sugestões práticas personalizadas para pais, professores e terapeutas, baseadas no perfil completo da criança.",
                example: "Professor: \"Atividade de foco de 3 min antes da aula.\" Pais: \"Rotina visual com 3 passos simples.\"",
                badge: "Ação",
              },
              {
                icon: RefreshCw,
                title: "Ajuste Automático de Atividades",
                desc: "O Copilot orienta o motor adaptativo: jogos mais curtos para persistência baixa, maior dificuldade quando atenção melhora.",
                example: "Persistência baixa → jogos mais curtos. Atenção melhorando → aumentar dificuldade.",
                badge: "Adaptação",
              },
              {
                icon: AlertTriangle,
                title: "Alertas Precoces",
                desc: "Detecção de sinais de risco antes que problemas se tornem evidentes. Notificação para professores e pais agirem cedo.",
                example: "\"Queda consistente na memória operacional — sugestão de avaliação cognitiva.\"",
                badge: "Prevenção",
              },
              {
                icon: Brain,
                title: "Correlação Cross-Domain",
                desc: "Cruzamento de dados de jogos, ABA, rotina e histórias para revelar conexões invisíveis entre comportamentos.",
                example: "\"Queda de atenção nos jogos correlaciona com aumento de frustração na rotina.\"",
                badge: "Correlação",
              },
              {
                icon: School,
                title: "Copilot de Turma",
                desc: "Visão agregada da turma: tendências, engajamento, indicadores socioemocionais e alunos que precisam de atenção urgente.",
                example: "\"3 alunos com risco alto. Tendência geral: queda em persistência.\"",
                badge: "Escola",
              },
            ].map((cap) => (
              <motion.div key={cap.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary/40">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <cap.icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{cap.badge}</Badge>
                    </div>
                    <h3 className="font-bold text-sm mb-2">{cap.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-3">{cap.desc}</p>
                    <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary/30">
                      <p className="text-[11px] text-muted-foreground italic">{cap.example}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Copilot Views */}
          <motion.div 
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Stethoscope,
                title: "Painel do Profissional",
                items: ["Insights comportamentais", "Alertas clínicos", "Recomendações de intervenção", "Tendências e padrões"],
              },
              {
                icon: Heart,
                title: "Painel dos Pais",
                items: ["O que está evoluindo", "O que precisa de apoio", "O que fazer em casa", "Celebrações de progresso"],
              },
              {
                icon: GraduationCap,
                title: "Painel da Escola",
                items: ["Tendências da turma", "Engajamento por aluno", "Indicadores socioemocionais", "Alunos em risco"],
              },
            ].map((panel) => (
              <motion.div key={panel.title} variants={scaleIn}>
                <Card className="h-full shadow-card border-t-4 border-t-primary/40">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <panel.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-sm">{panel.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {panel.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Competitive Moat */}
          <motion.div 
            className="mt-12 max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="text-center mb-8" variants={fadeIn}>
              <Badge className="bg-warning/10 text-warning border-warning/20 mb-3">Vantagem Competitiva</Badge>
              <h3 className="text-xl md:text-2xl font-bold">3 barreiras impossíveis de copiar</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Database,
                  title: "Dataset Comportamental",
                  desc: "Dados longitudinais de jogos, ABA, rotina, histórias e avaliações — reaction time, error patterns, decision speed, task persistence, emotional choices.",
                  impact: "Permite modelos preditivos e pesquisa científica",
                },
                {
                  icon: Cpu,
                  title: "Motor Cognitivo",
                  desc: "Métricas reais de comportamento — response_variability, omission_errors, post_error_latency — que a maioria dos apps nem coleta.",
                  impact: "Pode virar Cognitive Assessment Engine independente",
                },
                {
                  icon: Compass,
                  title: "Copilot de Desenvolvimento",
                  desc: "Insights personalizados que cruzam 5 fontes comportamentais simultâneas para cada criança, profissional e família.",
                  impact: "Transforma app em plataforma de inteligência",
                },
              ].map((moat) => (
                <motion.div key={moat.title} variants={scaleIn}>
                  <Card className="h-full shadow-card border-t-4 border-t-warning/40">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center mb-4">
                        <moat.icon className="w-6 h-6 text-warning" />
                      </div>
                      <h4 className="font-bold mb-2">{moat.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{moat.desc}</p>
                      <div className="bg-warning/5 rounded-lg p-3 border-l-2 border-warning/30">
                        <p className="text-xs text-muted-foreground italic">{moat.impact}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Positioning */}
            <motion.div className="mt-8" variants={fadeIn}>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <p className="font-bold text-muted-foreground text-sm mb-2">Sem essa arquitetura:</p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><span className="text-destructive">✕</span> App educacional</li>
                        <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Plataforma ABA isolada</li>
                        <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Jogo cognitivo genérico</li>
                      </ul>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
                      <p className="font-bold text-primary text-sm mb-2">Com NeuroPlay:</p>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Plataforma de inteligência de desenvolvimento infantil</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Baseada em dados comportamentais reais</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Com 7 camadas e 6 engines integrados</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          MÓDULOS TERAPÊUTICOS
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge="Módulos Integrados"
            title="Muito além de jogos"
            subtitle="Módulos terapêuticos que cobrem todas as dimensões do neurodesenvolvimento infantil."
            stars={5}
          />

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: BarChart3,
                title: "ABA Digital",
                desc: "Programas de ensino, registro de tentativas, DTT/NET/VB, níveis de prompt, reforço e análise automática de progresso com gráficos de tendência.",
                badge: "Clínico",
                stars: 5,
              },
              {
                icon: CalendarCheck,
                title: "Rotina Executiva",
                desc: "Organização de tarefas diárias com métricas de função executiva: iniciação, conclusão, consistência e transição entre atividades.",
                badge: "Funcional",
                stars: 5,
              },
              {
                icon: BookOpen,
                title: "Histórias Interativas",
                desc: "Narrativas com decisões que desenvolvem empatia, regulação emocional, habilidades sociais e geração de histórias por IA.",
                badge: "Socioemocional",
                stars: 5,
              },
              {
                icon: MessageCircle,
                title: "Chat Terapêutico IA",
                desc: "Assistente com IA para check-ins emocionais, orientações contextualizadas, análise emocional e suporte clínico integrado.",
                badge: "IA",
                stars: 5,
              },
            ].map((mod) => (
              <motion.div key={mod.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <mod.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{mod.badge}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold">{mod.title}</h3>
                      <StarRating count={mod.stars} />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{mod.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          CLÍNICO / PRONTUÁRIO — com foto
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div variants={stagger}>
              <motion.div variants={fadeIn}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                    Para Profissionais
                  </Badge>
                  <StarRating />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  Prontuário eletrônico + IA clínica
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Todas as informações clínicas em um só lugar: anamnese, avaliações cognitivas automáticas, 
                  relatórios com IA, planos de intervenção adaptativos e auditoria completa.
                </p>
              </motion.div>

              <motion.div className="space-y-2.5" variants={stagger}>
                {[
                  "Anamnese neurológica estruturada",
                  "Radar cognitivo com 6 dimensões",
                  "Avaliação cognitiva automática (scores 0–100)",
                  "Relatórios automáticos em PDF com IA",
                  "Programas ABA com rastreamento de tentativas",
                  "Perfil comportamental com dataset integrado",
                  "Recomendações clínicas personalizadas",
                  "Motor de intervenção adaptativa",
                  "Conformidade LGPD e Lei 14.254/21",
                ].map((item) => (
                  <motion.div key={item} className="flex items-center gap-3" variants={fadeIn}>
                    <div className="w-5 h-5 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              {user && (
                <motion.div className="mt-6" variants={fadeIn}>
                  <Button asChild>
                    <Link to="/clinical" className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> Acessar Painel Clínico <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>

            <motion.div className="relative rounded-2xl overflow-hidden shadow-glow" variants={fadeIn}>
              <img 
                src={groupTherapyImg} 
                alt="Sessão de terapia em grupo" 
                className="w-full h-64 md:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-card">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <div>
                    <p className="font-bold text-xs">Multi-Stakeholder</p>
                    <p className="text-[10px] text-muted-foreground">Clínicas · Escolas · Famílias · Redes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          RELATÓRIOS E ANALYTICS
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge="Core da Plataforma"
            title="Relatórios, analytics e progresso"
            subtitle="A principal funcionalidade do NeuroPlay: visibilidade total do desenvolvimento cognitivo e comportamental da criança."
            stars={5}
          />

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: FileText,
                title: "Relatórios Automáticos",
                desc: "Relatórios clínicos, pedagógicos, familiares e institucionais gerados automaticamente com dados reais e IA.",
                items: ["Relatório cognitivo", "Relatório comportamental", "Relatório institucional", "Exportação PDF"],
              },
              {
                icon: TrendingUp,
                title: "Analytics Avançado",
                desc: "Análise correlacional, detecção de anomalias, tendências e predição de risco com dataset comportamental estruturado.",
                items: ["Correlação entre métricas", "Detecção de anomalias", "Tendências temporais", "Predição de risco"],
              },
              {
                icon: ClipboardList,
                title: "Progresso da Criança",
                desc: "Visibilidade 360° do desenvolvimento: scores cognitivos, evolução ABA, rotina executiva e engajamento.",
                items: ["Scores cognitivos (0–100)", "Evolução por domínio", "Histórico de sessões", "Comparativo temporal"],
              },
            ].map((item) => (
              <motion.div key={item.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300 border-t-4 border-t-primary/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <StarRating />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{item.desc}</p>
                    <ul className="space-y-1.5">
                      {item.items.map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          SISTEMA PLANETA AZUL
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary-foreground rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div variants={fadeIn}>
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                ))}
              </div>
            </div>
            <span className="text-4xl md:text-5xl mb-4 block">🪐</span>
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Sistema Planeta Azul
            </h2>
            <p className="text-primary-foreground/85 text-base md:text-lg max-w-2xl mx-auto mb-8">
              5 planetas temáticos com jogos adaptativos, missões diárias, avatares evolutivos, 
              10 níveis de XP e insígnias colecionáveis — terapia transformada em aventura.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 max-w-2xl mx-auto mb-8"
            variants={stagger}
          >
            {[
              { emoji: "🌟", name: "Aurora" },
              { emoji: "🌀", name: "Vortex" },
              { emoji: "💡", name: "Lumen" },
              { emoji: "🌊", name: "Oceanus" },
              { emoji: "🔥", name: "Ignis" },
            ].map((planet) => (
              <motion.div 
                key={planet.name}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-primary-foreground/20"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl md:text-3xl block mb-1">{planet.emoji}</span>
                <p className="text-primary-foreground text-xs md:text-sm font-medium">{planet.name}</p>
              </motion.div>
            ))}
          </motion.div>

          {user ? (
             <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 shadow-glow">
              <Link to="/sistema-planeta-azul" className="flex items-center gap-2">
                🪐 Explorar Planetas <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 shadow-glow">
              <Link to="/auth" className="flex items-center gap-2">
                Criar Conta Gratuita <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          NÚMEROS / SOCIAL PROOF
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-20 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 text-center"
            variants={stagger}
          >
            {[
              { value: "7", label: "Camadas de Arquitetura" },
              { value: "6", label: "Domain Engines" },
              { value: "25+", label: "Jogos Cognitivos" },
              { value: "5", label: "Fontes Comportamentais" },
              { value: "5", label: "Planetas Temáticos" },
              { value: "3", label: "Barreiras Competitivas" },
              { value: "🧭", label: "Copilot IA" },
              { value: "100%", label: "LGPD Compliant" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={scaleIn}>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          INSTALAR NA TELA INICIAL
      ═══════════════════════════════════════════ */}
      <motion.section
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge="App Instalável"
            title="Instale o NeuroPlay no seu celular"
            subtitle="Use como um app nativo — sem precisar baixar na loja."
            stars={5}
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* iOS */}
            <motion.div variants={scaleIn}>
              <Card className="h-full shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Apple className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold">iPhone / iPad</h3>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                      <span>Abra no <strong className="text-foreground">Safari</strong> e toque no ícone de <strong className="text-foreground">Compartilhar</strong> (quadrado com seta)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                      <span>Role e toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                      <span>Toque em <strong className="text-foreground">"Adicionar"</strong> para confirmar</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </motion.div>

            {/* Android */}
            <motion.div variants={scaleIn}>
              <Card className="h-full shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold">Android</h3>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                      <span>Abra no <strong className="text-foreground">Chrome</strong> e toque nos <strong className="text-foreground">três pontinhos</strong> (⋮) no canto superior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                      <span>Toque em <strong className="text-foreground">"Instalar app"</strong> ou <strong className="text-foreground">"Adicionar à tela inicial"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                      <span>Confirme a instalação e pronto!</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </motion.div>

            {/* Desktop */}
            <motion.div variants={scaleIn}>
              <Card className="h-full shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold">Computador</h3>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                      <span>Abra no <strong className="text-foreground">Chrome</strong> ou <strong className="text-foreground">Edge</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                      <span>Clique no ícone de <strong className="text-foreground">instalar</strong> (➕) na barra de endereço</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                      <span>Confirme e o NeuroPlay abrirá como app</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div className="text-center mt-8" variants={fadeIn}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {[
                { icon: CheckCircle2, text: "Funciona offline" },
                { icon: Zap, text: "Carregamento instantâneo" },
                { icon: Shield, text: "Tela cheia, sem barra do navegador" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5">
                  <b.icon className="w-3.5 h-3.5 text-success" />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div variants={fadeIn}>
            <div className="flex justify-center mb-4">
              <StarRating />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Pronto para transformar o desenvolvimento?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
              Comece agora e tenha acesso ao Copilot de desenvolvimento, jogos adaptativos, avaliação cognitiva, 
              relatórios com IA e ferramentas clínicas integradas — tudo em uma plataforma.
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" variants={fadeIn}>
            {user ? (
              <Button asChild size="lg" className="text-base shadow-glow">
                <Link to="/" className="flex items-center gap-2">
                  Ir para o Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-base shadow-glow">
                  <Link to="/auth" className="flex items-center gap-2">
                    Criar Conta Gratuita <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <Link to="/auth" className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Sou Profissional
                  </Link>
                </Button>
              </>
            )}
          </motion.div>

          <p className="text-xs text-muted-foreground mt-8">
            NeuroPlay · Plataforma de Inteligência de Desenvolvimento Infantil · 7 Camadas · 6 Engines · Behavioral Dataset · LGPD Compliant
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
