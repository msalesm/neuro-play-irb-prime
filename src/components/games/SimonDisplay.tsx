import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SimonDisplayProps {
  level: number;
  score: number;
  gameState: 'idle' | 'showing' | 'playing' | 'gameOver';
  currentPosition: number;
  sequenceLength: number;
  highScore?: number;
}

export function SimonDisplay({ 
  level, 
  score, 
  gameState, 
  currentPosition, 
  sequenceLength,
  highScore = 0 
}: SimonDisplayProps) {
  const progress = sequenceLength > 0 ? (currentPosition / sequenceLength) * 100 : 0;

  return (
    <div className="mt-8 w-full max-w-[280px] mx-auto">
      <div className={cn(
        'bg-background rounded-2xl p-6 shadow-2xl',
        'border-4 border-border'
      )}>
        {/* LED Indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {['red', 'blue', 'green', 'yellow'].map((color, idx) => (
            <div
              key={color}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                gameState === 'playing' && idx === currentPosition
                  ? `bg-${color}-500 shadow-[0_0_8px_currentColor]`
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Digital Display */}
        <div className="bg-foreground/95 rounded-lg p-4 mb-3 font-mono">
          <div className="text-center mb-2">
            <div className="text-success text-3xl font-bold tracking-wider">
              {level.toString().padStart(2, '0')}
            </div>
            <div className="text-success/60 text-xs">NÍVEL</div>
          </div>
          
          <div className="border-t border-success/20 pt-2">
            <div className="text-success text-xl text-center font-bold">
              {score.toString().padStart(4, '0')}
            </div>
            <div className="text-success/60 text-xs text-center">PONTOS</div>
          </div>

          {highScore > 0 && (
            <div className="border-t border-success/20 pt-2 mt-2">
              <div className="text-warning/80 text-sm text-center">
                🏆 {highScore}
              </div>
            </div>
          )}
        </div>

        {/* Progress Ring */}
        {gameState === 'playing' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-center text-xs text-muted-foreground">
              {currentPosition}/{sequenceLength}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-3">
          <Badge 
            variant="outline" 
            className={cn(
              'w-full justify-center text-xs',
              gameState === 'showing' && 'bg-info/20 text-info border-info/50',
              gameState === 'playing' && 'bg-success/20 text-success border-success/50',
              gameState === 'idle' && 'bg-muted text-muted-foreground border-muted',
              gameState === 'gameOver' && 'bg-destructive/20 text-destructive border-destructive/50'
            )}
          >
            {gameState === 'showing' && '👀 Observe'}
            {gameState === 'playing' && '🎯 Sua vez'}
            {gameState === 'idle' && '⏸️ Aguardando'}
            {gameState === 'gameOver' && '💀 Game Over'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
