import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Target, TrendingUp, ArrowRight, GraduationCap, 
  Zap, BookOpen, BarChart3, Award, Heart, Shield, Users, 
  Stethoscope, Gamepad2, CalendarCheck, MessageCircle, Star,
  CheckCircle2
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

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Photo */}
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
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 md:mb-6 bg-primary/90 text-primary-foreground border-0 text-xs md:text-sm px-3 py-1">
                Plataforma de Neurodesenvolvimento
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
              variants={fadeIn}
            >
              Desenvolvimento cognitivo
              <span className="block text-primary mt-1 md:mt-2">
                baseado em evidências
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-xl text-primary-foreground/85 mb-6 md:mb-8 max-w-lg leading-relaxed"
              variants={fadeIn}
            >
              Jogos adaptativos, ABA digital, rotina executiva e histórias interativas — 
              tudo integrado para famílias, terapeutas e escolas.
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

            {/* Trust indicators */}
            <motion.div 
              className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 md:mt-12"
              variants={fadeIn}
            >
              {[
                { icon: Shield, text: "LGPD Compliant" },
                { icon: Brain, text: "Baseado em Evidências" },
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
          <motion.div className="text-center mb-10 md:mb-16" variants={fadeIn}>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Uma plataforma, todos os contextos
              </span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              NeuroPlay conecta famílias, profissionais de saúde e educadores em torno do desenvolvimento da criança.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Heart,
                title: "Famílias",
                desc: "Acompanhe o progresso do seu filho com jogos que desenvolvem atenção, memória e regulação emocional — tudo de forma lúdica.",
                features: ["Rotina inteligente", "Relatório semanal", "Histórias interativas"],
                color: "primary",
              },
              {
                icon: Stethoscope,
                title: "Terapeutas",
                desc: "Prontuário eletrônico, programas ABA digitais e radar cognitivo. Dados clínicos reais para decisões baseadas em evidências.",
                features: ["ABA digital", "Prontuário eletrônico", "Relatórios clínicos"],
                color: "secondary",
              },
              {
                icon: GraduationCap,
                title: "Escolas",
                desc: "Dashboard por turma, indicadores cognitivos agregados e PEI digital. Visibilidade para coordenação e professores.",
                features: ["Dashboard por turma", "PEI integrado", "Indicadores por aluno"],
                color: "accent",
              },
            ].map((audience) => (
              <motion.div key={audience.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300 border-t-4 border-t-primary/40">
                  <CardContent className="p-6 md:p-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                      <audience.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{audience.desc}</p>
                    <ul className="space-y-2">
                      {audience.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
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
            {/* Photo */}
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
                     <p className="text-primary-foreground font-semibold text-sm">Radar Cognitivo</p>
                     <p className="text-primary-foreground/70 text-xs">6 dimensões analisadas em tempo real</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div className="order-1 lg:order-2" variants={stagger}>
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Jogos Cognitivos
                </Badge>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  Cada jogo gera dados clínicos reais
                </h2>
                <p className="text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                  Nossos jogos adaptam a dificuldade automaticamente e registram métricas como tempo de reação, 
                  acurácia, persistência e padrões de erro — alimentando o perfil comportamental da criança.
                </p>
              </motion.div>

              <motion.div className="grid grid-cols-2 gap-3 md:gap-4" variants={stagger}>
                {[
                  { icon: Target, label: "Atenção", value: "Sustentada e seletiva" },
                  { icon: Brain, label: "Memória", value: "Operacional e sequencial" },
                  { icon: Zap, label: "Flexibilidade", value: "Cognitiva e adaptativa" },
                  { icon: Award, label: "Persistência", value: "Tolerância à frustração" },
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
          MÓDULOS — ABA, Rotina, Histórias
      ═══════════════════════════════════════════ */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-10 md:mb-16" variants={fadeIn}>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Muito além de jogos
              </span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Módulos integrados que cobrem todas as dimensões do neurodesenvolvimento infantil.
            </p>
          </motion.div>

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
                desc: "Programas de ensino, registro de tentativas, níveis de prompt e reforço — com análise automática de progresso.",
                badge: "Clínico",
              },
              {
                icon: CalendarCheck,
                title: "Rotina Executiva",
                desc: "Organização de tarefas diárias com métricas de função executiva: iniciação, conclusão e consistência.",
                badge: "Funcional",
              },
              {
                icon: BookOpen,
                title: "Histórias Interativas",
                desc: "Narrativas com decisões que desenvolvem empatia, regulação emocional e habilidades sociais.",
                badge: "Socioemocional",
              },
              {
                icon: MessageCircle,
                title: "Chat Terapêutico",
                desc: "Assistente IA para check-ins emocionais, orientações para pais e suporte ao terapeuta.",
                badge: "Suporte",
              },
            ].map((mod) => (
              <motion.div key={mod.title} variants={scaleIn}>
                <Card className="h-full shadow-card hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <mod.icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{mod.badge}</Badge>
                    </div>
                    <h3 className="font-bold mb-2">{mod.title}</h3>
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
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Content */}
            <motion.div variants={stagger}>
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
                  Para Profissionais
                </Badge>
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  Prontuário eletrônico integrado
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Todas as informações clínicas em um só lugar: anamnese, avaliações, teleconsultas, 
                  relatórios e planos de intervenção — com auditoria completa.
                </p>
              </motion.div>

              <motion.div className="space-y-3" variants={stagger}>
                {[
                  "Anamnese neurológica estruturada",
                  "Radar cognitivo com 6 dimensões",
                  "Relatórios automáticos em PDF",
                  "Programas ABA com rastreamento de tentativas",
                  "Perfil comportamental integrado",
                  "Conformidade LGPD e Lei 14.254/21",
                ].map((item) => (
                  <motion.div key={item} className="flex items-center gap-3" variants={fadeIn}>
                    <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-success" />
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

            {/* Photo */}
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
                    <p className="font-bold text-xs">Multi-Tenant</p>
                    <p className="text-[10px] text-muted-foreground">Clínicas · Escolas · Famílias</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          SISTEMA PLANETA AZUL — CTA
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
            <span className="text-4xl md:text-5xl mb-4 block">🪐</span>
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Sistema Planeta Azul
            </h2>
            <p className="text-primary-foreground/85 text-base md:text-lg max-w-2xl mx-auto mb-8">
              5 planetas temáticos com jogos adaptativos, missões diárias, avatares evolutivos 
              e um universo gamificado que transforma terapia em aventura.
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
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center"
            variants={stagger}
          >
            {[
              { value: "15+", label: "Jogos Cognitivos" },
              { value: "6", label: "Dimensões Analisadas" },
              { value: "100%", label: "LGPD Compliant" },
              { value: "3", label: "Perfis de Usuário" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={scaleIn}>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          INSTALAR NA TELA INICIAL
      ═══════════════════════════════════════════ */}
      <motion.section
        className="py-16 md:py-24 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-10 md:mb-14" variants={fadeIn}>
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Smartphone className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Instale o NeuroPlay no seu celular
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Use como um app nativo — sem precisar baixar na loja.
            </p>
          </motion.div>

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
        className="py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div variants={fadeIn}>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Pronto para transformar o desenvolvimento?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
              Comece agora e tenha acesso a jogos, relatórios e ferramentas clínicas integradas.
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

          {/* Footer note */}
          <p className="text-xs text-muted-foreground mt-8">
            NeuroPlay · Plataforma de Neurodesenvolvimento Infantil · LGPD Compliant
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
