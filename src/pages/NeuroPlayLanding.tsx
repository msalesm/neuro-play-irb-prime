import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  FileText, 
  Video, 
  BarChart3, 
  Building2, 
  School, 
  Stethoscope, 
  Network,
  Shield,
  Globe,
  CheckCircle2,
  ArrowRight,
  Download,
  Users,
  ClipboardCheck,
  Activity,
  Calendar,
  Zap,
  Lock,
  Mail
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { generatePlatformPresentation } from "@/lib/platformPresentationGenerator";

// Hero Section - Institucional e direto
const HeroSection = () => (
  <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-primary">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,90,112,0.3),transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(199,146,62,0.15),transparent_40%)]" />

    <div className="container mx-auto px-6 py-20 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
          Neuro IRB Prime.
          <br />
          <span className="text-white/90 text-2xl md:text-3xl lg:text-4xl font-normal">
            Diagnóstico, cuidado e desenvolvimento humano em uma única plataforma.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
          Avaliação neurocognitiva, prontuário eletrônico, teleconsulta e relatórios inteligentes 
          integrados em um ecossistema digital pronto para escala.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">
              <Mail className="w-5 h-5 mr-2" />
              Solicitar Demonstração
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={() => generatePlatformPresentation()}
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar PDF Institucional
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>LGPD Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>PT / ES / EN</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Plataforma Operacional</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// O que é o Neuro IRB Prime
const AboutSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          O que é o Neuro IRB Prime
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          O Neuro IRB Prime é uma plataforma digital integrada que conecta <strong>diagnóstico</strong>, 
          <strong> acompanhamento clínico</strong> e <strong>desenvolvimento cognitivo</strong> em um único ambiente. 
          Criada para profissionais, instituições e governos que precisam de dados confiáveis, 
          processos claros e escala operacional.
        </p>
        <p className="text-lg text-muted-foreground font-medium">
          Nada de atividades soltas. Nada de soluções fragmentadas.
        </p>
      </div>
    </div>
  </section>
);

