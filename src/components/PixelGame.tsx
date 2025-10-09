import { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameControls } from '@/hooks/useGameControls';
import { updatePlayerPhysics } from '@/lib/gamePhysics';
import { GameState, PlayerState, GAME_CONFIG } from '@/types/game';
import { getLevel } from '@/data/levels';

export function PixelGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentWorld: 1,
    currentStage: 1,
    player: {
      position: { x: 20, y: 250 },
      velocity: { x: 0, y: 0 },
      grounded: false,
      facing: 'right',
      animation: 'idle',
      health: 3,
      maxHealth: 3,
    },
    activeCheckpoint: null,
    score: 0,
    timeElapsed: 0,
    paused: false,
    gameOver: false,
    victory: false,
  });

  const controls = useGameControls();
  const currentLevel = getLevel(gameState.currentWorld, gameState.currentStage);

  // Update game logic
  const update = useCallback((deltaTime: number) => {
    if (!currentLevel || gameState.paused || gameState.gameOver || gameState.victory) return;

    setGameState(prev => {
      const updatedPlayer = updatePlayerPhysics(
        prev.player,
        currentLevel.platforms,
        deltaTime,
        controls
      );

      // Check victory condition
      const distToEnd = Math.abs(updatedPlayer.position.x - currentLevel.endPosition.x) +
                       Math.abs(updatedPlayer.position.y - currentLevel.endPosition.y);
      const victory = distToEnd < 30;

      return {
        ...prev,
        player: updatedPlayer,
        timeElapsed: prev.timeElapsed + deltaTime / 1000,
        victory,
      };
    });
  }, [currentLevel, controls, gameState.paused, gameState.gameOver, gameState.victory]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentLevel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = currentLevel.backgroundColor;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw platforms
    currentLevel.platforms.forEach(platform => {
      ctx.fillStyle = platform.type === 'hazard' ? '#FF6B6B' : '#8B4513';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Add platform detail
      if (platform.type === 'solid') {
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
      }
    });

    // Draw collectibles
    currentLevel.collectibles.forEach(collectible => {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(collectible.x, collectible.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw checkpoints
    currentLevel.checkpoints.forEach(checkpoint => {
      ctx.fillStyle = checkpoint.activated ? '#00FF00' : '#888888';
      ctx.fillRect(checkpoint.position.x - 8, checkpoint.position.y - 16, 16, 32);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(checkpoint.position.x - 8, checkpoint.position.y - 16, 16, 32);
    });

    // Draw end flag
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(currentLevel.endPosition.x, currentLevel.endPosition.y - 30, 4, 30);
    ctx.beginPath();
    ctx.moveTo(currentLevel.endPosition.x + 4, currentLevel.endPosition.y - 30);
    ctx.lineTo(currentLevel.endPosition.x + 24, currentLevel.endPosition.y - 20);
    ctx.lineTo(currentLevel.endPosition.x + 4, currentLevel.endPosition.y - 10);
    ctx.closePath();
    ctx.fill();

    // Draw player (simple rectangle for now)
    const player = gameState.player;
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(
      player.position.x,
      player.position.y,
      GAME_CONFIG.PLAYER_WIDTH,
      GAME_CONFIG.PLAYER_HEIGHT
    );
    
    // Player outline
    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      player.position.x,
      player.position.y,
      GAME_CONFIG.PLAYER_WIDTH,
      GAME_CONFIG.PLAYER_HEIGHT
    );

    // Draw eyes (facing direction)
    ctx.fillStyle = '#FFFFFF';
    const eyeOffset = player.facing === 'right' ? 10 : 2;
    ctx.fillRect(player.position.x + eyeOffset, player.position.y + 6, 3, 3);

    // HUD - Health
    for (let i = 0; i < player.maxHealth; i++) {
      ctx.fillStyle = i < player.health ? '#FF0000' : '#444444';
      ctx.fillRect(10 + i * 20, 10, 16, 16);
    }

    // HUD - Time
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.fillText(`Time: ${Math.floor(gameState.timeElapsed)}s`, 10, 40);

    // Victory message
    if (gameState.victory) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VITÓRIA!', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px monospace';
      ctx.fillText(
        `Tempo: ${Math.floor(gameState.timeElapsed)}s`,
        GAME_CONFIG.CANVAS_WIDTH / 2,
        GAME_CONFIG.CANVAS_HEIGHT / 2 + 30
      );
    }

    // Pause overlay
    if (gameState.paused && !gameState.victory) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSADO', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
    }

    ctx.textAlign = 'left';
  }, [gameState, currentLevel]);

  useGameLoop({ update, render }, gameState.paused);

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const resetGame = () => {
    if (!currentLevel) return;
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        position: { ...currentLevel.startPosition },
        velocity: { x: 0, y: 0 },
        grounded: false,
        animation: 'idle',
        health: 3,
      },
      timeElapsed: 0,
      score: 0,
      victory: false,
      gameOver: false,
      paused: false,
    }));
  };

  if (!currentLevel) {
    return <div>Carregando fase...</div>;
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mundo {gameState.currentWorld} - Fase {gameState.currentStage}</h2>
            <p className="text-muted-foreground">{currentLevel.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={togglePause} variant="outline" size="icon">
              {gameState.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button onClick={resetGame} variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '3/2' }}>
          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.CANVAS_WIDTH}
            height={GAME_CONFIG.CANVAS_HEIGHT}
            className="w-full h-full"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Controles:</strong></p>
          <p>← → ou A/D: Mover | ↑ ou W ou Espaço: Pular | Shift: Ação</p>
        </div>
      </div>
    </Card>
  );
}
