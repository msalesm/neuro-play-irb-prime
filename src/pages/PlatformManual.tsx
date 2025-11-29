import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Video, FileText, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';

export default function PlatformManual() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('getting-started');

  const gettingStartedSteps = [
    {
      title: '1. Completar o Onboarding',
      description: 'Ao criar sua conta, você passa por um wizard de 4 etapas onde fornece seus dados, aceita os termos, dá consentimentos LGPD e cria o perfil da criança com informações sobre perfil sensorial.',
    },
    {
      title: '2. Selecionar Avatar',
      description: 'Escolha um avatar para a criança. O avatar evolui conforme o progresso nos planetas, desbloqueando acessórios e níveis.',
    },
    {
      title: '3. Fazer Triagem TUNP (Opcional)',
      description: 'Recomendamos iniciar com a Triagem Unificada NeuroPlay para identificar necessidades específicas em 6 dimensões: TEA, TDAH, Dislexia, Discalculia, DLD e Perfil Sensorial.',
    },
    {
      title: '4. Explorar o Sistema Planeta Azul',
      description: 'Navegue pelos 5 planetas temáticos e escolha jogos apropriados. Nossa IA sugere a melhor missão diária baseada no perfil.',
    },
    {
      title: '5. Fazer Check-ins Emocionais',
      description: 'Use o chatbot terapêutico regularmente para registrar o estado emocional da criança. Nossa IA analisa padrões e gera insights.',
    },
  ];

  const features = [
    {
      category: '🎮 Jogos Cognitivos Terapêuticos',
      items: [
        {
          question: 'Quantos jogos estão disponíveis?',
          answer: 'Atualmente temos 15+ jogos terapêuticos baseados em neurociência, cobrindo 7 domínios cognitivos: atenção sustentada, controle inibitório, memória de trabalho, flexibilidade cognitiva, processamento fonológico, cognição social e processamento espacial.',
        },
        {
          question: 'Como funcionam as métricas?',
          answer: 'Cada sessão de jogo registra automaticamente métricas como acurácia, tempo de reação, duração e score. Esses dados alimentam os relatórios clínicos e análises de IA.',
        },
        {
          question: 'A dificuldade se adapta automaticamente?',
          answer: 'Sim! Nossa IA ajusta a dificuldade baseada no desempenho. Se a acurácia for ≥80%, o nível aumenta. Se for <50%, o nível diminui.',
        },
      ],
    },
    {
      category: '🔍 TUNP - Triagem Unificada',
      items: [
        {
          question: 'O que é a TUNP?',
          answer: 'Triagem Unificada NeuroPlay: sistema completo de screening para 6 dimensões neurodivergentes (TEA/M-CHAT, TDAH/SNAP-IV, Dislexia, Discalculia, DLD, Perfil Sensorial). Algoritmos validados geram scores e recomendações.',
        },
        {
          question: 'É um diagnóstico?',
          answer: 'NÃO! A TUNP é uma ferramenta de triagem/screening, não substitui avaliação clínica profissional. Resultados sugerem encaminhamento para especialistas quando necessário.',
        },
        {
          question: 'Como interpretar os resultados?',
          answer: 'A TUNP gera scores percentilados e classificação de risco (baixo/moderado/alto). Exporta PDF automático com recomendações detalhadas para compartilhar com terapeutas.',
        },
      ],
    },
    {
      category: '🌍 Sistema Planeta Azul',
      items: [
        {
          question: 'O que são os planetas?',
          answer: '5 planetas temáticos: Aurora (TEA/Cognição Social), Vortex (TDAH/Atenção), Lumen (Dislexia/Linguagem), Calm (Regulação Emocional), Order (Funções Executivas). Cada planeta tem jogos específicos.',
        },
        {
          question: 'Como funcionam as missões diárias?',
          answer: 'Nossa IA analisa o perfil da criança e histórico de jogos para recomendar a melhor missão do dia. Missões semanais cobrem múltiplos planetas para desenvolvimento balanceado.',
        },
        {
          question: 'O que são os Anéis do Sistema?',
          answer: 'Recompensa semanal especial! Completando missões cross-planet durante a semana, você desbloqueia Anéis do Sistema Azul, um sistema de progressão de longo prazo.',
        },
      ],
    },
    {
      category: '💬 Chatbot Terapêutico IA',
      items: [
        {
          question: 'Como funciona o chatbot?',
          answer: 'Assistente conversacional com IA. Oferece check-ins emocionais diários, coaching parental e interpretação de resultados. Todas as conversas são salvas.',
        },
        {
          question: 'A IA detecta padrões automaticamente?',
          answer: 'Sim! A cada 10 mensagens, nossa IA analisa a conversa para detectar padrões comportamentais, preocupações emocionais, sinais de progresso e gera recomendações personalizadas.',
        },
        {
          question: 'Como fazer um check-in emocional?',
          answer: 'Use os botões de ação rápida no chat ou diga "Como está se sentindo hoje?". O chatbot conduz um diálogo guiado para registrar o estado emocional.',
        },
      ],
    },
    {
      category: '📊 Relatórios Clínicos',
      items: [
        {
          question: 'Quais tipos de relatórios existem?',
          answer: '1) Relatórios Clínicos IA (perfil cognitivo 6 domínios, análise automatizada), 2) Relatórios Comportamentais (conversas + insights + check-ins), 3) Histórico Emocional (gráficos evolução), 4) Relatório da Plataforma (funcionalidades implementadas).',
        },
        {
          question: 'Posso exportar relatórios?',
          answer: 'Sim! Todos os relatórios podem ser exportados em PDF para compartilhar com terapeutas, escolas ou profissionais de saúde.',
        },
        {
          question: 'Com que frequência devo gerar relatórios?',
          answer: 'Recomendamos relatórios clínicos mensais para acompanhamento de progresso. Check-ins emocionais devem ser semanais ou quinzenais.',
        },
      ],
    },
    {
      category: '👤 Avatar Evolutivo',
      items: [
        {
          question: 'Como o avatar evolui?',
          answer: 'O avatar tem 5 níveis progressivos. Cada planeta completado avança um nível e desbloqueia acessórios exclusivos daquele planeta (visual + temático).',
        },
        {
          question: 'Posso customizar o avatar?',
          answer: 'Sim! Vá em "Customizar Avatar" no dashboard. Escolha acessórios desbloqueados (óculos, chapéus, roupas, etc.) para personalizar a aparência.',
        },
        {
          question: 'Os acessórios têm significado?',
          answer: 'Sim! Cada acessório é vinculado a um planeta específico. Ex: óculos do Planeta Lumen (Dislexia), fone de ouvido do Planeta Calm (Regulação Emocional).',
        },
      ],
    },
    {
      category: '🎓 PEI - Plano Educacional Individualizado',
      items: [
        {
          question: 'O que é o PEI?',
          answer: 'Plano Educacional Individualizado gerado automaticamente por IA após triagem TUNP. Define metas SMART, estratégias pedagógicas, acomodações escolares e sistema de acompanhamento.',
        },
        {
          question: 'Posso editar o PEI?',
          answer: 'Sim! O PEI é totalmente editável. Você pode adicionar/remover metas, estratégias e acomodações conforme necessário.',
        },
        {
          question: 'Como compartilhar com a escola?',
          answer: 'Use o botão "Compartilhar PEI" para gerar um link seguro ou exportar PDF. Professores com acesso ao portal podem visualizar diretamente.',
        },
      ],
    },
    {
      category: '🏫 Integração Escolar',
      items: [
        {
          question: 'Professores têm acesso à plataforma?',
          answer: 'Sim! Professores podem criar conta com perfil "Professor", visualizar PEIs compartilhados, registrar ocorrências escolares e ver progresso limitado dos alunos (sem dados clínicos sensíveis).',
        },
        {
          question: 'Como funciona a comunicação tripartite?',
          answer: 'Sistema de comunicação integrado permite mensagens entre pais-terapeutas-professores sobre o progresso da criança, mantendo todos informados.',
        },
        {
          question: 'O que é o portal de capacitação docente?',
          answer: '6 módulos de treinamento sobre neurodiversidade (Lei 14.254/21): TEA, TDAH, Dislexia e estratégias pedagógicas. 30 questões por módulo com certificação digital válida.',
        },
      ],
    },
  ];

  const troubleshooting = [
    {
      question: 'Não consigo ver o avatar da criança',
      answer: 'Verifique se você selecionou um avatar no wizard de onboarding. Se pulou essa etapa, vá em "Customizar Avatar" no dashboard para escolher um agora.',
    },
    {
      question: 'Os jogos não estão salvando o progresso',
      answer: 'Certifique-se de estar logado e que a sessão foi completada até o fim. Progresso só é salvo ao finalizar o jogo (não ao pausar/sair no meio).',
    },
    {
      question: 'Check-ins emocionais não aparecem no histórico',
      answer: 'Check-ins devem ser completados via chatbot usando ações rápidas ou diálogo guiado. Verifique se a conversa foi salva em "Histórico Emocional".',
    },
    {
      question: 'Relatório clínico dá erro ao gerar',
      answer: 'Certifique-se de ter pelo menos 3 sessões de jogos completadas nos últimos 30 dias. Relatórios precisam de dados mínimos para análise.',
    },
    {
      question: 'Missão diária não aparece',
      answer: 'Missões são geradas baseadas em atividade recente. Complete pelo menos 2-3 jogos para a IA começar a recomendar missões personalizadas.',
    },
    {
      question: 'Como resetar o tour guiado?',
      answer: 'Clique no botão ❓ no canto inferior direito de qualquer página para refazer o tour interativo daquela tela.',
    },
  ];

  const tips = [
    {
      title: '💡 Use o Chatbot Diariamente',
      description: 'Check-ins emocionais regulares melhoram significativamente a qualidade dos insights comportamentais gerados pela IA.',
    },
    {
      title: '🎯 Complete Missões Cross-Planet',
      description: 'Não foque apenas em um planeta! Missões semanais incentivam desenvolvimento balanceado em múltiplas áreas cognitivas.',
    },
    {
      title: '📊 Exporte Relatórios Mensalmente',
      description: 'Mantenha histórico dos relatórios clínicos para acompanhar evolução temporal e compartilhar com terapeutas.',
    },
    {
      title: '🏆 Celebre Conquistas de Avatar',
      description: 'Quando o avatar sobe de nível, celebre com a criança! Isso reforça motivação intrínseca e engajamento.',
    },
    {
      title: '🔒 Revise Consentimentos LGPD',
      description: 'Você pode revisar e atualizar consentimentos de dados a qualquer momento nas Configurações > Privacidade.',
    },
    {
      title: '👨‍👩‍👧 Convide Outros Responsáveis',
      description: 'Múltiplos responsáveis podem ter acesso ao perfil da criança. Vá em Configurações > Família para convidar.',
    },
  ];

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-12 h-12 text-[#005a70]" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Manual da Plataforma
              </h1>
              <p className="text-xl text-muted-foreground">
                Guia completo para usar todos os recursos do NeuroPlay 2.0
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">
              🚀 Início Rápido
            </TabsTrigger>
            <TabsTrigger value="features">
              💎 Funcionalidades
            </TabsTrigger>
            <TabsTrigger value="troubleshooting">
              🔧 Problemas
            </TabsTrigger>
            <TabsTrigger value="tips">
              💡 Dicas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Video className="w-6 h-6 text-[#005a70]" />
                  Primeiros Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gettingStartedSteps.map((step, index) => (
                    <Card key={index} className="border-l-4 border-l-[#005a70]">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6 bg-gradient-to-r from-[#005a70]/10 to-[#0a1e35]/10 border-2 border-[#005a70]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">🎯 Recomendação de Fluxo Ideal</h3>
                    <p className="text-muted-foreground mb-4">
                      Login → Selecionar Avatar → Triagem TUNP → Explorar Planeta Recomendado → Jogar Missão Diária → Check-in Emocional → Ver Relatório
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Este fluxo garante que você aproveite ao máximo todas as funcionalidades terapêuticas da plataforma!
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#005a70]" />
                  Guia de Funcionalidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {features.map((category, catIndex) => (
                  <div key={catIndex} className="mb-8">
                    <h3 className="text-xl font-bold mb-4">{category.category}</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, itemIndex) => (
                        <AccordionItem key={itemIndex} value={`item-${catIndex}-${itemIndex}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  🔧 Solução de Problemas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {troubleshooting.map((item, index) => (
                    <AccordionItem key={index} value={`trouble-${index}`}>
                      <AccordionTrigger className="text-left font-semibold">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <Card className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      ⚠️ Ainda com Problemas?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Se o problema persistir após tentar as soluções acima:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Tente fazer logout e login novamente</li>
                      <li>Limpe o cache do navegador (Ctrl+Shift+Delete)</li>
                      <li>Verifique sua conexão com a internet</li>
                      <li>Entre em contato com suporte: suporte@irbprime.com.br</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-[#c7923e]" />
                  Dicas e Melhores Práticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tips.map((tip, index) => (
                    <Card key={index} className="border-l-4 border-l-[#c7923e]">
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-2">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6 bg-gradient-to-r from-[#c7923e]/10 to-[#005a70]/10 border-2 border-[#c7923e]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">🌟 Maximizando Resultados Terapêuticos</h3>
                    <p className="text-muted-foreground mb-4">
                      Para melhores resultados, recomendamos sessões de 15-30 minutos, 3-5 vezes por semana. 
                      Consistência é mais importante que duração! Check-ins emocionais semanais e revisão mensal de relatórios 
                      com terapeuta garantem acompanhamento efetivo.
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