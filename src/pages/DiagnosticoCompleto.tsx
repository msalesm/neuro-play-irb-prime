import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, BookOpen, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { ModernPageLayout } from '@/components/ModernPageLayout';

export default function DiagnosticoCompleto() {
  const navigate = useNavigate();

  const diagnosticTests = [
    {
      id: 'tea',
      title: 'Triagem TEA',
      subtitle: 'Transtorno do Espectro Autista',
      description: 'Avaliação de habilidades sociais, comunicação e padrões comportamentais',
      icon: Brain,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      duration: '15-20 minutos',
      path: '/screening/tea',
      features: [
        'Interação social e comunicação',
        'Flexibilidade cognitiva',
        'Regulação sensorial',
        'Padrões de comportamento'
      ]
    },
    {
      id: 'tdah',
      title: 'Triagem TDAH',
      subtitle: 'Transtorno do Déficit de Atenção com Hiperatividade',
      description: 'Avaliação de atenção, impulsividade e controle executivo',
      icon: Target,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      duration: '10-15 minutos',
      path: '/screening/tdah',
      features: [
        'Atenção sustentada e seletiva',
        'Controle inibitório',
        'Memória de trabalho',
        'Impulsividade e hiperatividade'
      ]
    },
    {
      id: 'dislexia',
      title: 'Triagem Dislexia',
      subtitle: 'Dificuldades de Leitura e Processamento',
      description: 'Avaliação de processamento fonológico e habilidades de leitura',
      icon: BookOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      duration: '12-18 minutos',
      path: '/screening/dislexia',
      features: [
        'Consciência fonológica',
        'Decodificação e fluência',
        'Compreensão de leitura',
        'Memória verbal'
      ]
    }
  ];

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Testes Diagnósticos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Avaliações gamificadas baseadas em evidências científicas para identificação precoce 
            de características neurodiversas em crianças
          </p>
        </div>

        {/* Important Notice */}
        <Card className="p-6 mb-8 border-primary/50 bg-primary/5">
          <div className="flex items-start gap-4">
            <Brain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Importante: Não Substitui Diagnóstico Profissional</h3>
              <p className="text-sm text-muted-foreground">
                Estes testes fornecem indicadores comportamentais que podem auxiliar na identificação 
                de características neurodiversas. Os resultados devem sempre ser interpretados por 
                profissionais qualificados (psicólogos, neurologistas, fonoaudiólogos). 
                <strong className="text-foreground"> Não representam diagnósticos clínicos.</strong>
              </p>
            </div>
          </div>
        </Card>

        {/* How it Works */}
        <Card className="p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Como Funciona?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Escolha o Teste</h3>
              <p className="text-sm text-muted-foreground">
                Selecione a avaliação adequada para seu filho
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-secondary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Jogue com a Criança</h3>
              <p className="text-sm text-muted-foreground">
                Atividades lúdicas e envolventes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-accent">3</span>
              </div>
              <h3 className="font-semibold mb-2">Análise Automática</h3>
              <p className="text-sm text-muted-foreground">
                IA analisa padrões comportamentais
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold mb-2">Relatório Detalhado</h3>
              <p className="text-sm text-muted-foreground">
                Insights e recomendações personalizadas
              </p>
            </div>
          </div>
        </Card>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {diagnosticTests.map((test) => {
            const Icon = test.icon;
            return (
              <Card key={test.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${test.bgColor} flex items-center justify-center mb-3 md:mb-4`}>
                  <Icon className={`w-7 h-7 md:w-8 md:h-8 ${test.color}`} />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-2">{test.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium mb-2 md:mb-3">{test.subtitle}</p>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 line-clamp-2">{test.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration}</span>
                </div>
                
                <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                  <p className="text-xs md:text-sm font-semibold">O que avaliamos:</p>
                  {test.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate(test.path)}
                >
                  Iniciar Triagem
                </Button>
              </Card>
            );
          })}
        </div>

        {/* After Tests Section */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <h2 className="text-2xl font-bold mb-4 text-center">Após os Testes</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Relatório Completo</h3>
              <p className="text-sm text-muted-foreground">
                Perfil cognitivo detalhado com pontos fortes e áreas de atenção
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">PEI Personalizado</h3>
              <p className="text-sm text-muted-foreground">
                Plano Educacional Individualizado gerado automaticamente
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Jogos Recomendados</h3>
              <p className="text-sm text-muted-foreground">
                Atividades terapêuticas específicas para desenvolvimento
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ModernPageLayout>
  );
}
