import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateNeurodiversityPDF } from '@/lib/pdfGenerator';
import { ModernPageLayout } from '@/components/ModernPageLayout';

export default function PlatformReport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleDownloadPDF = () => {
    generateNeurodiversityPDF();
  };

  const implementedFeatures = [
    {
      title: '✅ Sistema de Autenticação e Onboarding LGPD',
      description: 'Autenticação completa com wizard de 4 etapas, consentimentos granulares LGPD e disclaimers clínicos.',
      status: 'Implementado'
    },
    {
      title: '✅ Jogos Cognitivos Terapêuticos (15+ jogos)',
      description: '15+ jogos baseados em neurociência para 7 domínios cognitivos com métricas em tempo real.',
      status: 'Implementado'
    },
    {
      title: '✅ TUNP - Triagem Unificada NeuroPlay',
      description: 'Sistema unificado de triagem para 6 dimensões neurodivergentes com algoritmos de risco.',
      status: 'Implementado'
    },
    {
      title: '✅ Relatórios Clínicos com IA (Google Gemini 2.5 Pro)',
      description: 'Análise clínica automatizada via IA gerando perfil cognitivo e recomendações terapêuticas.',
      status: 'Implementado'
    },
    {
      title: '✅ Chatbot Terapêutico com IA (Lovable AI)',
      description: 'Assistente conversacional para check-ins emocionais e detecção de padrões comportamentais.',
      status: 'Implementado'
    },
    {
      title: '✅ Dashboard de Histórico Emocional',
      description: 'Visualização temporal de check-ins com gráficos de evolução e análise de frequência.',
      status: 'Implementado'
    },
    {
      title: '✅ Exportação de Relatórios Comportamentais PDF',
      description: 'Geração de relatórios consolidados integrando conversas, insights e check-ins.',
      status: 'Implementado'
    },
    {
      title: '✅ PEI Inteligente',
      description: 'Geração automática de Plano Educacional Individualizado com editor completo.',
      status: 'Implementado'
    },
    {
      title: '✅ Sistema Planeta Azul',
      description: 'Universo gamificado com 5 planetas temáticos e progressão cross-planet.',
      status: 'Implementado'
    },
    {
      title: '✅ Sistema de Avatar Evolutivo',
      description: 'Avatares que evoluem 5 níveis com acessórios desbloqueáveis por planeta.',
      status: 'Implementado'
    },
    {
      title: '✅ Dashboards Multi-Stakeholder',
      description: '4 dashboards dedicados: Pais, Terapeutas, Professores e Admin/Rede.',
      status: 'Implementado'
    },
    {
      title: '✅ Educação Parental Gamificada',
      description: 'Módulos de capacitação com quizzes e certificação digital.',
      status: 'Implementado'
    },
    {
      title: '✅ Capacitação Docente (Lei 14.254/21)',
      description: '6 módulos sobre neurodiversidade com certificação válida.',
      status: 'Implementado'
    },
    {
      title: '✅ Integração Escolar e Comunicação Tripartite',
      description: 'Portal para professores com compartilhamento seguro de PEI.',
      status: 'Implementado'
    },
    {
      title: '✅ Registro Direto de Pacientes por Terapeutas',
      description: 'Terapeutas podem registrar pacientes sem conta parental prévia.',
      status: 'Implementado'
    }
  ];

  const benchmarks = [
    {
      name: '🇬🇧 ThinkDivergent (UK)',
      focus: 'Premium clinical narratives e multi-perspective reporting',
      comparison: [
        '✅ NeuroPlay implementa relatórios multi-stakeholder',
        '✅ Dashboards dedicados para cada perfil',
        '🚀 Adiciona Sistema Planeta Azul para narrativa visual'
      ]
    },
    {
      name: '🇺🇸 Mightier (USA)',
      focus: 'Biofeedback integration e emotional regulation',
      comparison: [
        '✅ Chatbot com detecção emocional implementado',
        '✅ Check-ins emocionais diários',
        '⏳ Biofeedback sensores (Fase 2.0 Sprint 5)',
        '🚀 Adiciona Perfil sensorial individualizado'
      ]
    },
    {
      name: '🇩🇰 Tiimo (Denmark)',
      focus: 'Visual routines e simplified parent UX',
      comparison: [
        '✅ Missões diárias IA implementadas',
        '✅ Sistema Planeta Azul para progressão visual',
        '✅ PEI inteligente com metas claras',
        '🚀 Adiciona Gamificação além de rotinas'
      ]
    },
    {
      name: '🇺🇸 EndeavorRx (USA)',
      focus: 'Evidence-based clinical protocols',
      comparison: [
        '✅ 15+ jogos baseados em neurociência',
        '✅ Dashboard terapeuta para prescrição',
        '✅ Análise clínica IA implementada',
        '🚀 Adiciona TUNP unificada 6 dimensões'
      ]
    },
    {
      name: '🇬🇧 Do-IT Profiler (UK)',
      focus: 'Unified comprehensive assessment',
      comparison: [
        '✅ TUNP implementada com 6 dimensões',
        '✅ Algoritmos de risco clínico',
        '✅ Exportação PDF automática',
        '🚀 Adiciona Gamificação terapêutica integrada'
      ]
    }
  ];

  const competitiveAdvantages = [
    {
      icon: '🏆',
      title: 'Única Plataforma Totalmente Integrada',
      description: 'Integra screening, jogos, chatbot IA, relatórios, PEI, capacitação e integração escolar em uma única plataforma.'
    },
    {
      icon: '🧠',
      title: 'IA Terapêutica Multi-Modal',
      description: 'IA para análise cognitiva, detecção comportamental, recomendações personalizadas e geração automática de PEI.'
    },
    {
      icon: '🇧🇷',
      title: 'Conformidade Legal Brasileira',
      description: 'Única plataforma totalmente conforme Lei 14.254/21 e LGPD com consentimentos granulares.'
    },
    {
      icon: '🌍',
      title: 'Sistema Planeta Azul',
      description: 'Gamificação terapêutica com 5 planetas temáticos e narrativa coerente cross-diagnosis.'
    },
    {
      icon: '👨‍👩‍👧',
      title: 'Ecossistema Multi-Stakeholder',
      description: '4 dashboards dedicados com comunicação tripartite integrada pais-terapeutas-professores.'
    },
    {
      icon: '💰',
      title: 'Modelo Serverless Escalável',
      description: 'Infraestrutura Lovable Cloud permite escala automática sem DevOps com custos operacionais reduzidos.'
    }
  ];

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard-pais')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Relatório da Plataforma
              </h1>
              <p className="text-xl text-muted-foreground">
                NeuroPlay 2.0 - Análise Competitiva e Funcionalidades Implementadas
              </p>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              size="lg"
              className="bg-gradient-to-r from-[#005a70] to-[#0a1e35]"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar PDF Completo
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <FileText className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="features">
              <TrendingUp className="w-4 h-4 mr-2" />
              Funcionalidades
            </TabsTrigger>
            <TabsTrigger value="benchmark">
              🏆 Benchmark
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Visão Executiva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  <strong className="text-foreground">NeuroPlay 2.0</strong> é uma plataforma clínico-terapêutica completa em parceria com <strong className="text-foreground">IRB Prime</strong>, 
                  desenvolvida para atendimento de crianças neurodivergentes (TEA, TDAH, Dislexia, Discalculia, DLD).
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="border-l-4 border-l-[#005a70]">
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-[#005a70]">15+</div>
                      <div className="text-sm text-muted-foreground">Funcionalidades Implementadas</div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-[#c7923e]">
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-[#c7923e]">5</div>
                      <div className="text-sm text-muted-foreground">Plataformas Globais Analisadas</div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-[#0a1e35]">
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-[#0a1e35]">6</div>
                      <div className="text-sm text-muted-foreground">Vantagens Competitivas Únicas</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Vantagens Competitivas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitiveAdvantages.map((advantage, index) => (
                      <Card key={index} className="border-l-4 border-l-[#005a70]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-3xl">{advantage.icon}</span>
                            <div>
                              <h4 className="font-semibold mb-1">{advantage.title}</h4>
                              <p className="text-sm text-muted-foreground">{advantage.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Funcionalidades Implementadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {implementedFeatures.map((feature, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium whitespace-nowrap">
                            {feature.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Análise Competitiva vs. 5 Plataformas Globais Líderes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {benchmarks.map((benchmark, index) => (
                    <Card key={index} className="border-l-4 border-l-[#005a70]">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2">{benchmark.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          <strong>Foco:</strong> {benchmark.focus}
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">NeuroPlay 2.0 Comparação:</p>
                          {benchmark.comparison.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6 bg-gradient-to-r from-[#005a70]/10 to-[#0a1e35]/10 border-2 border-[#005a70]">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">🏆 Resumo da Vantagem Competitiva</h3>
                    <p className="text-muted-foreground mb-4">
                      <strong className="text-foreground">NeuroPlay 2.0</strong> é a única plataforma que integra <strong>screening unificado (TUNP)</strong>, 
                      <strong> jogos terapêuticos</strong>, <strong>chatbot IA</strong>, <strong>relatórios clínicos automatizados</strong>, 
                      <strong> PEI inteligente</strong>, <strong>capacitação parental/docente</strong> e <strong>integração escolar</strong> em uma solução completa.
                    </p>
                    <p className="text-muted-foreground">
                      Concorrentes são especializados em áreas isoladas. NeuroPlay oferece ecossistema multi-stakeholder (pais, terapeutas, professores, rede) 
                      com conformidade legal brasileira (Lei 14.254/21 + LGPD) e infraestrutura serverless escalável.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}