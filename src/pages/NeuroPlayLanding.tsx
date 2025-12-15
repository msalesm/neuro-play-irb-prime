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
          NeuroPlay.
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

// O que é a NeuroPlay
const AboutSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          O que é a NeuroPlay
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          A NeuroPlay é uma plataforma digital integrada que conecta <strong>diagnóstico</strong>, 
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

// O que a plataforma entrega
const DeliverablesSection = () => (
  <section className="py-20 bg-muted/30">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          O que a plataforma entrega
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          { icon: ClipboardCheck, title: "Diagnóstico estruturado e contínuo" },
          { icon: FileText, title: "Prontuário eletrônico do paciente" },
          { icon: Video, title: "Teleconsulta integrada" },
          { icon: BarChart3, title: "Relatórios cognitivos e comportamentais" },
          { icon: Activity, title: "Histórico evolutivo longitudinal" },
          { icon: Users, title: "Acompanhamento familiar e institucional" },
          { icon: Network, title: "APIs para integrações externas" },
          { icon: Calendar, title: "Gestão de filas e SLA operacional" }
        ].map((item, index) => (
          <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
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
          A NeuroPlay foi desenvolvida em <strong>seis fases progressivas</strong>, cada uma adicionando 
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
          A NeuroPlay possui arquitetura preparada para integrações com sistemas externos, 
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
          NeuroPlay é infraestrutura digital para diagnóstico e desenvolvimento humano.
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

// PDF Info
const PDFInfoSection = () => (
  <section className="py-12 bg-muted/50">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          O PDF institucional apresenta em detalhe tudo o que foi implementado da Fase 1 à Fase 6, 
          incluindo funcionalidades, benefícios e visão completa da plataforma NeuroPlay como solução de longo prazo.
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
      <DeliverablesSection />
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
