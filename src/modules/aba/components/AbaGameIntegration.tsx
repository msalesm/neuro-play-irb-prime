import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mapping of ABA skill categories to cognitive games and activities
const SKILL_GAME_MAP: Record<string, { games: { name: string; path: string; icon: any }[]; stories: string[]; routines: string[] }> = {
  atencao_conjunta: {
    games: [
      { name: 'Caça ao Tesouro Visual', path: '/games/visual-treasure-hunt', icon: Gamepad2 },
      { name: 'Atenção Sustentada', path: '/games/sustained-attention', icon: Gamepad2 },
    ],
    stories: ['Olhar junto'],
    routines: ['Atividade guiada com foco visual'],
  },
  imitacao: {
    games: [
      { name: 'Espelho Cognitivo', path: '/games/cognitive-mirror', icon: Gamepad2 },
      { name: 'Simon Diz', path: '/games/simon-says', icon: Gamepad2 },
    ],
    stories: [],
    routines: ['Imitação motora na rotina'],
  },
  comunicacao_funcional: {
    games: [
      { name: 'Construtor de Frases', path: '/games/sentence-builder', icon: Gamepad2 },
    ],
    stories: ['Pedir ajuda', 'Expressar sentimentos'],
    routines: ['Solicitar objetos durante rotina'],
  },
  instrucoes_simples: {
    games: [
      { name: 'Comando e Ação', path: '/games/command-action', icon: Gamepad2 },
      { name: 'Sequência Lógica', path: '/games/logic-sequence', icon: Gamepad2 },
    ],
    stories: [],
    routines: ['Seguir instruções na rotina diária'],
  },
  regulacao_emocional: {
    games: [
      { name: 'Termômetro Emocional', path: '/games/emotional-thermometer', icon: Gamepad2 },
    ],
    stories: ['Lidar com frustração', 'Quando fico com raiva'],
    routines: ['Pausa sensorial', 'Respiração guiada'],
  },
  flexibilidade_cognitiva: {
    games: [
      { name: 'Troca de Regras', path: '/games/rule-switch', icon: Gamepad2 },
      { name: 'Categorização Flexível', path: '/games/flexible-categorization', icon: Gamepad2 },
    ],
    stories: ['Quando as coisas mudam'],
    routines: ['Transição entre tarefas'],
  },
  interacao_social: {
    games: [
      { name: 'Jogo Cooperativo', path: '/games/cooperative-game', icon: Gamepad2 },
    ],
    stories: ['Esperar a vez', 'Brincar junto', 'Fazer amigos'],
    routines: ['Atividade em grupo'],
  },
  autonomia: {
    games: [
      { name: 'Rotina Independente', path: '/games/independent-routine', icon: Gamepad2 },
    ],
    stories: ['Fazer sozinho'],
    routines: ['Rotina matinal autônoma', 'Organizar material escolar'],
  },
};

interface AbaGameIntegrationProps {
  skillCategory: string;
  compact?: boolean;
}

export function AbaGameIntegration({ skillCategory, compact = false }: AbaGameIntegrationProps) {
  const mapping = SKILL_GAME_MAP[skillCategory];
  if (!mapping) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {mapping.games.map((g, i) => (
          <Link key={i} to={g.path}>
            <Badge variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-primary/10">
              <Gamepad2 className="w-3 h-3" />
              {g.name}
            </Badge>
          </Link>
        ))}
        {mapping.stories.map((s, i) => (
          <Link key={`s-${i}`} to="/stories">
            <Badge variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-secondary/10">
              <BookOpen className="w-3 h-3" />
              {s}
            </Badge>
          </Link>
        ))}
        {mapping.routines.map((r, i) => (
          <Badge key={`r-${i}`} variant="outline" className="text-xs gap-1">
            <Clock className="w-3 h-3" />
            {r}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Atividades Recomendadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mapping.games.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" /> Jogos Cognitivos
            </p>
            <div className="space-y-1">
              {mapping.games.map((g, i) => (
                <Link key={i} to={g.path} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm">{g.name}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {mapping.stories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Histórias Sociais
            </p>
            <div className="space-y-1">
              {mapping.stories.map((s, i) => (
                <Link key={i} to="/stories" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm">{s}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {mapping.routines.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Rotina
            </p>
            <div className="space-y-1">
              {mapping.routines.map((r, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30">
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