// Funcionalidades principais - Prontuário e Teleconsulta em destaque
const CoreFeaturesSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Funcionalidades Principais
        </h2>
      </div>

      {/* Destaques: Prontuário e Teleconsulta */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Prontuário Eletrônico</h3>
            <p className="text-muted-foreground mb-4">
              Registro clínico completo e longitudinal do paciente, com timeline integrada, 
              avaliações em 3 blocos (cognitivo, comportamental, socioemocional), histórico 
              evolutivo e geração automática de relatórios.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Mapa cognitivo via radar
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Timeline de ações clínicas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Logs imutáveis para auditoria
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Teleconsulta Integrada</h3>
            <p className="text-muted-foreground mb-4">
              Vídeo WebRTC nativo com split-screen: consulta em vídeo de um lado, prontuário 
              do paciente do outro. Anotações em tempo real, fechamento obrigatório com 
              sumário clínico e plano de follow-up.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Split-screen vídeo + prontuário
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Histórico acessível durante sessão
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Fechamento clínico obrigatório
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Outras funcionalidades */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {[
          { icon: ClipboardCheck, title: "Diagnóstico estruturado" },
          { icon: BarChart3, title: "Relatórios inteligentes" },
          { icon: Activity, title: "Histórico evolutivo" },
          { icon: Users, title: "Acompanhamento familiar" },
          { icon: Network, title: "APIs e integrações" },
          { icon: Calendar, title: "Filas e SLA" }
        ].map((item, index) => (
          <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm text-foreground">{item.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Evolução consolidada
const EvolutionSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Uma plataforma construída por fases. Entregue como um todo.
        </h2>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          O Neuro IRB Prime foi desenvolvido em <strong>seis fases progressivas</strong>, cada uma adicionando 
          camadas reais de valor. Hoje, todas essas fases operam de forma integrada, formando uma 
          única plataforma sólida e pronta para uso institucional.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
          {[
            { phase: "1-2", title: "Infraestrutura Clínica", desc: "Auth, triagem, prontuário" },
            { phase: "3", title: "Interoperabilidade", desc: "APIs, webhooks, integrações" },
            { phase: "4", title: "Escala Operacional", desc: "Filas, SLA, métricas" },
            { phase: "5", title: "Faturamento", desc: "Contratos, invoices, gestão" },
            { phase: "6", title: "Evidência e Impacto", desc: "Outcomes, efetividade, ROI" },
          ].map((item, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4">
                <div className="text-xs text-primary font-bold mb-1">FASE {item.phase}</div>
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          size="lg" 
          variant="outline" 
          className="text-lg"
          onClick={() => generatePlatformPresentation()}
        >
          <Download className="w-5 h-5 mr-2" />
          Ver evolução completa no PDF institucional
        </Button>
      </div>
    </div>
  </section>
);

// Para quem é
const AudienceSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Para quem é
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {[
          {
            icon: Stethoscope,
            title: "Clínicas e profissionais",
            description: "Diagnóstico, prontuário, teleconsulta e relatórios em um único fluxo."
          },
          {
            icon: School,
            title: "Escolas e instituições",
            description: "Acompanhamento contínuo, dados claros e integração com famílias."
          },
          {
            icon: Building2,
            title: "Governo e setor público",
            description: "Plataforma auditável, escalável e preparada para políticas públicas."
          },
          {
            icon: Network,
            title: "Operadoras e parceiros",
            description: "Infraestrutura digital pronta para integração e white-label."
          }
        ].map((item, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Pronta para escala
const ScaleSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronta para escala
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          O Neuro IRB Prime possui arquitetura preparada para integrações com sistemas externos, 
          ERPs de saúde, prontuários legados e plataformas institucionais. É uma base tecnológica 
          pensada para crescer sem perder controle, dados ou qualidade.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {[
            "Multi-tenant",
            "White-label",
            "APIs REST",
            "Webhooks",
            "SSO/SAML",
            "LGPD Compliant"
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// CTA Final
const CTASection = () => (
  <section className="py-24 bg-primary">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Neuro IRB Prime é infraestrutura digital para diagnóstico e desenvolvimento humano.
        </h2>
        <p className="text-xl text-white/80 mb-10">
          Não é um experimento. É um sistema pronto.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">
              Acessar Plataforma
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={() => generatePlatformPresentation()}
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Apresentação (PDF)
          </Button>
        </div>
      </div>
    </div>
  </section>
);

// Soluções Educacionais - inspirado no layout Giulia
const SolucoesSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 block">Nossas Soluções</span>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          Vamos construir juntos o futuro do desenvolvimento humano
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Contribuímos com a evolução de clínicas, escolas e instituições por todo o Brasil, 
          com soluções integradas que proporcionam inovação e embasamento ao processo de cuidado e aprendizagem.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          {
            image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
            badge: "Clínicas",
            title: "Avaliação Neurocognitiva",
            description: "Diagnóstico estruturado em 3 blocos com relatórios automáticos e mapa cognitivo via radar.",
            link: "/diagnostico-completo"
          },
          {
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
            badge: "Escolas",
            title: "Neuro Play Educação",
            description: "Plataforma completa para professores com triagem escolar, turmas e acompanhamento de alunos.",
            link: "/educacao"
          },
          {
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
            badge: "Teleconsulta",
            title: "Atendimento Integrado",
            description: "Vídeo WebRTC com split-screen: consulta de um lado, prontuário do outro. Anotações em tempo real.",
            link: "/teleconsulta"
          },
          {
            image: "https://images.unsplash.com/photo-1491308056676-205b7c9a7dc1?w=600&q=80",
            badge: "Famílias",
            title: "Acompanhamento Familiar",
            description: "Dashboard para pais com progresso dos filhos, microlearning e comunicação com profissionais.",
            link: "/dashboard-pais"
          }
        ].map((item, index) => (
          <Link 
            key={index} 
            to={item.link}
            className="group block rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{item.badge}</span>
              <h3 className="text-lg font-bold text-card-foreground mt-1 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3 group-hover:gap-2 transition-all">
                Saiba mais <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button size="lg" variant="outline" asChild>
          <Link to="/auth" className="flex items-center gap-2">
            Ver todas as soluções
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

// PDF Info
const PDFInfoSection = () => (
  <section className="py-12 bg-muted/50">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          O PDF institucional apresenta em detalhe tudo o que foi implementado da Fase 1 à Fase 6, 
          incluindo funcionalidades, benefícios e visão completa da plataforma Neuro IRB Prime como solução de longo prazo.
        </p>
      </div>
    </div>
  </section>
);

// Main Landing Page
const NeuroPlayLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <AboutSection />
      <CoreFeaturesSection />
      <SolucoesSection />
      <EvolutionSection />
      <AudienceSection />
      <ScaleSection />
      <CTASection />
      <PDFInfoSection />
      <Footer />
    </div>
  );
};

export default NeuroPlayLanding;
