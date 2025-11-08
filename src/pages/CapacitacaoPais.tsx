import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { 
  ArrowLeft, BookOpen, Heart, Users, Lightbulb, 
  CheckCircle2, Brain, Target, GraduationCap, PlayCircle 
} from 'lucide-react';

export default function CapacitacaoPais() {
  const navigate = useNavigate();

  const trainingModules = [
    {
      id: 'entendendo-neurodiversidade',
      title: 'Entendendo a Neurodiversidade',
      description: 'Aprenda sobre TEA, TDAH, Dislexia e como apoiar seu filho',
      icon: Brain,
      duration: '30 min',
      topics: [
        'O que é neurodiversidade',
        'Características principais',
        'Mitos e verdades',
        'Como identificar sinais'
      ],
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'estrategias-casa',
      title: 'Estratégias para Casa',
      description: 'Técnicas práticas para o dia a dia',
      icon: Heart,
      duration: '45 min',
      topics: [
        'Rotinas estruturadas',
        'Ambiente sensorial adequado',
        'Comunicação efetiva',
        'Gestão de comportamentos'
      ],
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'apoio-emocional',
      title: 'Apoio Emocional',
      description: 'Como fortalecer a autoestima e autonomia',
      icon: Target,
      duration: '40 min',
      topics: [
        'Regulação emocional',
        'Desenvolvimento de autonomia',
        'Construção de autoestima',
        'Lidando com frustrações'
      ],
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'parceria-escola',
      title: 'Parceria com a Escola',
      description: 'Trabalhando em conjunto com educadores',
      icon: GraduationCap,
      duration: '35 min',
      topics: [
        'Comunicação escola-família',
        'Plano educacional (PEI)',
        'Reuniões efetivas',
        'Direitos educacionais'
      ],
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'jogos-terapeuticos',
      title: 'Jogos Terapêuticos em Casa',
      description: 'Como usar os jogos do NeuroPlay efetivamente',
      icon: PlayCircle,
      duration: '25 min',
      topics: [
        'Escolhendo jogos adequados',
        'Estabelecendo objetivos',
        'Acompanhando progresso',
        'Reforço positivo'
      ],
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'rede-apoio',
      title: 'Construindo uma Rede de Apoio',
      description: 'Importância do suporte familiar e comunitário',
      icon: Users,
      duration: '30 min',
      topics: [
        'Grupos de apoio',
        'Profissionais especializados',
        'Recursos comunitários',
        'Cuidando de si mesmo'
      ],
      color: 'text-accent',
      bgColor: 'bg-accent/10'
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
            Capacitação para Pais
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Aprenda estratégias práticas e baseadas em evidências para apoiar o desenvolvimento do seu filho
          </p>
        </div>

        {/* Introduction Card */}
        <Card className="p-6 mb-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Por que esta capacitação é importante?</h3>
              <p className="text-muted-foreground mb-4">
                Como pais, vocês são os principais parceiros no desenvolvimento do seu filho. Esta capacitação 
                oferece conhecimento científico de forma acessível, técnicas práticas testadas e aprovadas por 
                especialistas, e estratégias para criar um ambiente de apoio e crescimento.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Baseado em evidências científicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Aplicável no dia a dia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Desenvolvido com especialistas</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Training Modules */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Módulos de Capacitação</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules.map((module) => {
              const Icon = module.icon;
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className={`w-14 h-14 rounded-xl ${module.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${module.color}`} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <BookOpen className="w-4 h-4" />
                      <span>{module.duration}</span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <p className="text-sm font-semibold">Você vai aprender:</p>
                      {module.topics.slice(0, 3).map((topic, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{topic}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      Iniciar Módulo
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-2xl font-bold mb-6 text-center">Benefícios da Capacitação</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Conhecimento Especializado</h3>
              <p className="text-sm text-muted-foreground">
                Entenda melhor as necessidades do seu filho e como apoiá-lo
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Estratégias Práticas</h3>
              <p className="text-sm text-muted-foreground">
                Ferramentas que você pode usar imediatamente no dia a dia
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Fortalecimento Familiar</h3>
              <p className="text-sm text-muted-foreground">
                Construa um ambiente de apoio, compreensão e crescimento
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ModernPageLayout>
  );
}
