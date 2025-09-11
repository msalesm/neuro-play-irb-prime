import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  CheckCircle,
  Lock,
  Play,
  Star,
  ArrowRight,
  Trophy,
  Target
} from "lucide-react";

interface Game {
  id: string;
  name: string;
  unlocked: boolean;
  completed: boolean;
}

interface ProgressTrailProps {
  games: Game[];
  trackColor: string;
  trackName: string;
}

export default function ProgressTrail({ games, trackColor, trackName }: ProgressTrailProps) {
  const completedCount = games.filter(game => game.completed).length;
  const progressPercentage = (completedCount / games.length) * 100;

  const GameNode = ({ game, index, isLast }: { 
    game: Game; 
    index: number; 
    isLast: boolean; 
  }) => (
    <div className="relative flex items-center">
      {/* Connection Line */}
      {!isLast && (
        <div className="absolute top-8 left-8 w-px h-20 bg-gradient-to-b from-primary/60 to-primary/20 z-0" />
      )}
      
      {/* Game Node */}
      <div className="relative z-10 flex items-center gap-4 w-full p-5 rounded-xl border-2 bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        {/* Status Icon */}
        <div className="relative">
          {game.completed ? (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-green-200"
              style={{ backgroundColor: '#10B981' }}
            >
              <CheckCircle className="w-8 h-8 text-white" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          ) : game.unlocked ? (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white/30 hover:scale-110 transition-transform"
              style={{ backgroundColor: trackColor }}
            >
              <span className="font-bold text-lg">{index + 1}</span>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shadow-sm border-2 border-muted-foreground/20">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          
          {/* Progress Ring for Active Games */}
          {game.unlocked && !game.completed && (
            <div className="absolute -inset-2 rounded-full border-3 border-primary/40 animate-pulse" />
          )}
        </div>

        {/* Game Info */}
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2">{game.name}</h4>
          <div className="flex items-center gap-3 mb-3">
            <Badge 
              variant={game.completed ? 'default' : game.unlocked ? 'secondary' : 'outline'} 
              className="text-sm"
            >
              {game.completed ? (
                <>
                  <Trophy className="w-4 h-4 mr-1" />
                  Conquistado
                </>
              ) : game.unlocked ? (
                <>
                  <Target className="w-4 h-4 mr-1" />
                  Disponível
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  Bloqueado
                </>
              )}
            </Badge>
            
            {game.completed && (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <Star className="w-3 h-3 mr-1" />
                100% Completo
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {game.completed 
              ? '🎉 Parabéns! Você dominou este desafio' 
              : game.unlocked 
              ? '🎮 Pronto para ser explorado - clique em Jogar!' 
              : '🔒 Complete os jogos anteriores para desbloquear'
            }
          </p>
        </div>

        {/* Action Button */}
        {game.unlocked && (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              variant={game.completed ? "outline" : "default"}
              asChild
              className="min-w-[120px]"
              style={!game.completed ? { backgroundColor: trackColor } : {}}
            >
              <Link to={`/games/${game.id}`} className="flex items-center gap-2">
                {game.completed ? (
                  <>
                    <Star className="w-5 h-5" />
                    Revisar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Jogar Agora
                  </>
                )}
              </Link>
            </Button>
            
            {game.completed && (
              <div className="text-center">
                <span className="text-xs text-green-600 font-medium">
                  ✨ Concluído
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ArrowRight className="w-6 h-6 text-primary" />
          <h4 className="font-bold text-xl">Trilha de Progresso - {trackName}</h4>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">
            {completedCount} de {games.length} jogos concluídos
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="w-32 h-2" />
            <span className="text-sm font-medium text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-6 rounded-xl border border-primary/20 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-semibold text-lg mb-1">Progresso Geral</h5>
            <p className="text-sm text-muted-foreground">
              {progressPercentage === 100 
                ? '🎉 Parabéns! Você completou toda a trilha!' 
                : `Continue sua jornada - ${games.length - completedCount} jogos restantes`
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary mb-1">
              {Math.round(progressPercentage)}%
            </div>
            {progressPercentage === 100 && (
              <Badge className="bg-gold text-yellow-800">
                <Trophy className="w-4 h-4 mr-1" />
                Mestre!
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Game Nodes */}
      <div className="space-y-6">
        {games.map((game, index) => (
          <GameNode 
            key={game.id} 
            game={game} 
            index={index} 
            isLast={index === games.length - 1}
          />
        ))}
      </div>

      {/* Completion Achievement */}
      {progressPercentage === 100 && (
        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-8 rounded-xl border-2 border-yellow-400/30 text-center">
          <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="font-bold text-2xl text-yellow-800 mb-2">
            🎉 Trilha Conquistada! 🎉
          </h3>
          <p className="text-yellow-700 mb-4">
            Você completou todos os desafios desta trilha de desenvolvimento.
            Continue explorando outras trilhas para expandir suas habilidades!
          </p>
          <Button asChild size="lg" className="bg-yellow-600 hover:bg-yellow-700">
            <Link to="/game-map" className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Explorar Outras Trilhas
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}