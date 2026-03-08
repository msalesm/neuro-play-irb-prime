import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Eye, Hand, Layers, Crosshair, Flame, ArrowLeft, PlayCircle } from 'lucide-react';

const BATTERY_TASKS = [
  {
    domain: 'Atenção Sustentada',
    description: 'Teste CPT — responda apenas ao estímulo raro',
    icon: Eye,
    path: '/games/attention-sustained-play',
    duration: '3 min',
    color: 'text-blue-600',
  },
  {
    domain: 'Controle Inibitório',
    description: 'Go/No-Go — responda ao verde, iniba no vermelho',
    icon: Hand,
    path: '/games/foco-rapido-play',
    duration: '~2 min',
    color: 'text-red-600',
  },
  {
    domain: 'Memória Operacional',
    description: 'Span crescente — memorize sequências cada vez maiores',
    icon: Brain,
    path: '/games/memory-sequence-builder',
    duration: '~3 min',
    color: 'text-purple-600',
  },
  {
    domain: 'Flexibilidade Cognitiva',
    description: 'Troca de regras — adapte-se a mudanças inesperadas',
    icon: Layers,
    path: '/games/cognitive-flexibility-play',
    duration: '~2 min',
    color: 'text-green-600',
  },
  {
    domain: 'Coordenação Visuomotora',
    description: 'Traçado controlado — siga o caminho com precisão',
    icon: Crosshair,
    path: '/games/visuomotor-coordination',
    duration: '~2 min',
    color: 'text-orange-600',
  },
  {
    domain: 'Persistência Comportamental',
    description: 'Desafio progressivo — até onde você consegue ir?',
    icon: Flame,
    path: '/games/behavioral-persistence',
    duration: 'Variável',
    color: 'text-pink-600',
  },
];

export default function CognitiveBattery() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Bateria Cognitiva Mínima</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          6 tarefas estruturadas que geram seu Perfil Interpretativo Educacional.
          Complete todas para obter uma análise comportamental completa.
        </p>
        <Badge variant="outline" className="mt-3">
          ⚠️ Ferramenta educacional — não constitui avaliação clínica
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {BATTERY_TASKS.map((task) => (
          <Link key={task.domain} to={task.path}>
            <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <task.icon className={`w-6 h-6 ${task.color}`} />
                  {task.domain}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{task.duration}</Badge>
                  <Button size="sm" variant="ghost">
                    <PlayCircle className="w-4 h-4 mr-1" /> Iniciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
