import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Puzzle, Type, Lightbulb, Zap, Rainbow, Play } from 'lucide-react';

const cognitiveGames = [
  {
    id: 'foco-rapido',
    title: 'Foco Rápido',
    emoji: '🎯',
    description: 'Toque apenas nos estímulos corretos que piscam rapidamente',
    function: 'Atenção e tempo de resposta',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    path: '/games/foco-rapido',
  },
  {
    id: 'logica-formas',
    title: 'Lógica das Formas',
    emoji: '🧩',
    description: 'Encaixe figuras antes do tempo acabar',
    function: 'Raciocínio lógico e coordenação visuoespacial',
    icon: Puzzle,
    color: 'from-purple-500 to-pink-500',
    path: '/games/logica-formas',
  },
  {
    id: 'palavra-magica',
    title: 'Palavra Mágica',
    emoji: '🔠',
    description: 'Complete palavras ou sons faltantes',
    function: 'Linguagem e leitura (dislexia)',
    icon: Type,
    color: 'from-green-500 to-emerald-500',
    path: '/games/palavra-magica',
  },
  {
    id: 'memoria-emocoes',
    title: 'Memória das Emoções',
    emoji: '💡',
    description: 'Lembre-se das expressões e cores mostradas',
    function: 'Memória de curto prazo e empatia',
    icon: Lightbulb,
    color: 'from-orange-500 to-yellow-500',
    path: '/games/memoria-emocoes',
  },
  {
    id: 'controle-impulso',
    title: 'Controle de Impulso',
    emoji: '🚀',
    description: 'Evite clicar em estímulos proibidos',
    function: 'Inibição e foco sustentado (TDAH)',
    icon: Zap,
    color: 'from-red-500 to-rose-500',
    path: '/games/controle-impulso',
  },
  {
    id: 'caminho-atencao',
    title: 'Caminho da Atenção',
    emoji: '🌈',
    description: 'Siga padrões visuais e auditivos combinados',
    function: 'Atenção dividida e coordenação sensorial',
    icon: Rainbow,
    color: 'from-indigo-500 to-violet-500',
    path: '/games/caminho-atencao',
  },
];

export function CognitiveGamesGrid() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Jogos Cognitivos</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cada jogo foi projetado para avaliar e estimular habilidades específicas do cérebro
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {cognitiveGames.map((game, index) => (
            <Card 
              key={game.id} 
              className="group relative overflow-hidden border-2 hover:shadow-glow transition-smooth hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

              <CardContent className="relative p-6">
                {/* Icon and Emoji */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl`}>
                    {game.emoji}
                  </div>
                  <game.icon className="w-8 h-8 text-primary opacity-50" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2">{game.title}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">{game.description}</p>

                {/* Function Badge */}
                <Badge variant="secondary" className="mb-6">
                  {game.function}
                </Badge>

                {/* Play Button */}
                <Link to={game.path}>
                  <Button className="w-full" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Jogar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
