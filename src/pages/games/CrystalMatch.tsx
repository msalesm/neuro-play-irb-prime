import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import { useGameSession } from '@/hooks/useGameSession';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { hapticsEngine } from '@/lib/haptics';

export default function CrystalMatch() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const gameRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  
  const childProfileId = localStorage.getItem('selectedChildProfile');
  const { startSession, endSession, updateSession } = useGameSession('crystal-match', childProfileId || '');

  useEffect(() => {
    if (!childProfileId) {
      toast.error('Perfil da criança não encontrado');
      navigate('/sistema-planeta-azul');
      return;
    }

    initializeGame();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, [childProfileId]);

  const initializeGame = async () => {
    if (!containerRef.current) return;

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
    });

    await game.setup();
    gameRef.current = game;

    app.ticker.add((ticker) => {
      game.update(ticker.deltaTime);
    });

    setIsLoading(false);
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
    }
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

          {gameStarted && (
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

        {/* Game Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 text-white/90 text-sm">
          <p className="mb-2">📋 <strong>Como jogar:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Clique em um cristal e depois em um adjacente para trocar</li>
            <li>Forme linhas de 3 ou mais cristais iguais</li>
            <li>Você tem 30 movimentos para fazer a maior pontuação</li>
            <li>Cristais novos caem do topo automaticamente</li>
          </ul>
        </div>

        {/* Game Container */}
        <div className="flex justify-center items-center">
          {isLoading ? (
            <div className="text-white text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
              <p>Carregando jogo...</p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="rounded-lg overflow-hidden shadow-2xl border-4 border-purple-500/30"
            />
          )}
        </div>

        {/* Game Info */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 text-white/80 text-sm">
          <p className="text-center">
            🧠 <strong>Habilidades trabalhadas:</strong> Atenção Visual, Planejamento, Raciocínio Lógico
          </p>
        </div>
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
  private callbacks: {
    onStart: () => void;
    onMove: (correct: boolean) => void;
    onScore: (points: number) => void;
    onGameOver: (score: number, moves: number) => void;
  };

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
    gem.on('pointerdown', () => this.onGemClick(gem));

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

  onGemClick(gem: PIXI.Text) {
    if (this.gameState !== 'PLAYING' || this.movingGems > 0) return;

    const userData = (gem as any).userData;

    if (!this.selectedGem) {
      this.selectedGem = gem;
      this.showSelection(gem, true);
    } else if (this.selectedGem === gem) {
      this.showSelection(gem, false);
      this.selectedGem = null;
    } else {
      const row1 = (this.selectedGem as any).userData.row;
      const col1 = (this.selectedGem as any).userData.col;
      const row2 = userData.row;
      const col2 = userData.col;

      if (this.areAdjacent(row1, col1, row2, col2)) {
        this.swapGems(this.selectedGem, gem);
      } else {
        this.showSelection(this.selectedGem, false);
        this.selectedGem = gem;
        this.showSelection(gem, true);
      }
    }
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
    const points = matches.length * 10;
    this.score += points;
    this.updateUI();
    this.callbacks.onScore(points);
    this.updateMatches(matches);

    if (this.selectionHighlight) {
      this.selectionHighlight.visible = false;
      this.selectedGem = null;
    }

    setTimeout(() => {
      this.removeMatches(matches);
      setTimeout(() => {
        this.dropGems();
      }, 200);
    }, 300);
  }

  updateMatches(matches: Array<{ row: number; col: number }>) {
    matches.forEach(match => {
      const gem = this.gems[match.row][match.col];
      if (gem) {
        (gem as any).userData.isMatched = true;
        gem.alpha = 0.5;
      }
    });
  }

  removeMatches(matches: Array<{ row: number; col: number }>) {
    matches.forEach(match => {
      const gem = this.gems[match.row][match.col];
      if (gem) {
        this.gameContainer!.removeChild(gem);
        this.gems[match.row][match.col] = null;
      }
      this.grid[match.row][match.col] = null;
    });
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
    this.movingGems = Math.max(0, this.movingGems - 1);
  }
}
