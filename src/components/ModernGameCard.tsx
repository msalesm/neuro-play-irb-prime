import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { LucideIcon, Lock } from 'lucide-react';
import { GameIllustration } from './GameIllustration';

interface ModernGameCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  gradient: string;
  progress?: {
    current: number;
    total: number;
  };
  difficulty?: string;
  duration?: string;
  unlocked?: boolean;
  path: string;
  gameId?: string;
}

export function ModernGameCard({
  title,
  description,
  icon: Icon,
  gradient,
  progress,
  difficulty,
  duration,
  unlocked = true,
  path,
  gameId
}: ModernGameCardProps) {
  const content = (
    <Card className={`relative overflow-hidden transition-smooth hover:scale-105 hover:shadow-glow ${!unlocked ? 'opacity-70' : ''}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      
      {/* Game Illustration Background */}
      {gameId && (
        <div className="absolute top-2 right-2 opacity-20">
          <GameIllustration gameId={gameId} className="w-20 h-20" />
        </div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/10 rounded-full blur-md" />
      
      {/* Lock overlay for locked games */}
      {!unlocked && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}
      
      {/* Progress badge */}
      {progress && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-black/30 text-white border-white/20 backdrop-blur-sm">
            {progress.current}/{progress.total}
          </Badge>
        </div>
      )}
      
      <CardContent className="relative p-4 h-32 flex flex-col justify-between text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            {gameId ? (
              <GameIllustration gameId={gameId} className="w-6 h-6" animated />
            ) : (
              <Icon className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1">{title}</h3>
            {description && (
              <p className="text-xs text-white/80 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        
        {(difficulty || duration) && (
          <div className="flex gap-1.5">
            {difficulty && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-xs py-0.5 px-2">
                {difficulty}
              </Badge>
            )}
            {duration && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-xs py-0.5 px-2">
                {duration}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!unlocked) {
    return content;
  }

  return (
    <Link to={path} className="block">
      {content}
    </Link>
  );
}