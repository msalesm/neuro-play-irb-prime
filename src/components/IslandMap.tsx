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
  Info,
  Play,
  Lock,
  CheckCircle,
  Star,
  MapPin,
  Anchor,
  TreePine,
  Mountain,
  Castle
} from "lucide-react";
import NeurodiversityModal from "./NeurodiversityModal";

interface IslandMapProps {
  neurodiversityTracks: any;
  onTrackSelect: (trackId: string) => void;
  selectedTrack: string | null;
}

const islandThemes = {
  tea: {
    icon: Brain,
    islandIcon: TreePine,
    name: "Ilha da Conexão",
    position: { top: "20%", left: "15%" },
    color: "hsl(213 85% 65%)",
    bgGradient: "from-blue-400/20 to-blue-600/30",
    size: "large"
  },
  tdah: {
    icon: Focus,
    islandIcon: Mountain,
    name: "Pico do Foco",
    position: { top: "15%", right: "20%" }, 
    color: "hsl(150 40% 65%)",
    bgGradient: "from-green-400/20 to-green-600/30",
    size: "medium"
  },
  dislexia: {
    icon: BookOpen,
    islandIcon: Castle,
    name: "Forte da Leitura",
    position: { bottom: "25%", left: "25%" },
    color: "hsl(142 71% 45%)",
    bgGradient: "from-emerald-400/20 to-emerald-600/30",
    size: "medium"
  },
  altas_habilidades: {
    icon: Sparkles,
    islandIcon: Anchor,
    name: "Porto dos Talentos",
    position: { bottom: "20%", right: "15%" },
    color: "hsl(262 83% 58%)",
    bgGradient: "from-purple-400/20 to-purple-600/30",
    size: "large"
  }
};

const connectionPaths = [
  // TEA to TDAH
  { from: "tea", to: "tdah", path: "M 20% 25% Q 50% 10% 75% 20%" },
  // TDAH to Altas Habilidades  
  { from: "tdah", to: "altas_habilidades", path: "M 75% 20% Q 90% 50% 80% 75%" },
  // TEA to Dislexia
  { from: "tea", to: "dislexia", path: "M 20% 25% Q 15% 60% 30% 70%" },
  // Dislexia to Altas Habilidades
  { from: "dislexia", to: "altas_habilidades", path: "M 30% 70% Q 60% 85% 80% 75%" }
];

export default function IslandMap({ neurodiversityTracks, onTrackSelect, selectedTrack }: IslandMapProps) {
  const [modalTrack, setModalTrack] = useState<string | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

  const calculateProgress = (games: any[]) => {
    const completed = games.filter(game => game.completed).length;
    return (completed / games.length) * 100;
  };

  const IslandCard = ({ trackId, track }: { trackId: string, track: any }) => {
    const theme = islandThemes[trackId as keyof typeof islandThemes];
    const IconComponent = theme.icon;
    const IslandIconComponent = theme.islandIcon;
    const progress = calculateProgress(track.games);
    const isSelected = selectedTrack === trackId;
    const isHovered = hoveredIsland === trackId;

    return (
      <div
        className={`absolute transform transition-all duration-500 ${
          theme.size === 'large' ? 'scale-110' : 'scale-100'
        } ${isHovered ? 'scale-125 z-20' : 'z-10'} ${isSelected ? 'z-30' : ''}`}
        style={theme.position}
        onMouseEnter={() => setHoveredIsland(trackId)}
        onMouseLeave={() => setHoveredIsland(null)}
      >
        <Card 
          className={`relative overflow-hidden border-3 transition-all duration-500 cursor-pointer w-48 ${
            isSelected 
              ? 'border-primary shadow-2xl shadow-primary/30 scale-110' 
              : isHovered
              ? 'border-primary/60 shadow-xl shadow-primary/20 scale-105'
              : 'border-white/40 hover:border-white/60 shadow-lg'
          } backdrop-blur-sm bg-white/80`}
          onClick={() => onTrackSelect(trackId)}
        >
          {/* Island Background */}
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} opacity-60`} />
          <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent" />
          
          {/* Floating Island Effect */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-sm opacity-50" />
          
          <CardContent className="relative p-4 text-center">
            {/* Island Icon */}
            <div className="relative mb-3">
              <div 
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm border-2 border-white/30"
                style={{ backgroundColor: theme.color }}
              >
                <IslandIconComponent className="w-8 h-8" />
              </div>
              
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1">
                {progress === 100 ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : progress > 0 ? (
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Island Name */}
            <h3 className="font-bold text-sm mb-1 text-gray-800">{theme.name}</h3>
            <p className="text-xs text-gray-600 mb-2">{track.name}</p>

            {/* Progress */}
            <div className="space-y-1 mb-3">
              <Progress value={progress} className="h-2" />
              <span className="text-xs text-gray-600">{Math.round(progress)}% explorado</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalTrack(trackId);
                }}
                className="w-full text-xs"
              >
                <Info className="w-3 h-3 mr-1" />
                Sobre
              </Button>
              
              {track.games.some((game: any) => game.unlocked) && (
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const firstUnlockedGame = track.games.find((game: any) => game.unlocked && !game.completed);
                    if (firstUnlockedGame) {
                      // Navigate to the game
                      window.location.href = `/games/${firstUnlockedGame.id}`;
                    }
                  }}
                  className="w-full text-xs"
                  style={{ backgroundColor: theme.color }}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Explorar
                </Button>
              )}
            </div>

            {/* Game count badge */}
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -left-2 text-xs bg-white/90 border border-gray-200"
            >
              {track.games.length} jogos
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Ocean Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-blue-400 to-blue-600">
        {/* Animated waves */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent transform translate-y-4 animate-pulse" />
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-800/50 to-transparent" />
        </div>
        
        {/* Floating clouds */}
        <div className="absolute top-10 left-20 w-16 h-8 bg-white/60 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-20 right-32 w-20 h-10 bg-white/40 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-32 left-1/2 w-12 h-6 bg-white/50 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Connection Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        {connectionPaths.map((path, index) => (
          <path
            key={index}
            d={path.path}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="3"
            strokeDasharray="10,5"
            fill="none"
            className="animate-pulse"
            style={{ 
              animationDelay: `${index * 0.5}s`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        ))}
      </svg>

      {/* Islands */}
      {Object.entries(neurodiversityTracks).map(([trackId, track]) => (
        <IslandCard key={trackId} trackId={trackId} track={track} />
      ))}

      {/* Legend */}
      <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40">
        <h4 className="font-semibold text-sm mb-3 text-gray-800">Legenda do Mapa</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span>Ilha Completamente Explorada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full" />
            <span>Ilha Parcialmente Explorada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full" />
            <span>Ilha Inexplorada</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="4">
              <path d="M 0 2 L 16 2" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" strokeDasharray="4,2" />
            </svg>
            <span>Rotas de Conexão</span>
          </div>
        </div>
      </div>

      {/* Navigation Compass */}
      <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/40">
        <div className="w-12 h-12 flex items-center justify-center">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-gray-400 rounded-full" />
            <div className="absolute top-0 left-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-500 transform -translate-x-1/2 -translate-y-1" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NeurodiversityModal 
        isOpen={modalTrack !== null}
        onClose={() => setModalTrack(null)}
        trackId={modalTrack || ''}
      />
    </div>
  );
}