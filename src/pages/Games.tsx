import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Gamepad2, Brain, Eye, Music, Puzzle, Heart, Target, Sparkles } from 'lucide-react';

interface GameItem {
  id: string;
  name: string;
  description: string;
  route: string;
  category: 'atencao' | 'memoria' | 'linguagem' | 'logica' | 'socioemocional' | 'sensorial';
  duration: number;
  icon: typeof Brain;
}

const GAMES: GameItem[] = [
  // Atenção / foco
  { id: 'caca-foco', name: 'Caça-Foco', description: 'Atenção sustentada e visual', route: '/games/caca-foco', category: 'atencao', duration: 4, icon: Target },
  { id: 'foco-rapido', name: 'Foco Rápido', description: 'Velocidade de processamento atencional', route: '/games/foco-rapido', category: 'atencao', duration: 3, icon: Eye },
  { id: 'attention-sustained', name: 'Atenção Sustentada', description: 'Manter o foco em estímulos contínuos', route: '/games/attention-sustained', category: 'atencao', duration: 5, icon: Eye },
  { id: 'visual-sync', name: 'Sincronia Visual', description: 'Coordenação atenção-visual', route: '/games/visual-sync', category: 'atencao', duration: 4, icon: Eye },

  // Memória
  { id: 'memoria-colorida', name: 'Memória Colorida', description: 'Memória de trabalho com cores', route: '/games/memoria-colorida', category: 'memoria', duration: 4, icon: Brain },
  { id: 'cosmic-sequence', name: 'Sequência Cósmica', description: 'Memória sequencial visual', route: '/games/cosmic-sequence', category: 'memoria', duration: 5, icon: Brain },
  { id: 'memory-workload', name: 'Memória Sob Carga', description: 'Memória de trabalho com distração', route: '/games/memory-workload', category: 'memoria', duration: 5, icon: Brain },

  // Linguagem
  { id: 'caca-letras', name: 'Caça-Letras', description: 'Reconhecimento de letras e sílabas', route: '/games/caca-letras', category: 'linguagem', duration: 4, icon: Sparkles },
  { id: 'silaba-magica', name: 'Sílaba Mágica', description: 'Consciência fonológica', route: '/games/silaba-magica', category: 'linguagem', duration: 4, icon: Sparkles },
  { id: 'phonological', name: 'Processamento Fonológico', description: 'Discriminação de sons da fala', route: '/games/phonological', category: 'linguagem', duration: 5, icon: Sparkles },
  { id: 'contador-historias', name: 'Contador de Histórias', description: 'Compreensão narrativa', route: '/games/contador-historias', category: 'linguagem', duration: 5, icon: Sparkles },

  // Lógica / executiva
  { id: 'logica-rapida', name: 'Lógica Rápida', description: 'Raciocínio lógico-matemático', route: '/games/logica-rapida', category: 'logica', duration: 4, icon: Puzzle },
  { id: 'aventura-numeros', name: 'Aventura dos Números', description: 'Numeralização e cálculo', route: '/games/aventura-numeros', category: 'logica', duration: 5, icon: Puzzle },
  { id: 'quebra-cabeca-magico', name: 'Quebra-Cabeça Mágico', description: 'Raciocínio espacial', route: '/games/quebra-cabeca-magico', category: 'logica', duration: 5, icon: Puzzle },
  { id: 'cognitive-flexibility', name: 'Flexibilidade Cognitiva', description: 'Alternância de regras', route: '/games/cognitive-flexibility', category: 'logica', duration: 5, icon: Puzzle },
  { id: 'executive-processing', name: 'Processamento Executivo', description: 'Funções executivas', route: '/games/executive-processing', category: 'logica', duration: 5, icon: Puzzle },
  { id: 'spatial-architect', name: 'Arquiteto Espacial', description: 'Visualização espacial', route: '/games/spatial-architect', category: 'logica', duration: 5, icon: Puzzle },
  { id: 'stack-tower', name: 'Torre Empilhada', description: 'Planejamento e precisão', route: '/games/stack-tower', category: 'logica', duration: 4, icon: Puzzle },
  { id: 'tower-defense', name: 'Defesa da Torre', description: 'Estratégia e tomada de decisão', route: '/games/tower-defense', category: 'logica', duration: 5, icon: Puzzle },

  // Socioemocional
  { id: 'emotion-lab', name: 'Laboratório de Emoções', description: 'Reconhecimento emocional', route: '/games/emotion-lab', category: 'socioemocional', duration: 4, icon: Heart },
  { id: 'theory-of-mind', name: 'Teoria da Mente', description: 'Perspectiva social', route: '/games/theory-of-mind', category: 'socioemocional', duration: 5, icon: Heart },
  { id: 'emotional-weather', name: 'Clima Emocional', description: 'Auto-regulação emocional', route: '/games/emotional-weather', category: 'socioemocional', duration: 4, icon: Heart },
  { id: 'mindful-breath', name: 'Respiração Consciente', description: 'Regulação e calma', route: '/games/mindful-breath', category: 'socioemocional', duration: 3, icon: Heart },
  { id: 'behavioral-persistence', name: 'Persistência Comportamental', description: 'Tolerância à frustração', route: '/games/behavioral-persistence', category: 'socioemocional', duration: 5, icon: Heart },

  // Sensorial / motor
  { id: 'ritmo-musical', name: 'Ritmo Musical', description: 'Processamento auditivo-motor', route: '/games/ritmo-musical', category: 'sensorial', duration: 4, icon: Music },
  { id: 'sensory-flow', name: 'Fluxo Sensorial', description: 'Integração sensorial', route: '/games/sensory-flow', category: 'sensorial', duration: 4, icon: Music },
  { id: 'visuomotor', name: 'Coordenação Visuomotora', description: 'Coordenação olho-mão', route: '/games/visuomotor', category: 'sensorial', duration: 4, icon: Music },
];

const CATEGORIES = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'atencao' as const, label: 'Atenção' },
  { value: 'memoria' as const, label: 'Memória' },
  { value: 'linguagem' as const, label: 'Linguagem' },
  { value: 'logica' as const, label: 'Lógica' },
  { value: 'socioemocional' as const, label: 'Socioemocional' },
  { value: 'sensorial' as const, label: 'Sensorial' },
];

export default function Games() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]['value']>('all');

  const filtered = useMemo(() => {
    return GAMES.filter((g) => {
      const matchCat = category === 'all' || g.category === category;
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="h-7 w-7" />
            <h1 className="text-2xl md:text-3xl font-bold">Jogos Cognitivos</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-2xl">
            Atividades pedagógicas com fundamentação em neurociência. Use em sala de aula
            ou recomende a alunos para reforço de habilidades específicas.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar jogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <TabsList className="w-full overflow-x-auto justify-start flex-wrap h-auto">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Game grid */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Nenhum jogo encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const Icon = g.icon;
              return (
                <Card
                  key={g.id}
                  className="cursor-pointer hover:shadow-md hover:border-primary transition"
                  onClick={() => navigate(g.route)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{g.duration} min</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{g.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{g.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-center">
                      Iniciar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
