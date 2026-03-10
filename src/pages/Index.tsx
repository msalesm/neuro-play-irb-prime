import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Target, TrendingUp, ArrowRight, GraduationCap, 
  Zap, BookOpen, BarChart3, Award, Heart, Shield, Users, 
  Stethoscope, Gamepad2, CalendarCheck, MessageCircle, Star,
  CheckCircle2, Smartphone, Apple, Monitor, Activity, 
  FileText, Lightbulb, Database, School, Sparkles, Eye,
  LineChart, ClipboardList, RefreshCw, AlertTriangle,
  Clock, Scan, Lock, Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { generateInstitutionalPDF } from "@/components/landing/InstitutionalPDF";

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

const SectionHeader = ({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) => (
  <motion.div className="text-center mb-10 md:mb-16" variants={fadeIn}>
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
          1. HERO — Posicionamento Healthtech
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
                Neurodevelopment Platform
              </Badge>
              <StarRating />
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
              variants={fadeIn}
            >
              Triagem e desenvolvimento
              <span className="block text-primary mt-1 md:mt-2">
                cognitivo infantil
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-xl text-primary-foreground/85 mb-6 md:mb-8 max-w-lg leading-relaxed"
              variants={fadeIn}
            >
              Avalie, acompanhe e desenvolva habilidades cognitivas de crianças 
              através de jogos inteligentes e análise baseada em dados.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-3 mb-6 md:mb-8"
              variants={fadeIn}
            >
              {[
                "Triagem cognitiva em minutos",
                "Acompanhamento longitudinal",
                "Relatórios para escolas e famílias",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2 text-primary-foreground/80 text-xs md:text-sm bg-primary-foreground/10 rounded-full px-3 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </motion.div>
            
            <motion.div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4" variants={fadeIn}>
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
                      Iniciar Avaliação <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                    <Link to="#como-funciona">Conhecer a Plataforma</Link>
                  </Button>
                </>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 gap-2"
                onClick={() => generateInstitutionalPDF()}
              >
                <FileText className="w-4 h-4" />
                Baixar PDF Institucional
              </Button>
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 md:mt-12"
              variants={fadeIn}
            >
              {[
                { icon: Shield, text: "LGPD Compliant" },
                { icon: Brain, text: "Baseado em Evidências" },
                { icon: Database, text: "Dataset Cognitivo" },
                { icon: Lock, text: "Dados Seguros" },
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
          2. O PROBLEMA
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
            badge="O Desafio"
            title="Dificuldades cognitivas não identificadas a tempo"
            subtitle="Muitas crianças passam anos sem que seus desafios de aprendizagem sejam detectados."
          />

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: BookOpen, label: "Atraso na alfabetização", desc: "Dificuldades fonológicas não percebidas nos primeiros anos" },
              { icon: Target, label: "Dificuldades de atenção", desc: "Sinais de desatenção confundidos com desinteresse" },
              { icon: AlertTriangle, label: "Baixa confiança escolar", desc: "Frustração acumulada sem intervenção adequada" },
              { icon: Clock, label: "Diagnóstico tardio", desc: "Anos de sofrimento antes de receber apoio" },
            ].map((item) => (
              <motion.div key={item.label} variants={scaleIn}>
                <Card className="h-full border-destructive/10 bg-destructive/5">
                  <CardContent className="p-4 md:p-5 text-center">
                    <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-5 h-5 text-destructive" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.p 
            className="text-center text-muted-foreground mt-8 max-w-lg mx-auto text-sm"
            variants={fadeIn}
          >
            Escolas e famílias frequentemente não possuem ferramentas acessíveis para detectar sinais precoces de dificuldades cognitivas.
          </motion.p>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          3. A SOLUÇÃO — Como funciona
      ═══════════════════════════════════════════ */}
      <motion.section 
        id="como-funciona"
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            badge="Como Funciona"
            title="Do jogo ao relatório em minutos"
            subtitle="Processo simples que transforma atividades lúdicas em dados de desenvolvimento cognitivo."
          />

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-12"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { step: "1", icon: Gamepad2, title: "Triagem Gamificada", desc: "Atividades cognitivas de 5–7 minutos que parecem jogos" },
              { step: "2", icon: Brain, title: "Análise Automática", desc: "IA processa tempo de reação, precisão e padrões comportamentais" },
              { step: "3", icon: Stethoscope, title: "Intervenção Guiada", desc: "Protocolos de exercícios recomendados automaticamente" },
              { step: "4", icon: TrendingUp, title: "Evolução Contínua", desc: "Acompanhamento longitudinal do desenvolvimento" },
            ].map((item) => (
              <motion.div key={item.step} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-5 text-center">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          4. NCI — NeuroPlay Cognitive Index
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div variants={stagger}>
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Índice Proprietário</Badge>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  NeuroPlay Cognitive Index
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Um índice cognitivo que acompanha o desenvolvimento da criança ao longo do tempo,
                  combinando 5 domínios em um score único de 0 a 100.
                </p>
              </motion.div>

              <motion.div className="space-y-3 mb-6" variants={stagger}>
                {[
                  { label: "Atenção", value: 74, emoji: "🎯" },
                  { label: "Memória de Trabalho", value: 81, emoji: "🧠" },
                  { label: "Linguagem", value: 69, emoji: "📖" },
                  { label: "Função Executiva", value: 77, emoji: "🧩" },
                  { label: "Cognição Social", value: 72, emoji: "🤝" },
                ].map((d) => (
                  <motion.div key={d.label} variants={fadeIn} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{d.emoji}</span>
                        <span>{d.label}</span>
                      </span>
                      <span className="font-bold text-primary">{d.value}</span>
                    </div>
                    <Progress value={d.value} className="h-2" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="border-2 border-primary/20 shadow-glow bg-card/80">
                <CardContent className="p-6 md:p-8 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    NeuroPlay Cognitive Index
                  </p>
                  <div className="text-6xl md:text-7xl font-bold text-primary mb-2">78</div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                    Desenvolvimento Adequado
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Score composto que permite monitorar evolução cognitiva ao longo de semanas, meses e anos.
                  </p>

                  {/* Scale */}
                  <div className="mt-6 space-y-1">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div className="flex-1 bg-destructive/60" />
                      <div className="flex-1 bg-destructive/30" />
                      <div className="flex-1 bg-chart-4/50" />
                      <div className="flex-1 bg-primary/40" />
                      <div className="flex-1 bg-chart-3/50" />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground px-1">
                      <span>Urgente</span>
                      <span>Intervenção</span>
                      <span>Atenção</span>
                      <span>Adequado</span>
                      <span>Avançado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          5. TRIAGEM RÁPIDA PARA ESCOLAS
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
                alt="Criança focada em atividade cognitiva" 
                className="w-full h-64 md:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Scan className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-primary-foreground font-semibold text-sm">Classroom Cognitive Scan</p>
                    <p className="text-primary-foreground/70 text-xs">30 alunos avaliados em minutos</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="order-1 lg:order-2" variants={stagger}>
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Triagem em Massa</Badge>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  Avaliação cognitiva de turmas inteiras
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  O professor inicia uma sessão, alunos entram com um código, jogam por 5–7 minutos e o sistema
                  gera automaticamente o perfil cognitivo da turma.
                </p>
              </motion.div>

              <motion.div className="space-y-3 mb-6" variants={stagger}>
                {[
                  { icon: Users, text: "Professor inicia sessão da turma" },
                  { icon: Scan, text: "Alunos entram com código via tablet ou computador" },
                  { icon: Gamepad2, text: "Atividade cognitiva gamificada de poucos minutos" },
                  { icon: BarChart3, text: "Resultados automáticos no dashboard da turma" },
                ].map((step) => (
                  <motion.div key={step.text} className="flex items-center gap-3" variants={fadeIn}>
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <step.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{step.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mock dashboard result */}
              <motion.div variants={fadeIn}>
                <Card className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-sm">Turma 3A — Resultado</p>
                      <Badge variant="outline" className="text-[10px]">28 alunos</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: "Atenção", value: 71, color: "text-primary" },
                        { label: "Memória", value: 65, color: "text-chart-2" },
                        { label: "Linguagem", value: 58, color: "text-chart-4" },
                        { label: "F. Executiva", value: 69, color: "text-primary" },
                      ].map((d) => (
                        <div key={d.label} className="text-center bg-muted/50 rounded-lg p-2">
                          <p className={`text-lg font-bold ${d.color}`}>{d.value}</p>
                          <p className="text-[9px] text-muted-foreground">{d.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px]">
                        📖 3 risco leitura
                      </Badge>
                      <Badge variant="outline" className="text-chart-4 border-chart-4/30 text-[10px]">
                        🎯 2 risco atenção
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          6. ACOMPANHAMENTO LONGITUDINAL
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
            badge="Evolução Contínua"
            title="Acompanhamento do desenvolvimento ao longo do tempo"
            subtitle="Em vez de avaliações pontuais, o NeuroPlay monitora a evolução cognitiva semana a semana."
          />

          <motion.div 
            className="max-w-3xl mx-auto"
            variants={fadeIn}
          >
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sm">Lucas — Evolução Cognitiva</p>
                  <Badge variant="outline" className="text-chart-3 text-[10px]">↑ Melhorando</Badge>
                </div>
                
                {/* Mock evolution chart */}
                <div className="space-y-4">
                  {[
                    { domain: "🎯 Atenção", w1: 52, w8: 63, w16: 71, color: "bg-primary" },
                    { domain: "🧠 Memória", w1: 48, w8: 58, w16: 66, color: "bg-chart-2" },
                    { domain: "📖 Linguagem", w1: 41, w8: 52, w16: 61, color: "bg-chart-3" },
                    { domain: "🧩 F. Executiva", w1: 55, w8: 62, w16: 68, color: "bg-chart-4" },
                  ].map((d) => (
                    <div key={d.domain}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{d.domain}</span>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>Sem 1: {d.w1}</span>
                          <span>Sem 8: {d.w8}</span>
                          <span className="font-bold text-chart-3">Sem 16: {d.w16}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className={`${d.color}/30 rounded-full`} style={{ width: `${d.w1}%` }} />
                        <div className={`${d.color}/60 rounded-full`} style={{ width: `${d.w8 - d.w1}%` }} />
                        <div className={`${d.color} rounded-full`} style={{ width: `${d.w16 - d.w8}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Dados ilustrativos. Scores reais gerados a partir das atividades cognitivas.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          7. INTERVENÇÕES BASEADAS EM DADOS
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
            badge="Intervenção Guiada"
            title="Recomendações automáticas de atividades"
            subtitle="Quando o sistema identifica possíveis dificuldades, sugere protocolos de exercícios com frequência, duração e acompanhamento."
          />

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: BookOpen,
                title: "Consciência Fonológica",
                trigger: "Linguagem abaixo de 60",
                protocol: "10 min · 3x por semana · 4 semanas",
                improvement: "+22% esperado",
                evidence: "Evidência forte",
              },
              {
                icon: Target,
                title: "Atenção Sustentada",
                trigger: "Atenção abaixo de 60",
                protocol: "8 min · 4x por semana · 3 semanas",
                improvement: "+18% esperado",
                evidence: "Evidência forte",
              },
              {
                icon: Brain,
                title: "Memória Operacional",
                trigger: "Memória abaixo de 60",
                protocol: "10 min · 3x por semana · 4 semanas",
                improvement: "+15% esperado",
                evidence: "Evidência moderada",
              },
            ].map((item) => (
              <motion.div key={item.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{item.trigger}</p>
                    
                    <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{item.protocol}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-chart-3">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">{item.improvement}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        📊 {item.evidence}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          8. PARA QUEM
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
            badge="Ecossistema Completo"
            title="Uma plataforma, todos os contextos"
            subtitle="NeuroPlay conecta escolas, profissionais de saúde e famílias em torno do desenvolvimento cognitivo infantil."
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
                icon: School,
                title: "Escolas",
                desc: "Triagem cognitiva em turmas, dashboard pedagógico, alertas automáticos e relatórios institucionais.",
                features: [
                  "Triagem de turma em minutos",
                  "Dashboard por turma com NCI",
                  "Alertas de risco de leitura e atenção",
                  "Acompanhamento longitudinal",
                  "Relatório para diretores e secretaria",
                ],
              },
              {
                icon: Stethoscope,
                title: "Profissionais",
                desc: "Psicólogos, terapeutas e fonoaudiólogos podem acompanhar o desenvolvimento cognitivo com dados objetivos.",
                features: [
                  "Prontuário eletrônico integrado",
                  "Avaliação cognitiva automática",
                  "Protocolos ABA digitais",
                  "Relatórios clínicos em PDF",
                  "Acompanhamento de intervenções",
                ],
              },
              {
                icon: Heart,
                title: "Famílias",
                desc: "Pais podem entender melhor o desenvolvimento cognitivo dos filhos e acompanhar o progresso ao longo do tempo.",
                features: [
                  "Relatório simplificado de progresso",
                  "Jogos cognitivos adaptativos",
                  "Rotina executiva diária",
                  "Histórias interativas",
                  "Recomendações personalizadas",
                ],
              },
            ].map((audience) => (
              <motion.div key={audience.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300 border-t-4 border-t-primary/40">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <audience.icon className="w-6 h-6 text-primary" />
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
          9. DADOS E CIÊNCIA
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
            <motion.div variants={stagger}>
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Dataset Cognitivo</Badge>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  Cada atividade gera dados comportamentais reais
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Durante cada sessão, o sistema registra eventos cognitivos detalhados que alimentam 
                  a análise de desenvolvimento e os protocolos de intervenção.
                </p>
              </motion.div>

              <motion.div className="grid grid-cols-2 gap-3" variants={stagger}>
                {[
                  { icon: Zap, label: "Tempo de reação", desc: "Latência cognitiva em milissegundos" },
                  { icon: Target, label: "Precisão", desc: "Taxa de acerto e erro por tipo" },
                  { icon: Activity, label: "Padrões de tentativa", desc: "Sequência e estratégia de resolução" },
                  { icon: Award, label: "Persistência", desc: "Tolerância à frustração e abandono" },
                  { icon: RefreshCw, label: "Variabilidade", desc: "Consistência ao longo da sessão" },
                  { icon: Eye, label: "Controle inibitório", desc: "Impulsividade e auto-regulação" },
                ].map((metric) => (
                  <motion.div key={metric.label} variants={scaleIn}>
                    <Card className="shadow-card h-full">
                      <CardContent className="p-3">
                        <metric.icon className="w-4 h-4 text-primary mb-1.5" />
                        <p className="font-semibold text-xs">{metric.label}</p>
                        <p className="text-[10px] text-muted-foreground">{metric.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="relative rounded-2xl overflow-hidden shadow-glow" variants={fadeIn}>
              <img 
                src={groupTherapyImg} 
                alt="Profissionais acompanhando desenvolvimento" 
                className="w-full h-64 md:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-card">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-xs">Event Store Cognitivo</p>
                    <p className="text-[10px] text-muted-foreground">200–400 eventos por sessão</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          10. RESULTADOS PARA ESCOLAS
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
            badge="Impacto Escolar"
            title="O que o NeuroPlay oferece para escolas"
            subtitle="Dados pedagógicos reais para decisões baseadas em evidência."
          />

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: AlertTriangle,
                title: "Identificação Precoce",
                desc: "Detecte dificuldades de leitura, atenção e função executiva antes que afetem o desempenho escolar.",
              },
              {
                icon: TrendingUp,
                title: "Evolução Cognitiva",
                desc: "Acompanhe o desenvolvimento dos alunos ao longo de semanas e meses com dados objetivos.",
              },
              {
                icon: Lightbulb,
                title: "Estratégias Pedagógicas",
                desc: "Receba recomendações de atividades baseadas nos dados cognitivos da turma.",
              },
            ].map((item) => (
              <motion.div key={item.title} variants={scaleIn}>
                <Card className="h-full shadow-card">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            variants={stagger}
          >
            {[
              { value: "5–7 min", label: "Duração da triagem" },
              { value: "30+", label: "Alunos por sessão" },
              { value: "5", label: "Domínios avaliados" },
              { value: "100%", label: "Automático" },
            ].map((stat) => (
              <motion.div key={stat.label} className="text-center" variants={scaleIn}>
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
            title="Instale o NeuroPlay no seu dispositivo"
            subtitle="Use como um app nativo — sem precisar baixar na loja."
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Apple,
                title: "iPhone / iPad",
                steps: [
                  "Abra no Safari e toque em Compartilhar",
                  "Toque em \"Adicionar à Tela de Início\"",
                  "Confirme a instalação",
                ],
              },
              {
                icon: Smartphone,
                title: "Android",
                steps: [
                  "Abra no Chrome e toque nos três pontinhos (⋮)",
                  "Toque em \"Instalar app\"",
                  "Confirme a instalação",
                ],
              },
              {
                icon: Monitor,
                title: "Computador",
                steps: [
                  "Abra no Chrome ou Edge",
                  "Clique no ícone de instalar (➕)",
                  "O NeuroPlay abrirá como app",
                ],
              },
            ].map((device) => (
              <motion.div key={device.title} variants={scaleIn}>
                <Card className="h-full shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <device.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold">{device.title}</h3>
                    </div>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      {device.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          11. CTA FINAL
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
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Entenda melhor como as crianças aprendem
            </h2>
            <p className="text-primary-foreground/85 text-base md:text-lg max-w-xl mx-auto mb-8">
              Comece a acompanhar o desenvolvimento cognitivo com triagem gamificada, 
              análise baseada em dados e intervenções guiadas.
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" variants={fadeIn}>
            {user ? (
              <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 shadow-glow text-base">
                <Link to="/" className="flex items-center gap-2">
                  Ir para o Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 shadow-glow text-base">
                  <Link to="/auth" className="flex items-center gap-2">
                    Criar Conta <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/auth" className="flex items-center gap-2">
                    <School className="w-4 h-4" /> Agendar Demonstração
                  </Link>
                </Button>
              </>
            )}
          </motion.div>

          <p className="text-xs text-primary-foreground/60 mt-8">
            NeuroPlay · Plataforma de Triagem e Desenvolvimento Cognitivo Infantil · Baseada em Dados · LGPD Compliant
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
