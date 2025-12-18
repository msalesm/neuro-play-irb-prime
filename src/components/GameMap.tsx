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
  ArrowRight,
  Map,
  Globe
} from "lucide-react";
import IslandMap from "./IslandMap";
import ProgressTrail from "./ProgressTrail";

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
      { id: "balance-quest", name: "BalanceQuest", unlocked: true, completed: false },
      { id: "visual-sync", name: "VisualSync", unlocked: true, completed: false },
      { id: "tower-defense", name: "Tower Defense", unlocked: false, completed: false }
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
      { id: "social-scenarios", name: "Social Scenarios Plus", unlocked: true, completed: false },
      { id: "balance-quest", name: "BalanceQuest Elite", unlocked: true, completed: false },
      { id: "tower-defense", name: "Tower Defense Pro", unlocked: false, completed: false }
    ]
  }
};

export default function GameMap() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'island' | 'list'>('island');

  const calculateProgress = (games: any[]) => {
    const completed = games.filter(game => game.completed).length;
    return (completed / games.length) * 100;
  };

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(selectedTrack === trackId ? null : trackId);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-background via-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Map className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Arquipélago do Desenvolvimento
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Navegue pelas ilhas temáticas da neurodiversidade
                </p>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex justify-center gap-2 mb-6">
              <Button
                variant={viewMode === 'island' ? 'default' : 'outline'}
                onClick={() => setViewMode('island')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Vista do Mapa
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Vista de Lista
              </Button>
            </div>
            
            {/* Enhanced Stats */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="text-xl font-bold">4</div>
                    <div className="text-xs text-muted-foreground">Ilhas Disponíveis</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-muted-foreground">Jogos Terapêuticos</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <div>
                    <div className="text-xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Conquistados</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Island Map View */}
      {viewMode === 'island' && (
        <IslandMap 
          neurodiversityTracks={neurodiversityTracks}
          onTrackSelect={handleTrackSelect}
          selectedTrack={selectedTrack}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-gradient-to-br from-background via-background to-muted/20 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {Object.entries(neurodiversityTracks).map(([trackId, track]) => {
                const IconComponent = track.icon;
                const progress = calculateProgress(track.games);
                const isSelected = selectedTrack === trackId;

                return (
                  <Card 
                    key={trackId}
                    className={`relative overflow-hidden border-2 transition-all duration-500 hover:shadow-xl cursor-pointer ${
                      isSelected 
                        ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02]' 
                        : 'border-border hover:border-primary/50 hover:scale-[1.01]'
                    }`}
                    onClick={() => handleTrackSelect(trackId)}
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
                        
                        <ChevronRight 
                          className={`w-6 h-6 transition-all duration-300 ${
                            isSelected ? 'rotate-90 text-primary' : 'text-muted-foreground'
                          }`} 
                        />
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
                        <ProgressTrail 
                          games={track.games}
                          trackColor={track.color}
                          trackName={track.name}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
      )}
    </div>
  );
}