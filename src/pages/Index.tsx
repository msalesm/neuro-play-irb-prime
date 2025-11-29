import { NeuroPlayHero } from "@/components/NeuroPlayHero";
import { MVPGameModules } from "@/components/MVPGameModules";
import { NeuroPlayFeatures } from "@/components/NeuroPlayFeatures";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { Footer } from "@/components/Footer";
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen">
      <AccessibilityControls />
      <NeuroPlayHero />
      <MVPGameModules />
      
      {/* Sistema Planeta Azul - Feature Highlight */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
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
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-accent/50">
              Novo • Sistema Planeta Azul 🪐
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Universo Terapêutico Gamificado
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Explore 5 planetas temáticos com jogos adaptativos, missões e avatares evolutivos
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={scaleIn}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                <CardHeader className="text-center">
                  <motion.div 
                    className="text-4xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🌟
                  </motion.div>
                  <CardTitle className="text-white">Planeta Aurora</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 text-sm text-center">
                    TEA - Teoria da Mente, flexibilidade cognitiva e regulação sensorial
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                <CardHeader className="text-center">
                  <motion.div 
                    className="text-4xl mb-4"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    🌀
                  </motion.div>
                  <CardTitle className="text-white">Planeta Vortex</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 text-sm text-center">
                    TDAH - Atenção sustentada, controle inibitório e memória de trabalho
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                <CardHeader className="text-center">
                  <motion.div 
                    className="text-4xl mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    💡
                  </motion.div>
                  <CardTitle className="text-white">Planeta Lumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 text-sm text-center">
                    Dislexia - Consciência fonológica, leitura e processamento linguístico
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {user && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
                <Link to="/sistema-planeta-azul" className="flex items-center gap-2">
                  🪐 Explorar Sistema Planeta Azul
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Advanced Features Section */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-background to-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Funcionalidades Avançadas
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tecnologia de Ponta para Desenvolvimento Cognitivo
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Plataforma completa com IA, gamificação e análise comportamental em tempo real
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Avatar Evolutivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Personagem que evolui com o progresso da criança, desbloqueando novos acessórios e níveis
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Sistema de Missões</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Desafios diários e semanais que mantêm o engajamento e motivação constantes
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Chatbot Terapêutico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Assistente IA para check-ins emocionais e orientações personalizadas para pais
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Análise Preditiva</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    IA detecta padrões comportamentais e antecipa necessidades de intervenção
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Educational System Section */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-primary/5 to-secondary/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {t('common.newFeature')} • {t('educational.title')}
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('educational.title')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('educational.subtitle')}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{t('educational.features.unifiedScoring.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('educational.features.unifiedScoring.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">{t('educational.features.pedagogicalFeedback.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('educational.features.pedagogicalFeedback.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{t('educational.features.adaptiveLearning.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('educational.features.adaptiveLearning.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{t('educational.features.progressTracking.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('educational.features.progressTracking.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {user && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button asChild size="lg" className="shadow-soft">
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
          className="py-24 bg-gradient-to-br from-muted/30 to-accent/20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInUp}
            >
              <Badge className="mb-4 bg-red-100 text-red-800 border-red-200">
                {t('common.newFeature')} • {t('clinical.behavioralAnalysis')}
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  {t('clinical.title')}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('clinical.subtitle')}
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div className="space-y-8" variants={fadeInUp}>
                <Card className="shadow-card border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
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
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                        Teste de Atenção Sustentada (TDAH)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                        Flexibilidade Cognitiva (TEA)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3" />
                        Processamento Fonológico (Dislexia)
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
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
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                        Métricas de função executiva
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                        Padrões de atenção e concentração
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        Indicadores de desenvolvimento social
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div className="space-y-6" variants={fadeInUp}>
                <Card className="shadow-glow border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      {t('clinical.automaticReports')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Receba análises detalhadas com recomendações personalizadas baseadas no desempenho dos jogos.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Avaliação de Risco</span>
                        <Badge variant="outline">Automática</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Sugestões de Intervenção</span>
                        <Badge variant="outline">Personalizada</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Acompanhamento Contínuo</span>
                        <Badge variant="outline">Em Tempo Real</Badge>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full mt-6 shadow-soft">
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
      
      <NeuroPlayFeatures />
      <Footer />
    </div>
  );
};

export default Index;