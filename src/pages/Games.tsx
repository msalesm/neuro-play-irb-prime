import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, BarChart3 } from 'lucide-react';

// Jogos organizados por categorias cognitivas
const gameCategories = {
  memory: {
    title: 'Memória',
    description: 'Desenvolva diferentes tipos de memória',
    color: 'gradient-memory',
    icon: '🧠',
    games: [
      {
        id: 'memoria-colorida',
        title: 'Memória Colorida',
        category: 'Memória',
        description: 'Jogo de memória com cores vibrantes e padrões únicos para desenvolver a memória visual e sequencial.',
        features: ['Memória Visual', 'Concentração', 'Padrões'],
        ageRange: '4-12 anos',
        duration: '10-15 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  },
  focus: {
    title: 'Foco e Atenção',
    description: 'Aprimore concentração e atenção sustentada',
    color: 'gradient-focus',
    icon: '🎯',
    games: [
      {
        id: 'caca-foco',
        title: 'Caça Foco',
        category: 'Foco',
        description: 'Encontre objetos específicos em cenários complexos para treinar atenção seletiva e concentração.',
        features: ['Atenção Seletiva', 'Concentração', 'Busca Visual'],
        ageRange: '5-14 anos',
        duration: '8-12 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      },
      {
        id: 'attention-sustained',
        title: 'Atenção Sustentada',
        category: 'Foco',
        description: 'Mantenha o foco por períodos prolongados em tarefas desafiadoras.',
        features: ['Atenção Sustentada', 'Concentração', 'Resistência Mental'],
        ageRange: '6-16 anos',
        duration: '15-20 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  },
  logic: {
    title: 'Raciocínio Lógico',
    description: 'Desenvolva pensamento crítico e lógico',
    color: 'gradient-problem',
    icon: '🧩',
    games: [
      {
        id: 'logica-rapida',
        title: 'Lógica Rápida',
        category: 'Lógica',
        description: 'Desafios de raciocínio lógico com tempo limitado para estimular agilidade mental e tomada de decisões.',
        features: ['Raciocínio Lógico', 'Velocidade', 'Tomada de Decisão'],
        ageRange: '7-15 anos',
        duration: '5-10 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      },
      {
        id: 'quebra-cabeca-magico',
        title: 'Quebra-Cabeça Mágico',
        category: 'Lógica',
        description: 'Monte quebra-cabeças com peças mágicas para desenvolver raciocínio espacial.',
        features: ['Raciocínio Espacial', 'Resolução de Problemas', 'Planejamento'],
        ageRange: '5-12 anos',
        duration: '10-15 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  },
  language: {
    title: 'Linguagem',
    description: 'Fortaleça habilidades de comunicação e leitura',
    color: 'gradient-language',
    icon: '📚',
    games: [
      {
        id: 'caca-letras',
        title: 'Caça Letras',
        category: 'Linguagem',
        description: 'Encontre letras e forme palavras em cenários divertidos.',
        features: ['Reconhecimento de Letras', 'Formação de Palavras', 'Vocabulário'],
        ageRange: '4-10 anos',
        duration: '8-12 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      },
      {
        id: 'silaba-magica',
        title: 'Sílaba Mágica',
        category: 'Linguagem',
        description: 'Divida palavras em sílabas através de jogos interativos.',
        features: ['Divisão Silábica', 'Consciência Fonológica', 'Leitura'],
        ageRange: '5-10 anos',
        duration: '10-15 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      },
      {
        id: 'contador-historias',
        title: 'Contador de Histórias',
        category: 'Linguagem',
        description: 'Crie narrativas interativas e desenvolva habilidades de comunicação.',
        features: ['Narrativa', 'Criatividade', 'Expressão Oral'],
        ageRange: '6-14 anos',
        duration: '15-20 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  },
  math: {
    title: 'Matemática',
    description: 'Explore números e conceitos matemáticos',
    color: 'gradient-math',
    icon: '🔢',
    games: [
      {
        id: 'aventura-numeros',
        title: 'Aventura dos Números',
        category: 'Matemática',
        description: 'Embarque em aventuras numéricas para aprender conceitos matemáticos.',
        features: ['Números', 'Operações', 'Raciocínio Matemático'],
        ageRange: '5-12 anos',
        duration: '10-15 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  },
  coordination: {
    title: 'Coordenação',
    description: 'Desenvolva habilidades motoras e rítmicas',
    color: 'gradient-social',
    icon: '🎵',
    games: [
      {
        id: 'ritmo-musical',
        title: 'Ritmo Musical',
        category: 'Coordenação',
        description: 'Siga ritmos musicais e desenvolva coordenação motora.',
        features: ['Ritmo', 'Coordenação', 'Música'],
        ageRange: '4-14 anos',
        duration: '8-15 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  },
  social: {
    title: 'Habilidades Sociais',
    description: 'Pratique interações e competências sociais',
    color: 'gradient-social',
    icon: '🤝',
    games: [
      {
        id: 'social-scenarios',
        title: 'Cenários Sociais',
        category: 'Social',
        description: 'Pratique situações sociais em ambientes seguros e controlados.',
        features: ['Interação Social', 'Empatia', 'Comunicação'],
        ageRange: '6-16 anos',
        duration: '15-20 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      },
      {
        id: 'social-compass',
        title: 'Bússola Social',
        category: 'Social',
        description: 'Navegue por situações sociais complexas com orientação.',
        features: ['Navegação Social', 'Tomada de Decisão', 'Empati'],
        ageRange: '8-16 anos',
        duration: '12-18 min',
        players: '1 jogador',
        status: 'Disponível',
        unlocked: true,
        type: 'basic' as const
      }
    ]
  }
};

// Testes Diagnósticos Especializados
const diagnosticTests = [
  {
    id: 'attention-sustained',
    title: 'Atenção Sustentada',
    category: 'TDAH',
    description: 'Avaliação científica da capacidade de manter atenção focada por períodos prolongados.',
    features: ['Teste CPT', 'Métricas Precisas', 'Relatório Científico'],
    ageRange: '6-16 anos',
    duration: '15-20 min',
    players: '1 jogador',
    status: 'Disponível',
    color: 'from-orange-500 to-red-600',
    unlocked: true,
    type: 'diagnostic' as const
  }
];

export default function Games() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-hero bg-clip-text text-transparent">
              Login Necessário
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login para acessar os jogos terapêuticos.
            </p>
            <Button asChild className="w-full">
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold gradient-hero bg-clip-text text-transparent text-balance">
            Jogos Terapêuticos
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Experiências organizadas por habilidades cognitivas para desenvolvimento direcionado
            e avaliações diagnósticas baseadas em evidências científicas.
          </p>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/clinical">
                <BarChart3 className="w-5 h-5 mr-2" />
                Painel Clínico
              </Link>
            </Button>
          </div>
        </div>

        {/* Jogos Terapêuticos por Categoria */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold gradient-hero bg-clip-text text-transparent text-balance">
              Jogos Terapêuticos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Organizados por habilidades cognitivas específicas para desenvolvimento direcionado e progressivo.
            </p>
          </div>

          {Object.entries(gameCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center text-2xl shadow-card`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.games.map((game) => (
                  <Card key={game.id} className="h-full shadow-card hover:shadow-glow transition-smooth border-0 overflow-hidden group flex flex-col">
                    <div className={`h-2 ${category.color}`} />
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {game.category}
                        </Badge>
                        {!game.unlocked && (
                          <div className="text-muted-foreground">🔒</div>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {game.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 space-y-4 pb-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {game.description}
                      </p>

                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap gap-1">
                          {game.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>👥 {game.players}</div>
                          <div>⏱️ {game.duration}</div>
                          <div>🎯 {game.ageRange}</div>
                          <div>✨ {game.status}</div>
                        </div>
                      </div>

                      <Button 
                        asChild={game.unlocked} 
                        disabled={!game.unlocked}
                        className="w-full mt-auto"
                        variant={game.unlocked ? "default" : "secondary"}
                      >
                        {game.unlocked ? (
                          <Link to={`/games/${game.id}`}>
                            Jogar Agora
                          </Link>
                        ) : (
                          <span>Em Breve</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Testes Diagnósticos */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold gradient-hero bg-clip-text text-transparent text-balance">
              Testes Diagnósticos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Avaliações científicas padronizadas para identificar perfis cognitivos e necessidades específicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnosticTests.map((test) => (
              <Card key={test.id} className="h-full shadow-card hover:shadow-glow transition-smooth border-0 overflow-hidden group flex flex-col">
                <div className={`h-2 bg-gradient-to-r ${test.color}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {test.category}
                    </Badge>
                    {!test.unlocked && (
                      <div className="text-muted-foreground">🔒</div>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {test.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 space-y-4 pb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {test.description}
                  </p>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap gap-1">
                      {test.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>👥 {test.players}</div>
                      <div>⏱️ {test.duration}</div>
                      <div>🎯 {test.ageRange}</div>
                      <div>✨ {test.status}</div>
                    </div>
                  </div>

                  <Button 
                    asChild={test.unlocked} 
                    disabled={!test.unlocked}
                    className="w-full transition-smooth mt-auto"
                    variant={test.unlocked ? "default" : "secondary"}
                  >
                    {test.unlocked ? (
                      <Link to={`/games/${test.id}`}>
                        Iniciar Teste
                      </Link>
                    ) : (
                      <span>Em Breve</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Neuroplasticidade - Seção Separada */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-balance">
              Treinamento de Neuroplasticidade
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Exercícios especializados para desenvolvimento de funções cognitivas específicas.
            </p>
          </div>

          <Card className="shadow-card border-primary/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto gradient-hero rounded-2xl flex items-center justify-center text-3xl shadow-glow">
                🧠
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Módulos de Neuroplasticidade</h3>
                <p className="text-muted-foreground">
                  Treinamento cognitivo avançado baseado em neurociência para desenvolvimento
                  de raciocínio rápido, pensamento flexível e controle executivo.
                </p>
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link to="/neuroplasticity">
                  <Brain className="w-5 h-5" />
                  Acessar Neuroplasticidade
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}