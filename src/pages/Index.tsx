import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Target, TrendingUp, ArrowRight, GraduationCap, 
  Zap, BookOpen, BarChart3, Award, Heart, Shield, Users, 
  Stethoscope, Gamepad2, CalendarCheck, MessageCircle, Star,
  CheckCircle2, Smartphone, Apple, Monitor, Activity, 
  FileText, Lightbulb, Database, School, Sparkles, Eye,
  LineChart, ClipboardList, RefreshCw
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
                Plataforma de Neurodesenvolvimento
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
              Jogos adaptativos com IA, avaliação cognitiva automática, ABA digital, 
              recomendações personalizadas para pais, terapeutas e escolas — tudo em uma única plataforma.
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
                { icon: Heart, text: "TEA · TDAH · Dislexia" },
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
                  Cada jogo gera dados clínicos reais
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
          5 SISTEMAS ESTRATÉGICOS
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
            badge="Inteligência Avançada"
            title="5 sistemas estratégicos integrados"
            subtitle="Módulos de inteligência artificial que transformam dados comportamentais em intervenções clínicas e pedagógicas."
            stars={5}
          />

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Activity,
                title: "Intervenção Adaptativa",
                desc: "Motor de IA que ajusta dificuldade, frequência e tipo de atividade conforme o desempenho em tempo real.",
                badge: "IA",
              },
              {
                icon: LineChart,
                title: "Avaliação Cognitiva",
                desc: "Scores automáticos de atenção, memória, controle inibitório, flexibilidade e persistência (0–100).",
                badge: "Assessment",
              },
              {
                icon: Lightbulb,
                title: "Recomendações",
                desc: "Sugestões práticas personalizadas para pais, professores e terapeutas baseadas no perfil da criança.",
                badge: "Actionable",
              },
              {
                icon: Database,
                title: "Dataset Comportamental",
                desc: "Registro estruturado de métricas de jogos, ABA, rotinas e histórias para análise correlacional.",
                badge: "Big Data",
              },
              {
                icon: School,
                title: "Dashboard Institucional",
                desc: "Indicadores agregados por turma e escola: atenção, persistência, autorregulação e engajamento.",
                badge: "Gestão",
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
              { value: "25+", label: "Jogos Cognitivos" },
              { value: "6", label: "Dimensões Analisadas" },
              { value: "5", label: "Módulos Estratégicos" },
              { value: "4", label: "Perfis de Usuário" },
              { value: "5", label: "Planetas Temáticos" },
              { value: "16", label: "Insígnias Colecionáveis" },
              { value: "100%", label: "LGPD Compliant" },
              { value: "IA", label: "Motor Adaptativo" },
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
              Comece agora e tenha acesso a jogos adaptativos, avaliação cognitiva, relatórios com IA 
              e ferramentas clínicas integradas — tudo em uma plataforma.
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
            NeuroPlay · Plataforma de Inteligência Cognitiva Infantil · Baseada em Dados Comportamentais · LGPD Compliant
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
