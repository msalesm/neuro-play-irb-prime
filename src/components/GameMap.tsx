import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Focus, 
  BookOpen, 
  Sparkles, 
  Play, 
  Lock, 
  ChevronRight,
  Trophy,
  Star,
  Gamepad2
} from "lucide-react";

// Neurodiversity tracks configuration
const neurodiversityTracks = {
  tea: {
    name: "TEA (Autismo)",
    icon: Brain,
    color: "hsl(var(--primary))",
    gradient: "from-primary/20 to-primary/5",
    description: "Desenvolva habilidades sociais e regulação emocional",
    games: [
      { id: "social-scenarios", name: "Social Scenarios", unlocked: true, completed: false },
      { id: "mindful-breath", name: "MindfulBreath", unlocked: true, completed: false },
      { id: "sensory-flow", name: "SensoryFlow", unlocked: false, completed: false }
    ]
  },
  tdah: {
    name: "TDAH",
    icon: Focus,
    color: "hsl(var(--accent))",
    gradient: "from-accent/20 to-accent/5",
    description: "Fortaleça foco, atenção e autorregulação",
    games: [
      { id: "focus-forest", name: "Focus Forest", unlocked: true, completed: false },
      { id: "balance-quest", name: "BalanceQuest", unlocked: true, completed: false },
      { id: "visual-sync", name: "VisualSync", unlocked: false, completed: false }
    ]
  },
  dislexia: {
    name: "Dislexia",
    icon: BookOpen,
    color: "hsl(142 71% 45%)",
    gradient: "from-green-500/20 to-green-500/5",
    description: "Desenvolva processamento cognitivo e habilidades de leitura",
    games: [
      { id: "sensory-flow", name: "SensoryFlow", unlocked: true, completed: false },
      { id: "touch-mapper", name: "TouchMapper", unlocked: true, completed: false },
      { id: "visual-sync", name: "VisualSync", unlocked: false, completed: false }
    ]
  },
  altas_habilidades: {
    name: "Altas Habilidades",
    icon: Sparkles,
    color: "hsl(262 83% 58%)",
    gradient: "from-purple-500/20 to-purple-500/5",
    description: "Desafios avançados para mentes excepcionais",
    games: [
      { id: "focus-forest", name: "Focus Forest Pro", unlocked: true, completed: false },
      { id: "social-scenarios", name: "Social Scenarios Plus", unlocked: true, completed: false },
      { id: "balance-quest", name: "BalanceQuest Elite", unlocked: false, completed: false }
    ]
  }
};

export default function GameMap() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const calculateProgress = (games: any[]) => {
    const completed = games.filter(game => game.completed).length;
    return (completed / games.length) * 100;
  };

  const TrackCard = ({ trackId, track }: { trackId: string, track: any }) => {
    const IconComponent = track.icon;
    const progress = calculateProgress(track.games);
    const isSelected = selectedTrack === trackId;

    return (
      <Card 
        className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
          isSelected ? 'border-primary shadow-primary/20' : 'border-border hover:border-primary/50'
        }`}
        onClick={() => setSelectedTrack(isSelected ? null : trackId)}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient}`} />
        
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: track.color }}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{track.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {track.games.length} jogos
                </Badge>
              </div>
            </div>
            <ChevronRight 
              className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} 
            />
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {track.description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {isSelected && (
            <div className="mt-6 space-y-3 animate-in slide-in-from-top-2 duration-300">
              {track.games.map((game: any, index: number) => (
                <div
                  key={game.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    game.unlocked 
                      ? 'bg-background/80 border-border' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {game.completed ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      ) : game.unlocked ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{game.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {game.completed ? 'Concluído' : game.unlocked ? 'Disponível' : 'Bloqueado'}
                      </p>
                    </div>
                  </div>

                  {game.unlocked && (
                    <Button
                      size="sm"
                      variant={game.completed ? "secondary" : "default"}
                      asChild
                    >
                      <Link to={`/games/${game.id}`}>
                        <Play className="w-4 h-4 mr-1" />
                        {game.completed ? 'Rejogur' : 'Jogar'}
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold">
              Mapa de Jogos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Trilhas personalizadas para cada neurodiversidade
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-2xl">4</span>
              </div>
              <p className="text-xs text-muted-foreground">Trilhas</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-green-500" />
                <span className="font-bold text-2xl">12</span>
              </div>
              <p className="text-xs text-muted-foreground">Jogos</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-2xl">0</span>
              </div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(neurodiversityTracks).map(([trackId, track]) => (
            <TrackCard key={trackId} trackId={trackId} track={track} />
          ))}
        </div>

        {/* Quick Access to All Games */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-xl mb-2">Explorar Todos os Jogos</h3>
            <p className="text-muted-foreground mb-4">
              Acesse a biblioteca completa de jogos terapêuticos
            </p>
            <Button asChild size="lg">
              <Link to="/games" className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Ver Todos os Jogos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}