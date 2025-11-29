import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import { useGameSession } from '@/hooks/useGameSession';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Bomb, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { hapticsEngine } from '@/lib/haptics';

type PowerUpType = 'bomb' | 'lightning' | 'rainbow' | null;

export default function CrystalMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startSession, endSession, updateSession } = useGameSession('crystal-match', undefined, true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const gameRef = useRef<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  const [powerUps, setPowerUps] = useState({ bomb: 2, lightning: 2, rainbow: 2 });


  useEffect(() => {
    if (!error) {
      initializeGame();
    }

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, [error]);

  const initializeGame = async () => {
    if (!containerRef.current) {
      setError('Container não encontrado');
      return;
    }

    try {
      const app = new PIXI.Application();
      await app.init({
        width: Math.min(window.innerWidth - 32, 600),
        height: Math.min(window.innerHeight - 200, 800),
        backgroundColor: 0x1a1a2e,
        antialias: true,
      });

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      const game = new Game(app, {
        onStart: handleGameStart,
        onMove: handleMove,
        onScore: handleScore,
        onGameOver: handleGameOver,
        onPowerUpEarned: handlePowerUpEarned,
      });

      await game.setup();
      gameRef.current = game;
      
      game.setPowerUpCallback(usePowerUp);

      app.ticker.add((ticker) => {
        game.update(ticker.deltaTime);
      });
    } catch (error) {
      console.error('Error initializing game:', error);
      setError('Erro ao inicializar o jogo. Por favor, tente novamente.');
    }
  };

  const handleGameStart = async () => {
    setGameStarted(true);
    hapticsEngine.trigger('tap');
    await startSession();
  };

  const handleMove = async (correct: boolean) => {
    if (correct) {
      hapticsEngine.trigger('success');
    }
    
    await updateSession({
      score: gameRef.current?.score || 0,
      moves: gameRef.current?.moves || 0,
    });
  };

  const handleScore = (points: number) => {
    hapticsEngine.trigger('tap');
  };

  const handleGameOver = async (finalScore: number, totalMoves: number) => {
    hapticsEngine.trigger('achievement');
    
    await endSession({
      score: finalScore,
      accuracy: finalScore > 0 ? 100 : 0,
      timeSpent: 0,
    });

    toast.success(`Jogo finalizado! Pontuação: ${finalScore}`);
  };

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.startGame();
      setGameStarted(false);
      setPowerUps({ bomb: 2, lightning: 2, rainbow: 2 });
      setActivePowerUp(null);
    }
  };

  const handlePowerUpEarned = (type: 'bomb' | 'lightning' | 'rainbow') => {
    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
    hapticsEngine.trigger('achievement');
    toast.success(`Power-up desbloqueado: ${type === 'bomb' ? '💣 Bomba' : type === 'lightning' ? '⚡ Raio' : '🌈 Cristal Arco-Íris'}!`);
  };

  const handlePowerUpClick = (type: PowerUpType) => {
    if (!type || powerUps[type] <= 0) return;
    
    if (activePowerUp === type) {
      setActivePowerUp(null);
      toast.info('Power-up desativado');
    } else {
      setActivePowerUp(type);
      hapticsEngine.trigger('tap');
      toast.info(`Power-up ativado: ${type === 'bomb' ? '💣 Bomba' : type === 'lightning' ? '⚡ Raio' : '🌈 Cristal Arco-Íris'}`);
    }
  };

  const usePowerUp = (row: number, col: number) => {
    if (!activePowerUp || !gameRef.current) return;

    if (powerUps[activePowerUp] <= 0) {
      toast.error('Power-up esgotado!');
      setActivePowerUp(null);
      return;
    }

    gameRef.current.activatePowerUp(activePowerUp, row, col);
    setPowerUps(prev => ({ ...prev, [activePowerUp]: prev[activePowerUp] - 1 }));
    setActivePowerUp(null);
    hapticsEngine.trigger('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {gameStarted && !error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          )}
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            💎 Crystal Match
          </h1>
          <p className="text-white/70">
            Combine 3 ou mais cristais para pontuar!
          </p>
        </div>

        {/* Error State */}
        {error ? (
          <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Erro ao Carregar</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/dashboard-pais')}
                className="bg-white/10 hover:bg-white/20"
              >
                Voltar ao Dashboard
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="text-white border-white/20"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Power-ups */}
            {gameStarted && !error && (
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-500/30">
                <p className="text-white font-bold mb-3 text-center">⚡ Power-Ups</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => handlePowerUpClick('bomb')}
                    disabled={powerUps.bomb <= 0}
                    variant={activePowerUp === 'bomb' ? 'default' : 'outline'}
                    className={`flex-1 ${activePowerUp === 'bomb' ? 'bg-red-600 hover:bg-red-700' : 'bg-white/10 hover:bg-white/20'} border-2 ${activePowerUp === 'bomb' ? 'border-red-400' : 'border-white/30'}`}
                  >
                    <Bomb className="w-5 h-5 mr-2" />
                    <span className="font-bold">{powerUps.bomb}</span>
                  </Button>
                  <Button
                    onClick={() => handlePowerUpClick('lightning')}
                    disabled={powerUps.lightning <= 0}
                    variant={activePowerUp === 'lightning' ? 'default' : 'outline'}
                    className={`flex-1 ${activePowerUp === 'lightning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-white/10 hover:bg-white/20'} border-2 ${activePowerUp === 'lightning' ? 'border-yellow-400' : 'border-white/30'}`}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    <span className="font-bold">{powerUps.lightning}</span>
                  </Button>
                  <Button
                    onClick={() => handlePowerUpClick('rainbow')}
                    disabled={powerUps.rainbow <= 0}
                    variant={activePowerUp === 'rainbow' ? 'default' : 'outline'}
                    className={`flex-1 ${activePowerUp === 'rainbow' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10 hover:bg-white/20'} border-2 ${activePowerUp === 'rainbow' ? 'border-purple-400' : 'border-white/30'}`}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="font-bold">{powerUps.rainbow}</span>
                  </Button>
                </div>
                {activePowerUp && (
                  <p className="text-center text-white/80 text-xs mt-3">
                    {activePowerUp === 'bomb' && '💣 Clique em um cristal para destruir área 3x3'}
                    {activePowerUp === 'lightning' && '⚡ Clique em um cristal para destruir linha ou coluna'}
                    {activePowerUp === 'rainbow' && '🌈 Clique em um cristal para transformá-lo em coringa'}
                  </p>
                )}
              </div>
            )}

            {/* Game Instructions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 text-white/90 text-sm">
              <p className="mb-2">📋 <strong>Como jogar:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Clique em um cristal e depois em um adjacente para trocar</li>
                <li>Forme linhas de 3 ou mais cristais iguais</li>
                <li>Você tem 30 movimentos para fazer a maior pontuação</li>
                <li>Combos de 4+ cristais ganham power-ups!</li>
              </ul>
            </div>

            {/* Game Container */}
            <div className="flex justify-center items-center">
              <div
                ref={containerRef}
                className="rounded-lg overflow-hidden shadow-2xl border-4 border-purple-500/30"
              />
            </div>

            {/* Game Info */}
            <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 text-white/80 text-sm">
              <p className="text-center">
                🧠 <strong>Habilidades trabalhadas:</strong> Atenção Visual, Planejamento, Raciocínio Lógico
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Game Class
class Game {
  private app: PIXI.Application;
  private gridSize: number;
  private gemTypes: string[];
  private cellSize: number;
  private boardOffset: { x: number; y: number };
  private grid: (string | null)[][];
  private gems: (PIXI.Text | null)[][];
  private selectedGem: PIXI.Text | null;
  private movingGems: number;
  private gameState: string;
  public score: number;
  public moves: number;
  private animationSpeed: number;
  private menuContainer: PIXI.Container | null;
  private gameContainer: PIXI.Container | null;
  private uiContainer: PIXI.Container | null;
  private scoreDisplay: PIXI.Text | null;
  private selectionHighlight: PIXI.Graphics | null;
  private isCheckingForCascadingMatches: boolean;
  private comboCount: number;
  private comboDisplay: PIXI.Text | null;
  private comboContainer: PIXI.Container | null;
  private dragStartGem: PIXI.Text | null;
  private dragStartPos: { x: number; y: number } | null;
  private dragCurrentPos: { x: number; y: number } | null;
  private isDragging: boolean;
  private callbacks: {
    onStart: () => void;
    onMove: (correct: boolean) => void;
    onScore: (points: number) => void;
    onGameOver: (score: number, moves: number) => void;
    onPowerUpEarned: (type: 'bomb' | 'lightning' | 'rainbow') => void;
  };
  private usePowerUpCallback: ((row: number, col: number) => void) | null;

  constructor(app: PIXI.Application, callbacks: any) {
    this.app = app;
    this.gridSize = 8;
    this.gemTypes = ['🔴', '🔵', '🟢', '🟡', '🟣'];
    this.cellSize = 60;
    this.boardOffset = { x: 0, y: 0 };
    this.grid = [];
    this.gems = [];
    this.selectedGem = null;
    this.movingGems = 0;
    this.gameState = 'MENU';
    this.score = 0;
    this.moves = 30;
    this.animationSpeed = 0.15;
    this.menuContainer = null;
    this.gameContainer = null;
    this.uiContainer = null;
    this.scoreDisplay = null;
    this.selectionHighlight = null;
    this.isCheckingForCascadingMatches = false;
    this.callbacks = callbacks;
    this.usePowerUpCallback = null;
    this.comboCount = 0;
    this.comboDisplay = null;
    this.comboContainer = null;
    this.dragStartGem = null;
    this.dragStartPos = null;
    this.dragCurrentPos = null;
    this.isDragging = false;
  }

  setPowerUpCallback(callback: (row: number, col: number) => void) {
    this.usePowerUpCallback = callback;
  }

  activatePowerUp(type: 'bomb' | 'lightning' | 'rainbow', row: number, col: number) {
    if (type === 'bomb') {
      this.activateBomb(row, col);
    } else if (type === 'lightning') {
      this.activateLightning(row, col);
    } else if (type === 'rainbow') {
      this.activateRainbow(row, col);
    }
  }

  activateBomb(row: number, col: number) {
    const matches: Array<{ row: number; col: number }> = [];
    
    for (let r = Math.max(0, row - 1); r <= Math.min(this.gridSize - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(this.gridSize - 1, col + 1); c++) {
        if (this.grid[r][c]) {
          matches.push({ row: r, col: c });
        }
      }
    }

    // Efeito visual de explosão
    this.createBombEffect(row, col);

    if (matches.length > 0) {
      this.score += matches.length * 20;
      this.updateUI();
      this.callbacks.onScore(matches.length * 20);
      this.matchesFound(matches);
    }
  }

  createBombEffect(row: number, col: number) {
    const centerX = this.boardOffset.x + col * this.cellSize + this.cellSize / 2;
    const centerY = this.boardOffset.y + row * this.cellSize + this.cellSize / 2;

    // Criar múltiplas partículas de explosão
    for (let i = 0; i < 20; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xff4500 + Math.random() * 0x00aa00); // Tons de laranja/vermelho
      particle.drawCircle(0, 0, 3 + Math.random() * 5);
      particle.endFill();
      
      particle.x = centerX;
      particle.y = centerY;
      
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 3 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.gameContainer!.addChild(particle);

      let life = 1.0;
      const animateParticle = () => {
        particle.x += vx;
        particle.y += vy;
        life -= 0.03;
        particle.alpha = life;
        particle.scale.set(life);

        if (life > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          this.gameContainer!.removeChild(particle);
        }
      };
      animateParticle();
    }

    // Onda de choque
    const shockwave = new PIXI.Graphics();
    shockwave.lineStyle(4, 0xff6600);
    shockwave.drawCircle(0, 0, 10);
    shockwave.x = centerX;
    shockwave.y = centerY;
    this.gameContainer!.addChild(shockwave);

    let radius = 10;
    const animateShockwave = () => {
      radius += 8;
      shockwave.alpha -= 0.08;
      shockwave.clear();
      shockwave.lineStyle(4, 0xff6600);
      shockwave.drawCircle(0, 0, radius);

      if (shockwave.alpha > 0) {
        requestAnimationFrame(animateShockwave);
      } else {
        this.gameContainer!.removeChild(shockwave);
      }
    };
    animateShockwave();
  }

  activateLightning(row: number, col: number) {
    const matches: Array<{ row: number; col: number }> = [];
    
    const rowCount = this.grid[row].filter(cell => cell !== null).length;
    const colCount = this.grid.filter(r => r[col] !== null).length;

    const isHorizontal = rowCount >= colCount;

    if (isHorizontal) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[row][c]) {
          matches.push({ row, col: c });
        }
      }
    } else {
      for (let r = 0; r < this.gridSize; r++) {
        if (this.grid[r][col]) {
          matches.push({ row: r, col });
        }
      }
    }

    // Efeito visual de raio
    this.createLightningEffect(row, col, isHorizontal);

    if (matches.length > 0) {
      this.score += matches.length * 15;
      this.updateUI();
      this.callbacks.onScore(matches.length * 15);
      this.matchesFound(matches);
    }
  }

  createLightningEffect(row: number, col: number, isHorizontal: boolean) {
    const startX = this.boardOffset.x + (isHorizontal ? 0 : col * this.cellSize + this.cellSize / 2);
    const startY = this.boardOffset.y + (isHorizontal ? row * this.cellSize + this.cellSize / 2 : 0);
    const endX = this.boardOffset.x + (isHorizontal ? this.gridSize * this.cellSize : col * this.cellSize + this.cellSize / 2);
    const endY = this.boardOffset.y + (isHorizontal ? row * this.cellSize + this.cellSize / 2 : this.gridSize * this.cellSize);

    // Raio principal
    const lightning = new PIXI.Graphics();
    lightning.lineStyle(6, 0xffff00);
    lightning.moveTo(startX, startY);
    
    if (isHorizontal) {
      let currentX = startX;
      const segments = 8;
      const segmentLength = (endX - startX) / segments;
      
      for (let i = 0; i < segments; i++) {
        currentX += segmentLength;
        const offsetY = startY + (Math.random() - 0.5) * 20;
        lightning.lineTo(currentX, offsetY);
      }
    } else {
      let currentY = startY;
      const segments = 8;
      const segmentLength = (endY - startY) / segments;
      
      for (let i = 0; i < segments; i++) {
        currentY += segmentLength;
        const offsetX = startX + (Math.random() - 0.5) * 20;
        lightning.lineTo(offsetX, currentY);
      }
    }
    
    this.gameContainer!.addChild(lightning);

    // Brilhos ao longo do raio
    for (let i = 0; i < 10; i++) {
      const sparkle = new PIXI.Graphics();
      sparkle.beginFill(0xffffff);
      sparkle.drawStar(0, 0, 4, 8, 3);
      sparkle.endFill();
      
      if (isHorizontal) {
        sparkle.x = startX + Math.random() * (endX - startX);
        sparkle.y = startY + (Math.random() - 0.5) * 30;
      } else {
        sparkle.x = startX + (Math.random() - 0.5) * 30;
        sparkle.y = startY + Math.random() * (endY - startY);
      }
      
      this.gameContainer!.addChild(sparkle);

      let rotation = 0;
      let alpha = 1;
      const animateSparkle = () => {
        rotation += 0.2;
        alpha -= 0.05;
        sparkle.rotation = rotation;
        sparkle.alpha = alpha;

        if (alpha > 0) {
          requestAnimationFrame(animateSparkle);
        } else {
          this.gameContainer!.removeChild(sparkle);
        }
      };
      animateSparkle();
    }

    // Fade do raio
    let alpha = 1;
    const fadeLightning = () => {
      alpha -= 0.1;
      lightning.alpha = alpha;

      if (alpha > 0) {
        requestAnimationFrame(fadeLightning);
      } else {
        this.gameContainer!.removeChild(lightning);
      }
    };
    fadeLightning();
  }

  activateRainbow(row: number, col: number) {
    const gem = this.gems[row][col];
    if (!gem) return;

    // Efeito visual de arco-íris
    this.createRainbowEffect(row, col);

    const rainbowType = '🌈';
    (gem as any).userData.type = rainbowType;
    (gem as any).userData.isRainbow = true;
    gem.text = rainbowType;
    this.grid[row][col] = rainbowType;

    setTimeout(() => {
      const matches = this.findRainbowMatches(row, col);
      if (matches.length > 0) {
        this.matchesFound(matches);
      }
    }, 800);
  }

  createRainbowEffect(row: number, col: number) {
    const centerX = this.boardOffset.x + col * this.cellSize + this.cellSize / 2;
    const centerY = this.boardOffset.y + row * this.cellSize + this.cellSize / 2;
    
    const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

    // Círculos expansivos coloridos
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const circle = new PIXI.Graphics();
        circle.lineStyle(3, rainbowColors[i % rainbowColors.length]);
        circle.drawCircle(0, 0, 10);
        circle.x = centerX;
        circle.y = centerY;
        this.gameContainer!.addChild(circle);

        let radius = 10;
        let alpha = 1;
        const animateCircle = () => {
          radius += 6;
          alpha -= 0.04;
          circle.alpha = alpha;
          circle.clear();
          circle.lineStyle(3, rainbowColors[i % rainbowColors.length]);
          circle.drawCircle(0, 0, radius);

          if (alpha > 0) {
            requestAnimationFrame(animateCircle);
          } else {
            this.gameContainer!.removeChild(circle);
          }
        };
        animateCircle();
      }, i * 100);
    }

    // Partículas de brilho coloridas
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const sparkle = new PIXI.Graphics();
        sparkle.beginFill(rainbowColors[i % rainbowColors.length]);
        sparkle.drawStar(0, 0, 5, 10, 4);
        sparkle.endFill();
        
        sparkle.x = centerX;
        sparkle.y = centerY;
        
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        this.gameContainer!.addChild(sparkle);

        let life = 1.0;
        let rotation = 0;
        const animateSparkle = () => {
          sparkle.x += vx;
          sparkle.y += vy;
          rotation += 0.1;
          life -= 0.02;
          sparkle.rotation = rotation;
          sparkle.alpha = life;
          sparkle.scale.set(life * 1.5);

          if (life > 0) {
            requestAnimationFrame(animateSparkle);
          } else {
            this.gameContainer!.removeChild(sparkle);
          }
        };
        animateSparkle();
      }, i * 20);
    }

    // Pulso de luz central
    const glow = new PIXI.Graphics();
    glow.beginFill(0xffffff, 0.6);
    glow.drawCircle(0, 0, this.cellSize / 2);
    glow.endFill();
    glow.x = centerX;
    glow.y = centerY;
    this.gameContainer!.addChild(glow);

    let scale = 1;
    let alpha = 0.6;
    const animateGlow = () => {
      scale += 0.1;
      alpha -= 0.04;
      glow.scale.set(scale);
      glow.alpha = alpha;

      if (alpha > 0) {
        requestAnimationFrame(animateGlow);
      } else {
        this.gameContainer!.removeChild(glow);
      }
    };
    animateGlow();
  }

  findRainbowMatches(row: number, col: number): Array<{ row: number; col: number }> {
    const matches: Array<{ row: number; col: number }> = [];
    const targetType = this.findMostCommonAdjacentType(row, col);
    
    if (!targetType) return matches;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[r][c] === targetType || this.grid[r][c] === '🌈') {
          matches.push({ row: r, col: c });
        }
      }
    }

    return matches;
  }

  findMostCommonAdjacentType(row: number, col: number): string | null {
    const adjacent = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    const typeCounts: Record<string, number> = {};
    
    adjacent.forEach(({ r, c }) => {
      if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
        const type = this.grid[r][c];
        if (type && type !== '🌈') {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      }
    });

    let maxCount = 0;
    let mostCommon = null;
    
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    }

    return mostCommon;
  }

  async setup() {
    this.createBackground();
    this.createMenu();
  }

  createBackground() {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1a2e);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    this.app.stage.addChild(bg);
  }

  createMenu() {
    this.menuContainer = new PIXI.Container();
    
    const title = new PIXI.Text('Crystal Match', {
      fontSize: 48,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    title.anchor.set(0.5);
    title.x = this.app.screen.width / 2;
    title.y = this.app.screen.height / 2 - 100;

    const startButton = new PIXI.Text('COMEÇAR', {
      fontSize: 32,
      fill: 0xffff00,
      fontWeight: 'bold',
    });
    startButton.anchor.set(0.5);
    startButton.x = this.app.screen.width / 2;
    startButton.y = this.app.screen.height / 2 + 50;
    startButton.eventMode = 'static';
    startButton.cursor = 'pointer';
    
    startButton.on('pointerdown', () => this.startGame());
    startButton.on('pointerover', () => {
      startButton.style.fill = 0xffffff;
      startButton.scale.set(1.1);
    });
    startButton.on('pointerout', () => {
      startButton.style.fill = 0xffff00;
      startButton.scale.set(1);
    });

    this.menuContainer.addChild(title);
    this.menuContainer.addChild(startButton);
    this.app.stage.addChild(this.menuContainer);
  }

  startGame() {
    if (this.menuContainer) {
      this.app.stage.removeChild(this.menuContainer);
      this.menuContainer = null;
    }
    if (this.gameContainer) {
      this.app.stage.removeChild(this.gameContainer);
    }

    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);

    this.score = 0;
    this.moves = 30;
    this.grid = [];
    this.gems = [];
    this.selectedGem = null;
    this.comboCount = 0;
    this.boardOffset.x = (this.app.screen.width - this.gridSize * this.cellSize) / 2;
    this.boardOffset.y = 120;

    this.createBoard();
    this.createUI();
    this.gameState = 'PLAYING';
    
    this.callbacks.onStart();
  }

  createBoard() {
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      this.gems[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.createGem(row, col);
      }
    }

    while (this.findMatches().length > 0) {
      this.removeMatches(this.findMatches());
      this.fillBoard();
    }
  }

  createGem(row: number, col: number, gemType: string | null = null) {
    if (!gemType) {
      const types = this.gemTypes.filter(type => !this.causesMatch(row, col, type));
      gemType = types.length > 0 ? types[Math.floor(Math.random() * types.length)] : this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
    }

    const gem = new PIXI.Text(gemType, {
      fontSize: 40,
    });
    gem.anchor.set(0.5);
    gem.x = this.boardOffset.x + col * this.cellSize + this.cellSize / 2;
    gem.y = this.boardOffset.y + row * this.cellSize + this.cellSize / 2;
    
    (gem as any).userData = {
      row: row,
      col: col,
      type: gemType,
      isMatched: false,
      targetY: gem.y,
      falling: false,
    };

    this.gems[row][col] = gem;
    this.grid[row][col] = gemType;
    this.gameContainer!.addChild(gem);

    gem.eventMode = 'static';
    gem.cursor = 'pointer';
    gem.on('pointerdown', (e) => this.onGemPointerDown(gem, e));
    gem.on('pointermove', (e) => this.onGemPointerMove(gem, e));
    gem.on('pointerup', () => this.onGemPointerUp(gem));
    gem.on('pointerupoutside', () => this.onGemPointerUp(gem));

    return gem;
  }

  fillBoard() {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (!this.grid[row][col]) {
          const types = this.gemTypes.filter(type => !this.causesMatch(row, col, type));
          const gemType = types.length > 0 ? types[Math.floor(Math.random() * types.length)] : this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
          this.grid[row][col] = gemType;
          if (!this.gems[row][col]) {
            this.createGem(row, col, gemType);
          }
        }
      }
    }
  }

  causesMatch(row: number, col: number, type: string): boolean {
    let hCount = 1;
    let vCount = 1;

    for (let i = col - 1; i >= 0 && this.grid[row][i] === type; i--) hCount++;
    for (let i = col + 1; i < this.gridSize && this.grid[row][i] === type; i++) hCount++;
    for (let i = row - 1; i >= 0 && this.grid[i] && this.grid[i][col] === type; i--) vCount++;
    for (let i = row + 1; i < this.gridSize && this.grid[i] && this.grid[i][col] === type; i++) vCount++;

    return hCount >= 3 || vCount >= 3;
  }

  onGemPointerDown(gem: PIXI.Text, event: any) {
    if (this.gameState !== 'PLAYING' || this.movingGems > 0) return;

    const userData = (gem as any).userData;

    if (this.usePowerUpCallback) {
      this.usePowerUpCallback(userData.row, userData.col);
      return;
    }

    // Iniciar drag
    this.dragStartGem = gem;
    this.dragStartPos = { x: event.global.x, y: event.global.y };
    this.isDragging = false;

    // Mostrar seleção visual
    this.showSelection(gem, true);
  }

  onGemPointerMove(gem: PIXI.Text, event: any) {
    if (!this.dragStartGem || !this.dragStartPos) return;
    if (this.gameState !== 'PLAYING' || this.movingGems > 0) return;

    const currentPos = { x: event.global.x, y: event.global.y };
    this.dragCurrentPos = currentPos;
    
    const deltaX = currentPos.x - this.dragStartPos.x;
    const deltaY = currentPos.y - this.dragStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Se moveu mais de 20 pixels, considera como drag
    if (distance > 20) {
      this.isDragging = true;
    }
  }

  onGemPointerUp(gem: PIXI.Text) {
    if (!this.dragStartGem || !this.dragStartPos) return;
    if (this.gameState !== 'PLAYING' || this.movingGems > 0) return;

    const userData = (gem as any).userData;

    if (this.isDragging && this.dragCurrentPos) {
      // Calcular direção do swipe usando posição salva
      const deltaX = this.dragCurrentPos.x - this.dragStartPos.x;
      const deltaY = this.dragCurrentPos.y - this.dragStartPos.y;

      // Determinar direção predominante
      let targetRow = (this.dragStartGem as any).userData.row;
      let targetCol = (this.dragStartGem as any).userData.col;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Movimento horizontal
        targetCol += deltaX > 0 ? 1 : -1;
      } else {
        // Movimento vertical
        targetRow += deltaY > 0 ? 1 : -1;
      }

      // Verificar se posição é válida
      if (targetRow >= 0 && targetRow < this.gridSize && 
          targetCol >= 0 && targetCol < this.gridSize) {
        const targetGem = this.gems[targetRow][targetCol];
        if (targetGem) {
          this.swapGems(this.dragStartGem, targetGem);
          this.showSelection(this.dragStartGem, false);
          this.selectedGem = null;
        }
      }
    } else {
      // Click simples - usar lógica antiga de seleção
      if (!this.selectedGem || this.selectedGem !== this.dragStartGem) {
        this.selectedGem = this.dragStartGem;
        this.showSelection(this.dragStartGem, true);
      } else if (this.selectedGem === this.dragStartGem) {
        this.showSelection(this.dragStartGem, false);
        this.selectedGem = null;
      }
    }

    // Reset drag state
    this.dragStartGem = null;
    this.dragStartPos = null;
    this.dragCurrentPos = null;
    this.isDragging = false;
  }

  showSelection(gem: PIXI.Text, show: boolean) {
    if (!this.selectionHighlight) {
      this.selectionHighlight = new PIXI.Graphics();
      this.selectionHighlight.lineStyle(3, 0xffff00);
      this.selectionHighlight.drawCircle(0, 0, this.cellSize * 0.4);
      this.gameContainer!.addChild(this.selectionHighlight);
    }

    if (show) {
      this.selectionHighlight.position.set(gem.x, gem.y);
      this.selectionHighlight.visible = true;
      this.selectedGem = gem;
    } else {
      this.selectionHighlight.visible = false;
      this.selectedGem = null;
    }
  }

  areAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  swapGems(gem1: PIXI.Text, gem2: PIXI.Text) {
    this.movingGems++;

    const tempRow = (gem1 as any).userData.row;
    const tempCol = (gem1 as any).userData.col;
    const x1 = gem1.x;
    const y1 = gem1.y;
    const x2 = gem2.x;
    const y2 = gem2.y;

    this.gems[(gem1 as any).userData.row][(gem1 as any).userData.col] = gem2;
    this.gems[(gem2 as any).userData.row][(gem2 as any).userData.col] = gem1;

    (gem1 as any).userData.row = (gem2 as any).userData.row;
    (gem1 as any).userData.col = (gem2 as any).userData.col;
    (gem2 as any).userData.row = tempRow;
    (gem2 as any).userData.col = tempCol;

    this.grid[(gem1 as any).userData.row][(gem1 as any).userData.col] = (gem1 as any).userData.type;
    this.grid[(gem2 as any).userData.row][(gem2 as any).userData.col] = (gem2 as any).userData.type;

    const animate = () => {
      gem1.x += (x2 - gem1.x) * 0.3;
      gem1.y += (y2 - gem1.y) * 0.3;
      gem2.x += (x1 - gem2.x) * 0.3;
      gem2.y += (y1 - gem2.y) * 0.3;

      if (Math.abs(gem1.x - x2) > 1 || Math.abs(gem1.y - y2) > 1) {
        requestAnimationFrame(animate);
      } else {
        gem1.position.set(x2, y2);
        gem2.position.set(x1, y1);

        const matches = this.findMatches();
        if (matches.length > 0) {
          this.moves--;
          this.updateUI();
          this.callbacks.onMove(true);
          // Resetar combo em nova jogada manual
          if (this.comboCount > 0) {
            this.resetCombo();
          }
          this.matchesFound(matches);
        } else {
          this.callbacks.onMove(false);
          this.swapBack(gem1, gem2, x1, y1, x2, y2);
        }
      }
    };
    animate();
  }

  swapBack(gem1: PIXI.Text, gem2: PIXI.Text, x1: number, y1: number, x2: number, y2: number) {
    const tempRow = (gem1 as any).userData.row;
    const tempCol = (gem1 as any).userData.col;

    this.gems[(gem1 as any).userData.row][(gem1 as any).userData.col] = gem2;
    this.gems[(gem2 as any).userData.row][(gem2 as any).userData.col] = gem1;

    (gem1 as any).userData.row = (gem2 as any).userData.row;
    (gem1 as any).userData.col = (gem2 as any).userData.col;
    (gem2 as any).userData.row = tempRow;
    (gem2 as any).userData.col = tempCol;

    this.grid[(gem1 as any).userData.row][(gem1 as any).userData.col] = (gem1 as any).userData.type;
    this.grid[(gem2 as any).userData.row][(gem2 as any).userData.col] = (gem2 as any).userData.type;

    const animate = () => {
      gem1.x += (x1 - gem1.x) * 0.3;
      gem1.y += (y1 - gem1.y) * 0.3;
      gem2.x += (x2 - gem2.x) * 0.3;
      gem2.y += (y2 - gem2.y) * 0.3;

      if (Math.abs(gem1.x - x1) > 1 || Math.abs(gem1.y - y1) > 1) {
        requestAnimationFrame(animate);
      } else {
        gem1.position.set(x1, y1);
        gem2.position.set(x2, y2);
        this.movingGems--;
      }
    };
    animate();
  }

  findMatches() {
    const matches: Array<{ row: number; col: number }> = [];

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col]) {
          const hMatch = this.checkHorizontalMatch(row, col);
          if (hMatch.length >= 3) {
            matches.push(...hMatch);
          }

          const vMatch = this.checkVerticalMatch(row, col);
          if (vMatch.length >= 3) {
            const newMatches = vMatch.filter(v => 
              !matches.some(m => m.row === v.row && m.col === v.col)
            );
            matches.push(...newMatches);
          }
        }
      }
    }

    return matches;
  }

  checkHorizontalMatch(row: number, col: number) {
    const type = this.grid[row][col];
    const match: Array<{ row: number; col: number }> = [];
    
    for (let c = col; c < this.gridSize && this.grid[row][c] === type; c++) {
      match.push({ row, col: c });
    }
    
    return match;
  }

  checkVerticalMatch(row: number, col: number) {
    const type = this.grid[row][col];
    const match: Array<{ row: number; col: number }> = [];
    
    for (let r = row; r < this.gridSize && this.grid[r] && this.grid[r][col] === type; r++) {
      match.push({ row: r, col });
    }
    
    return match;
  }

  matchesFound(matches: Array<{ row: number; col: number }>) {
    // Incrementar combo
    this.comboCount++;
    
    // Calcular multiplicador baseado no combo
    const comboMultiplier = Math.min(this.comboCount, 10); // Máximo 10x
    const basePoints = matches.length * 10;
    const points = basePoints * comboMultiplier;
    
    this.score += points;
    this.updateUI();
    this.callbacks.onScore(points);
    
    // Mostrar combo visual
    if (this.comboCount > 1) {
      this.showComboDisplay();
    }
    
    this.updateMatches(matches);

    if (matches.length >= 4 && matches.length < 6) {
      const powerUpTypes: ('bomb' | 'lightning' | 'rainbow')[] = ['bomb', 'lightning', 'rainbow'];
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      this.callbacks.onPowerUpEarned(randomPowerUp);
    } else if (matches.length >= 6) {
      this.callbacks.onPowerUpEarned('rainbow');
    }

    if (this.selectionHighlight) {
      this.selectionHighlight.visible = false;
      this.selectedGem = null;
    }

    setTimeout(() => {
      this.removeMatches(matches);
      setTimeout(() => {
        this.dropGems();
      }, 300);
    }, 600);
  }

  showComboDisplay() {
    // Remover combo display anterior se existir
    if (this.comboContainer) {
      this.app.stage.removeChild(this.comboContainer);
    }

    this.comboContainer = new PIXI.Container();
    
    // Fundo do combo
    const comboBg = new PIXI.Graphics();
    comboBg.beginFill(0x000000, 0.7);
    comboBg.drawRoundedRect(-120, -40, 240, 80, 15);
    comboBg.endFill();
    
    // Borda brilhante
    const border = new PIXI.Graphics();
    const borderColor = this.comboCount >= 5 ? 0xff00ff : this.comboCount >= 3 ? 0xffd700 : 0x00ffff;
    border.lineStyle(4, borderColor);
    border.drawRoundedRect(-120, -40, 240, 80, 15);
    
    // Texto COMBO
    const comboLabel = new PIXI.Text('COMBO', {
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    comboLabel.anchor.set(0.5);
    comboLabel.y = -15;
    
    // Número do combo
    const comboNumber = new PIXI.Text(`x${this.comboCount}`, {
      fontSize: 36,
      fill: borderColor,
      fontWeight: 'bold',
      stroke: 0x000000,
    });
    comboNumber.anchor.set(0.5);
    comboNumber.y = 15;
    
    this.comboContainer.addChild(comboBg);
    this.comboContainer.addChild(border);
    this.comboContainer.addChild(comboLabel);
    this.comboContainer.addChild(comboNumber);
    
    // Posicionar no centro superior da tela
    this.comboContainer.x = this.app.screen.width / 2;
    this.comboContainer.y = 80;
    
    this.app.stage.addChild(this.comboContainer);
    
    // Criar efeitos de partículas ao redor do combo
    this.createComboParticles();
    
    // Animação de entrada
    this.comboContainer.scale.set(0);
    let scale = 0;
    const animateIn = () => {
      scale += 0.15;
      if (scale > 1.2) scale = 1.2;
      this.comboContainer!.scale.set(scale);
      
      if (scale < 1.2) {
        requestAnimationFrame(animateIn);
      } else {
        // Bounce back
        let bounceScale = 1.2;
        const bounce = () => {
          bounceScale -= 0.05;
          if (bounceScale < 1) bounceScale = 1;
          this.comboContainer!.scale.set(bounceScale);
          
          if (bounceScale > 1) {
            requestAnimationFrame(bounce);
          }
        };
        bounce();
      }
    };
    animateIn();
  }

  createComboParticles() {
    if (!this.comboContainer) return;
    
    const centerX = this.comboContainer.x;
    const centerY = this.comboContainer.y;
    const particleColor = this.comboCount >= 5 ? 0xff00ff : this.comboCount >= 3 ? 0xffd700 : 0x00ffff;
    
    for (let i = 0; i < 16; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(particleColor);
      particle.drawStar(0, 0, 4, 6, 3);
      particle.endFill();
      
      const angle = (Math.PI * 2 * i) / 16;
      const radius = 80;
      particle.x = centerX + Math.cos(angle) * radius;
      particle.y = centerY + Math.sin(angle) * radius;
      
      this.app.stage.addChild(particle);
      
      let life = 1.0;
      let rotation = 0;
      const animateParticle = () => {
        rotation += 0.2;
        life -= 0.03;
        particle.rotation = rotation;
        particle.alpha = life;
        particle.scale.set(life * 1.5);
        
        if (life > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          this.app.stage.removeChild(particle);
        }
      };
      animateParticle();
    }
  }

  resetCombo() {
    this.comboCount = 0;
    
    // Fade out do combo display
    if (this.comboContainer) {
      let alpha = 1;
      let scale = 1;
      const fadeOut = () => {
        alpha -= 0.05;
        scale += 0.05;
        this.comboContainer!.alpha = alpha;
        this.comboContainer!.scale.set(scale);
        
        if (alpha > 0) {
          requestAnimationFrame(fadeOut);
        } else {
          this.app.stage.removeChild(this.comboContainer!);
          this.comboContainer = null;
        }
      };
      fadeOut();
    }
  }

  updateMatches(matches: Array<{ row: number; col: number }>) {
    matches.forEach(match => {
      const gem = this.gems[match.row][match.col];
      if (gem) {
        (gem as any).userData.isMatched = true;
        
        // Criar efeito de brilho e dissolução
        this.createMatchGlowEffect(match.row, match.col, gem);
        
        // Animação de pulso e fade
        let scale = 1;
        let alpha = 1;
        let pulseDirection = 1;
        let pulseCount = 0;
        
        const animateMatch = () => {
          // Pulsar 3 vezes
          if (pulseCount < 6) {
            scale += 0.05 * pulseDirection;
            if (scale >= 1.3) pulseDirection = -1;
            if (scale <= 1 && pulseDirection === -1) {
              pulseDirection = 1;
              pulseCount++;
            }
            gem.scale.set(scale);
          } else {
            // Depois do pulso, iniciar dissolução
            scale -= 0.05;
            alpha -= 0.08;
            gem.scale.set(scale);
            gem.alpha = alpha;
          }

          if (pulseCount < 6 || alpha > 0) {
            requestAnimationFrame(animateMatch);
          }
        };
        animateMatch();
      }
    });
  }

  createMatchGlowEffect(row: number, col: number, gem: PIXI.Text) {
    const centerX = gem.x;
    const centerY = gem.y;

    // Halo de brilho
    const glow = new PIXI.Graphics();
    glow.beginFill(0xffffff, 0.4);
    glow.drawCircle(0, 0, this.cellSize * 0.6);
    glow.endFill();
    glow.x = centerX;
    glow.y = centerY;
    this.gameContainer!.addChild(glow);

    let glowScale = 0.5;
    let glowAlpha = 0.6;
    const animateGlow = () => {
      glowScale += 0.08;
      glowAlpha -= 0.04;
      glow.scale.set(glowScale);
      glow.alpha = glowAlpha;

      if (glowAlpha > 0) {
        requestAnimationFrame(animateGlow);
      } else {
        this.gameContainer!.removeChild(glow);
      }
    };
    animateGlow();

    // Partículas de brilho
    const gemType = (gem as any).userData.type;
    const gemColor = this.getGemColor(gemType);
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = new PIXI.Graphics();
        sparkle.beginFill(gemColor);
        sparkle.drawStar(0, 0, 4, 8, 3);
        sparkle.endFill();
        
        sparkle.x = centerX;
        sparkle.y = centerY;
        
        const angle = (Math.PI * 2 * i) / 8;
        const speed = 1 + Math.random() * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        this.gameContainer!.addChild(sparkle);

        let life = 1.0;
        let rotation = 0;
        const animateSparkle = () => {
          sparkle.x += vx;
          sparkle.y += vy;
          rotation += 0.15;
          life -= 0.04;
          sparkle.rotation = rotation;
          sparkle.alpha = life;

          if (life > 0) {
            requestAnimationFrame(animateSparkle);
          } else {
            this.gameContainer!.removeChild(sparkle);
          }
        };
        animateSparkle();
      }, i * 30);
    }

    // Rastro de luz
    const trail = new PIXI.Graphics();
    trail.lineStyle(2, gemColor, 0.8);
    trail.drawCircle(0, 0, this.cellSize * 0.4);
    trail.x = centerX;
    trail.y = centerY;
    this.gameContainer!.addChild(trail);

    let trailScale = 1;
    let trailAlpha = 0.8;
    const animateTrail = () => {
      trailScale += 0.06;
      trailAlpha -= 0.06;
      trail.scale.set(trailScale);
      trail.alpha = trailAlpha;

      if (trailAlpha > 0) {
        requestAnimationFrame(animateTrail);
      } else {
        this.gameContainer!.removeChild(trail);
      }
    };
    animateTrail();
  }

  getGemColor(gemType: string): number {
    const colorMap: Record<string, number> = {
      '🔴': 0xff0000,
      '🔵': 0x0000ff,
      '🟢': 0x00ff00,
      '🟡': 0xffff00,
      '🟣': 0x9400d3,
      '🌈': 0xff69b4,
    };
    return colorMap[gemType] || 0xffffff;
  }

  removeMatches(matches: Array<{ row: number; col: number }>) {
    matches.forEach(match => {
      const gem = this.gems[match.row][match.col];
      if (gem) {
        // Efeito final de desaparecimento com estrelas
        this.createDissolveEffect(gem);
        
        this.gameContainer!.removeChild(gem);
        this.gems[match.row][match.col] = null;
      }
      this.grid[match.row][match.col] = null;
    });
  }

  createDissolveEffect(gem: PIXI.Text) {
    const centerX = gem.x;
    const centerY = gem.y;
    const gemType = (gem as any).userData.type;
    const gemColor = this.getGemColor(gemType);

    // Explosão de micro-partículas na dissolução
    for (let i = 0; i < 12; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(gemColor);
      particle.drawCircle(0, 0, 2 + Math.random() * 3);
      particle.endFill();
      
      particle.x = centerX + (Math.random() - 0.5) * 15;
      particle.y = centerY + (Math.random() - 0.5) * 15;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.gameContainer!.addChild(particle);

      let life = 1.0;
      const animateParticle = () => {
        particle.x += vx;
        particle.y += vy + 0.5; // Gravidade
        life -= 0.05;
        particle.alpha = life;

        if (life > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          this.gameContainer!.removeChild(particle);
        }
      };
      animateParticle();
    }

    // Flash de luz final
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.8);
    flash.drawStar(0, 0, 6, this.cellSize * 0.5, this.cellSize * 0.3);
    flash.endFill();
    flash.x = centerX;
    flash.y = centerY;
    this.gameContainer!.addChild(flash);

    let flashAlpha = 0.8;
    let flashRotation = 0;
    const animateFlash = () => {
      flashRotation += 0.2;
      flashAlpha -= 0.1;
      flash.rotation = flashRotation;
      flash.alpha = flashAlpha;

      if (flashAlpha > 0) {
        requestAnimationFrame(animateFlash);
      } else {
        this.gameContainer!.removeChild(flash);
      }
    };
    animateFlash();
  }

  dropGems() {
    let gemsMoved = false;

    for (let col = 0; col < this.gridSize; col++) {
      let emptyRow = this.gridSize - 1;
      
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (this.grid[row][col] !== null) {
          if (row !== emptyRow) {
            const gem = this.gems[row][col];
            if (gem) {
              this.gems[emptyRow][col] = gem;
              this.gems[row][col] = null;
              this.grid[emptyRow][col] = this.grid[row][col];
              this.grid[row][col] = null;
              (gem as any).userData.row = emptyRow;
              (gem as any).userData.falling = true;
              (gem as any).userData.targetY = this.boardOffset.y + emptyRow * this.cellSize + this.cellSize / 2;
              gemsMoved = true;
            }
          }
          emptyRow--;
        }
      }

      for (let row = emptyRow; row >= 0; row--) {
        const newGem = this.createGem(row, col);
        newGem.y = this.boardOffset.y - (emptyRow - row + 1) * this.cellSize;
        (newGem as any).userData.falling = true;
        (newGem as any).userData.targetY = this.boardOffset.y + row * this.cellSize + this.cellSize / 2;
        gemsMoved = true;
      }
    }

    if (gemsMoved) {
      this.movingGems++;
    }
    this.isCheckingForCascadingMatches = true;
  }

  createUI() {
    this.uiContainer = new PIXI.Container();

    const scoreText = new PIXI.Text(`Score: 0 | Moves: 30`, {
      fontSize: 32,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    scoreText.anchor.set(0.5);
    scoreText.x = this.app.screen.width / 2;
    scoreText.y = 40;

    this.scoreDisplay = scoreText;
    this.uiContainer.addChild(scoreText);
    this.app.stage.addChild(this.uiContainer);
  }

  updateUI() {
    if (this.scoreDisplay) {
      this.scoreDisplay.text = `Score: ${this.score} | Moves: ${this.moves}`;
    }

    if (this.moves <= 0 && this.gameState === 'PLAYING') {
      this.gameOver();
    }
  }

  gameOver() {
    this.gameState = 'GAME_OVER';
    this.callbacks.onGameOver(this.score, 30 - this.moves);

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();

    const gameOverText = new PIXI.Text('Game Over!', {
      fontSize: 64,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    gameOverText.anchor.set(0.5);
    gameOverText.x = this.app.screen.width / 2;
    gameOverText.y = 200;

    const scoreText = new PIXI.Text(`Final Score: ${this.score}`, {
      fontSize: 36,
      fill: 0xffff00,
      fontWeight: 'bold',
    });
    scoreText.anchor.set(0.5);
    scoreText.x = this.app.screen.width / 2;
    scoreText.y = 300;

    const container = new PIXI.Container();
    container.addChild(overlay);
    container.addChild(gameOverText);
    container.addChild(scoreText);
    this.app.stage.addChild(container);
  }

  update(delta: number) {
    if (this.gameState !== 'PLAYING') return;

    const gemsAreMoving = this.hasMovingGems();

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const gem = this.gems[row][col];
        if (gem && (gem as any).userData.falling) {
          const currentY = gem.y;
          const targetY = (gem as any).userData.targetY;
          const diffY = targetY - currentY;

          if (Math.abs(diffY) > 1) {
            gem.y += diffY * this.animationSpeed * delta;
          } else {
            gem.y = targetY;
            (gem as any).userData.falling = false;
            this.movingGems--;
          }
        }
      }
    }

    if (!gemsAreMoving && this.movingGems <= 0 && this.isCheckingForCascadingMatches) {
      this.isCheckingForCascadingMatches = false;
      this.checkAndHandleCascadingMatches();
    }

    if (this.selectionHighlight && this.selectedGem) {
      this.selectionHighlight.position.set(this.selectedGem.x, this.selectedGem.y);
    }
  }

  hasMovingGems(): boolean {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const gem = this.gems[row][col];
        if (gem && (gem as any).userData.falling) {
          return true;
        }
      }
    }
    return false;
  }

  checkAndHandleCascadingMatches() {
    const matches = this.findMatches();
    if (matches.length > 0) {
      this.matchesFound(matches);
      return;
    }
    
    // Resetar combo quando não há mais matches
    if (this.comboCount > 0) {
      setTimeout(() => {
        this.resetCombo();
      }, 1000);
    }
    
    this.movingGems = Math.max(0, this.movingGems - 1);
  }
}
