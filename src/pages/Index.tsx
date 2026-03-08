import { AccessibilityControls } from "@/components/AccessibilityControls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Target, TrendingUp, ArrowRight, GraduationCap, Zap, BookOpen, BarChart3, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen">
      <AccessibilityControls />
      
      {/* Hero - Sistema Planeta Azul */}
      <motion.section 
        className="py-12 md:py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div className="text-center mb-8 md:mb-16" variants={fadeInUp}>
            <Badge className="mb-4 bg-accent text-accent-foreground border-accent/50">
              Novo • Planeta Azul 🪐
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Universo Terapêutico Gamificado
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
              Explore 5 planetas temáticos com jogos adaptativos, missões e avatares evolutivos
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { emoji: '🌟', name: 'Planeta Aurora', desc: 'Flexibilidade cognitiva, coordenação e regulação sensorial', anim: { rotate: [0, 10, -10, 0] } },
              { emoji: '🌀', name: 'Planeta Vortex', desc: 'Atenção sustentada, controle inibitório e memória operacional', anim: { rotate: [0, 360] } },
              { emoji: '💡', name: 'Planeta Lumen', desc: 'Consciência fonológica, linguagem e processamento linguístico', anim: { scale: [1, 1.2, 1] } },
            ].map((planet) => (
              <motion.div key={planet.name} variants={scaleIn}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
                  <CardHeader className="text-center pb-2">
                    <motion.div 
                      className="text-3xl md:text-4xl mb-2"
                      animate={planet.anim}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {planet.emoji}
                    </motion.div>
                    <CardTitle className="text-white text-lg">{planet.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm text-center">{planet.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {user && (
            <motion.div 
              className="text-center mt-8 md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow w-full sm:w-auto">
                <Link to="/sistema-planeta-azul" className="flex items-center gap-2">
                  🪐 Explorar Sistema Planeta Azul
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Advanced Features */}
      <motion.section 
        className="py-12 md:py-24 bg-gradient-to-br from-background to-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-8 md:mb-16" variants={fadeInUp}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Funcionalidades Avançadas
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tecnologia de Ponta para Desenvolvimento Cognitivo
              </span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Plataforma completa com IA, gamificação e análise comportamental em tempo real
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Target, title: 'Avatar Evolutivo', desc: 'Personagem que evolui com o progresso da criança, desbloqueando novos acessórios e níveis', color: 'bg-primary/10 text-primary' },
              { icon: Award, title: 'Sistema de Missões', desc: 'Desafios diários e semanais que mantêm o engajamento e motivação constantes', color: 'bg-secondary/10 text-secondary' },
              { icon: Brain, title: 'Chatbot Terapêutico', desc: 'Assistente IA para check-ins emocionais e orientações personalizadas para pais', color: 'bg-accent/10 text-accent', hasChat: true },
              { icon: BarChart3, title: 'Análise Preditiva', desc: 'IA detecta padrões comportamentais e antecipa necessidades de intervenção', color: 'bg-primary/10 text-primary' },
            ].map((feature) => (
              <motion.div key={feature.title} variants={scaleIn}>
                <Card className="shadow-card hover:shadow-glow transition-all duration-300 h-full">
                  <CardHeader className="text-center pb-2 px-3 md:px-6">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${feature.color.split(' ')[0]} rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-4`}>
                      <feature.icon className={`w-5 h-5 md:w-6 md:h-6 ${feature.color.split(' ')[1]}`} />
                    </div>
                    <CardTitle className="text-sm md:text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <p className="text-xs md:text-sm text-muted-foreground text-center line-clamp-3 md:line-clamp-none">
                      {feature.desc}
                    </p>
                    {feature.hasChat && user && (
                      <Button asChild size="sm" className="w-full mt-3 hidden md:flex">
                        <Link to="/chat">Acessar Chat</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      
      {/* Educational System */}
      <motion.section 
        className="py-12 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-8 md:mb-16" variants={fadeInUp}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {t('common.newFeature')} • {t('educational.title')}
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('educational.title')}
              </span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('educational.subtitle')}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Zap, title: t('educational.features.unifiedScoring.title'), desc: t('educational.features.unifiedScoring.description'), color: 'primary' },
              { icon: GraduationCap, title: t('educational.features.pedagogicalFeedback.title'), desc: t('educational.features.pedagogicalFeedback.description'), color: 'secondary' },
              { icon: Brain, title: t('educational.features.adaptiveLearning.title'), desc: t('educational.features.adaptiveLearning.description'), color: 'accent' },
              { icon: BarChart3, title: t('educational.features.progressTracking.title'), desc: t('educational.features.progressTracking.description'), color: 'primary' },
            ].map((feature) => (
              <motion.div key={feature.title} variants={scaleIn}>
                <Card className="shadow-card hover:shadow-glow transition-all duration-300 h-full">
                  <CardHeader className="text-center pb-2 px-3 md:px-6">
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-4`}>
                      <feature.icon className={`w-5 h-5 md:w-6 md:h-6 text-${feature.color}`} />
                    </div>
                    <CardTitle className="text-sm md:text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <p className="text-xs md:text-sm text-muted-foreground text-center line-clamp-3 md:line-clamp-none">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {user && (
            <motion.div 
              className="text-center mt-8 md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button asChild size="lg" className="shadow-soft w-full sm:w-auto">
                <Link to="/educational-dashboard" className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t('common.myLearning')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.section>
      
      {/* Clinical Dashboard Section */}
      {user && (
        <motion.section 
          className="py-12 md:py-24 bg-gradient-to-br from-muted/30 to-accent/20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div className="text-center mb-8 md:mb-16" variants={fadeInUp}>
              <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
                {t('common.newFeature')} • {t('clinical.behavioralAnalysis')}
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">
                  {t('clinical.title')}
                </span>
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('clinical.subtitle')}
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div className="space-y-4 md:space-y-8" variants={fadeInUp}>
                <Card className="shadow-card border-destructive/20">
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center text-destructive text-base md:text-lg">
                      <Stethoscope className="w-5 h-5 mr-2" />
                      {t('clinical.diagnosticTests')}
                    </CardTitle>
                    <CardDescription>
                      Testes baseados em evidências científicas para detecção precoce
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-destructive rounded-full mr-3 shrink-0" />
                        Atenção Sustentada e Controle Inibitório
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-info rounded-full mr-3 shrink-0" />
                        Flexibilidade Cognitiva e Memória Operacional
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-success rounded-full mr-3 shrink-0" />
                        Coordenação Visuomotora e Persistência
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-info/20">
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center text-info text-base md:text-lg">
                      <Brain className="w-5 h-5 mr-2" />
                      {t('clinical.behavioralAnalysis')}
                    </CardTitle>
                    <CardDescription>
                      IA analisa padrões de comportamento em tempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-info rounded-full mr-3 shrink-0" />
                        Métricas de função executiva
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-secondary rounded-full mr-3 shrink-0" />
                        Padrões de atenção e concentração
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-success rounded-full mr-3 shrink-0" />
                        Indicadores de desenvolvimento social
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div className="space-y-4 md:space-y-6" variants={fadeInUp}>
                <Card className="shadow-glow border-primary">
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center text-primary text-base md:text-lg">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      {t('clinical.automaticReports')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Receba análises detalhadas com recomendações personalizadas baseadas no desempenho dos jogos.
                    </p>
                    
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Avaliação de Risco</span>
                        <Badge variant="outline" className="text-xs">Automática</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Sugestões de Intervenção</span>
                        <Badge variant="outline" className="text-xs">Personalizada</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Acompanhamento Contínuo</span>
                        <Badge variant="outline" className="text-xs">Em Tempo Real</Badge>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full mt-4 shadow-soft">
                      <Link to="/clinical" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {t('clinical.accessPanel')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Index;
