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
  Gamepad2,
  CheckCircle,
  MapPin,
  ArrowRight
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

  const GameNode = ({ game, index, isLast, trackColor }: { 
    game: any; 
    index: number; 
    isLast: boolean; 
    trackColor: string; 
  }) => (
    <div className="relative flex items-center">
      {/* Connection Line */}
      {!isLast && (
        <div className="absolute top-6 left-6 w-px h-16 bg-gradient-to-b from-primary/40 to-primary/20 z-0" />
      )}
      
      {/* Game Node */}
      <div className="relative z-10 flex items-center gap-4 w-full p-4 rounded-xl border bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 hover:shadow-lg">
        {/* Status Icon */}
        <div className="relative">
          {game.completed ? (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#10B981' }}
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          ) : game.unlocked ? (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white/20"
              style={{ backgroundColor: trackColor }}
            >
              <span className="font-bold text-sm">{index + 1}</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          
          {/* Progress Ring for Active Games */}
          {game.unlocked && !game.completed && (
            <div className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse" />
          )}
        </div>

        {/* Game Info */}
        <div className="flex-1">
          <h4 className="font-semibold text-base mb-1">{game.name}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {game.completed ? '✅ Concluído' : game.unlocked ? '🎮 Disponível' : '🔒 Bloqueado'}
          </p>
          <Badge 
            variant={game.completed ? 'default' : game.unlocked ? 'secondary' : 'outline'} 
            className="text-xs"
          >
            {game.completed ? 'Finalizado' : game.unlocked ? 'Jogar Agora' : 'Em Breve'}
          </Badge>
        </div>

        {/* Action Button */}
        {game.unlocked && (
          <Button
            size="sm"
            variant={game.completed ? "outline" : "default"}
            asChild
            className="ml-2"
          >
            <Link to={`/games/${game.id}`} className="flex items-center gap-2">
              {game.completed ? <Star className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {game.completed ? 'Revisar' : 'Jogar'}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  const TrackCard = ({ trackId, track }: { trackId: string, track: any }) => {
    const IconComponent = track.icon;
    const progress = calculateProgress(track.games);
    const isSelected = selectedTrack === trackId;

    return (
      <Card 
        className={`relative overflow-hidden border-2 transition-all duration-500 hover:shadow-xl cursor-pointer ${
          isSelected 
            ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:scale-[1.01]'
        }`}
        onClick={() => setSelectedTrack(isSelected ? null : trackId)}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient} opacity-60`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        
        <CardContent className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: track.color }}
              >
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{track.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {track.games.length} jogos
                  </Badge>
                  <Badge 
                    variant={progress === 100 ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {Math.round(progress)}% completo
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ChevronRight 
                className={`w-6 h-6 transition-all duration-300 ${
                  isSelected ? 'rotate-90 text-primary' : 'text-muted-foreground'
                }`} 
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {track.description}
          </p>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Progresso da Trilha</span>
              <span className={progress === 100 ? 'text-green-600' : 'text-primary'}>
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Game Trail (when expanded) */}
          {isSelected && (
            <div className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-6">
                <ArrowRight className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-lg">Trilha de Jogos</h4>
              </div>
              
              <div className="space-y-4">
                {track.games.map((game: any, index: number) => (
                  <GameNode 
                    key={game.id} 
                    game={game} 
                    index={index} 
                    isLast={index === track.games.length - 1}
                    trackColor={track.color}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Gamepad2 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mapa de Jogos
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Trilhas personalizadas para desenvolvimento neurodiverso
              </p>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-muted-foreground">Trilhas Disponíveis</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Jogos Terapêuticos</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Jogos Concluídos</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Interactive Tracks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {Object.entries(neurodiversityTracks).map(([trackId, track]) => (
            <TrackCard key={trackId} trackId={trackId} track={track} />
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-primary/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Gamepad2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-2xl">Biblioteca Completa de Jogos</h3>
            </div>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Explore nossa coleção completa de jogos terapêuticos, cada um projetado com base em 
              evidências científicas para apoiar o desenvolvimento neurodiverso.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/games" className="flex items-center gap-3">
                <Gamepad2 className="w-6 h-6" />
                Ver Todos os Jogos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}