import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import * as PIXI from "pixi.js";
import { useGameProfile } from "@/hooks/useGameProfile";
import { useGameSession } from "@/hooks/useGameSession";
import { toast } from "sonner";
import { GameCompatibilityCheck } from "@/components/GameCompatibilityCheck";
import { addUniversalEventListener, getEventCoordinates } from "@/lib/browserCompat";

const TowerDefense = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { childProfileId, isTestMode, loading: profileLoading } = useGameProfile();
  const { 
    startSession, 
    endSession, 
    updateSession,
    isActive: sessionActive 
  } = useGameSession("tower-defense", childProfileId || undefined, isTestMode);

  useEffect(() => {
    if (profileLoading || !canvasRef.current) return;

    const initGame = async () => {
      try {
        const app = new PIXI.Application();
        await app.init({
          width: 800,
          height: 600,
          backgroundColor: 0x3c5e2b,
          antialias: true
        });

        if (canvasRef.current) {
          canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
          appRef.current = app;

          const game = new Game(app);
          gameRef.current = game;

          game.onGameStart = async () => {
            if (!sessionActive) {
              const result = await startSession();
              if (result.success) {
                setGameStarted(true);
              }
            }
          };

          game.onGameOver = async (finalWave: number) => {
            if (sessionActive) {
              await endSession({
                score: finalWave,
                timeSpent: Math.floor((Date.now() - game.gameStartTime) / 1000),
              });
            }
            toast.success(`Jogo finalizado! Você sobreviveu ${finalWave} ondas!`);
          };

          game.onScoreUpdate = async (wave: number, money: number) => {
            if (sessionActive && gameStarted) {
              await updateSession({
                score: wave,
                moves: money,
              });
            }
          };
        }
      } catch (err) {
        console.error("Error initializing Tower Defense:", err);
        setError("Erro ao carregar o jogo. Por favor, tente novamente.");
      }
    };

    initGame();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, [profileLoading]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <GameCompatibilityCheck showWarnings={true} />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            {isTestMode && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                🎮 Modo Teste
              </span>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-2">Torre de Defesa</h1>
          <p className="text-muted-foreground text-center mb-6">
            Defenda sua base! Construa torres para eliminar os invasores.
          </p>

          <div className="flex justify-center">
            <div ref={canvasRef} className="rounded-lg overflow-hidden shadow-xl" />
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Como Jogar:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clique para posicionar torres (custam $50)</li>
              <li>• Torres atacam automaticamente inimigos no alcance</li>
              <li>• Elimine inimigos para ganhar dinheiro ($10 por inimigo)</li>
              <li>• Sobreviva o máximo de ondas possível</li>
              <li>• Não deixe inimigos chegarem à base!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

class Game {
  app: PIXI.Application;
  state: string;
  wave: number;
  money: number;
  lives: number;
  towerCost: number;
  enemies: any[];
  towers: any[];
  bullets: any[];
  placingTower: boolean;
  ghostTower: any;
  selectedTower: any;
  waveInProgress: boolean;
  spawnTimer: number;
  spawnInterval: number;
  enemiesToSpawn: number;
  enemySpeed: number;
  enemyHealth: number;
  basePos: { x: number; y: number };
  towerRange: number;
  towerFireRate: number;
  towerBulletSpeed: number;
  towerBulletDamage: number;
  bulletLifetime: number;
  pathWidth: number;
  path: { x: number; y: number }[];
  uiContainer: PIXI.Container;
  gameContainer: PIXI.Container;
  overContainer: PIXI.Container;
  titleContainer: PIXI.Container;
  rangeGraphics: PIXI.Graphics;
  background: PIXI.Graphics;
  pathGraphics: PIXI.Graphics;
  baseSprite: PIXI.Sprite | null;
  moneyText: PIXI.Text;
  waveText: PIXI.Text;
  livesText: PIXI.Text;
  finalWaveText: PIXI.Text;
  gameStartTime: number;
  onGameStart?: () => void;
  onGameOver?: (finalWave: number) => void;
  onScoreUpdate?: (wave: number, money: number) => void;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.state = 'title';
    this.wave = 1;
    this.money = 200;
    this.lives = 10;
    this.towerCost = 50;
    this.enemies = [];
    this.towers = [];
    this.bullets = [];
    this.placingTower = false;
    this.ghostTower = null;
    this.selectedTower = null;
    this.waveInProgress = false;
    this.spawnTimer = 0;
    this.spawnInterval = 40;
    this.enemiesToSpawn = 0;
    this.enemySpeed = 1.1;
    this.enemyHealth = 20;
    this.basePos = { x: 780, y: 400 };
    this.towerRange = 110;
    this.towerFireRate = 48;
    this.towerBulletSpeed = 6;
    this.towerBulletDamage = 10;
    this.bulletLifetime = 60;
    this.pathWidth = 46;
    this.path = [
      { x: 0, y: 50 },
      { x: 200, y: 50 },
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 600, y: 400 },
      { x: 780, y: 400 }
    ];
    this.uiContainer = new PIXI.Container();
    this.gameContainer = new PIXI.Container();
    this.overContainer = new PIXI.Container();
    this.titleContainer = new PIXI.Container();
    this.rangeGraphics = new PIXI.Graphics();
    this.background = new PIXI.Graphics();
    this.pathGraphics = new PIXI.Graphics();
    this.baseSprite = null;
    this.moneyText = new PIXI.Text();
    this.waveText = new PIXI.Text();
    this.livesText = new PIXI.Text();
    this.finalWaveText = new PIXI.Text();
    this.gameStartTime = Date.now();
    this.init();
  }

  async init() {
    this.app.stage.addChild(this.background);
    this.app.stage.addChild(this.pathGraphics);
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.rangeGraphics);
    this.app.stage.addChild(this.uiContainer);
    this.app.stage.addChild(this.titleContainer);
    this.app.stage.addChild(this.overContainer);

    this.drawBackground();
    this.drawPath();
    this.setupUI();
    this.setupTitle();
    this.setupGameOver();

    await PIXI.Assets.load([
      'https://storage.googleapis.com/scraper_ludo/user_images_prod/349de2da9a4b1aea1e6e7cf94460c310.webp',
      'https://storage.googleapis.com/scraper_ludo/user_images_prod/41d4c63845623b852c905cd8e515f3ca.webp',
      'https://storage.googleapis.com/scraper_ludo/user_images_prod/a5fa8b91f2800c258421e5fabaecd380.webp'
    ]);

    this.drawBase();
    this.resetGame();
    this.setState('title');

    this.app.canvas.addEventListener('pointerdown', (e: any) => this.onPointerDown(e));
    this.app.canvas.addEventListener('pointermove', (e: any) => this.onPointerMove(e));
    this.app.ticker.add((delta: any) => this.update(delta));
  }

  resetGame() {
    this.wave = 1;
    this.money = 200;
    this.lives = 10;
    this.enemies = [];
    this.towers = [];
    this.bullets = [];
    this.waveInProgress = false;
    this.spawnTimer = 0;
    this.enemySpeed = 0.8;
    this.enemyHealth = 60;
    this.spawnInterval = 40;
    this.enemiesToSpawn = 0;
    this.clearContainer(this.gameContainer);
    this.drawBase();
    this.hideGhostTower();
    this.selectedTower = null;
    this.rangeGraphics.clear();
    this.updateUI();
    this.gameStartTime = Date.now();
  }

  setState(state: string) {
    this.state = state;
    this.uiContainer.visible = state === 'play';
    this.gameContainer.visible = state === 'play';
    if (this.baseSprite) {
      this.baseSprite.visible = state === 'play';
    }
    this.pathGraphics.visible = state === 'play';
    this.background.visible = true;
    this.titleContainer.visible = state === 'title';
    this.overContainer.visible = state === 'gameover';

    if (state === 'play') {
      this.resetGame();
      this.startWave();
      if (this.onGameStart) {
        this.onGameStart();
      }
    } else if (state === 'gameover' && this.onGameOver) {
      this.onGameOver(this.wave);
    }
  }

  setupUI() {
    this.moneyText = new PIXI.Text({ text: '', style: { fontFamily: 'Arial', fontSize: 22, fill: 0xffff99, fontWeight: 'bold' } });
    this.waveText = new PIXI.Text({ text: '', style: { fontFamily: 'Arial', fontSize: 22, fill: 0xffffff, fontWeight: 'bold' } });
    this.livesText = new PIXI.Text({ text: '', style: { fontFamily: 'Arial', fontSize: 22, fill: 0xff8888, fontWeight: 'bold' } });
    
    this.moneyText.x = 16;
    this.moneyText.y = 10;
    this.waveText.x = 16;
    this.waveText.y = 40;
    this.livesText.x = 16;
    this.livesText.y = 70;
    
    this.uiContainer.addChild(this.moneyText, this.waveText, this.livesText);
    this.updateUI();
  }

  updateUI() {
    this.moneyText.text = 'Money: ' + this.money;
    this.waveText.text = 'Wave: ' + this.wave;
    this.livesText.text = 'Lives: ' + this.lives;
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.wave, this.money);
    }
  }

  setupTitle() {
    this.titleContainer.removeChildren();
    const title = new PIXI.Text({ text: 'TOWER DEFENSE', style: { fontFamily: 'Arial', fontSize: 48, fill: 0xffffcc, fontWeight: 'bold', align: 'center' } });
    title.anchor.set(0.5);
    title.x = 400;
    title.y = 220;
    
    const clickText = new PIXI.Text({ text: 'Click to Start', style: { fontFamily: 'Arial', fontSize: 28, fill: 0xffffff, fontWeight: 'bold', align: 'center' } });
    clickText.anchor.set(0.5);
    clickText.x = 400;
    clickText.y = 330;
    
    this.titleContainer.addChild(title, clickText);
    this.titleContainer.interactive = true;
    this.titleContainer.eventMode = 'static';
    this.titleContainer.on('pointerdown', () => this.setState('play'));
  }

  setupGameOver() {
    this.overContainer.removeChildren();
    const overText = new PIXI.Text({ text: 'GAME OVER', style: { fontFamily: 'Arial', fontSize: 54, fill: 0xff4444, fontWeight: 'bold', align: 'center' } });
    overText.anchor.set(0.5);
    overText.x = 400;
    overText.y = 220;
    
    this.finalWaveText = new PIXI.Text({ text: '', style: { fontFamily: 'Arial', fontSize: 32, fill: 0xffffcc, fontWeight: 'bold', align: 'center' } });
    this.finalWaveText.anchor.set(0.5);
    this.finalWaveText.x = 400;
    this.finalWaveText.y = 290;
    
    const restartText = new PIXI.Text({ text: 'Click to Restart', style: { fontFamily: 'Arial', fontSize: 26, fill: 0xffffff, fontWeight: 'bold', align: 'center' } });
    restartText.anchor.set(0.5);
    restartText.x = 400;
    restartText.y = 350;
    
    this.overContainer.addChild(overText, this.finalWaveText, restartText);
    this.overContainer.interactive = true;
    this.overContainer.eventMode = 'static';
    this.overContainer.on('pointerdown', () => this.setState('play'));
  }

  drawBackground() {
    this.background.clear();
    this.background.rect(0, 0, 800, 600);
    this.background.fill(0x3c5e2b);

    const numClumps = 100;
    const baseColor = 0x3c5e2b;
    for (let i = 0; i < numClumps; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const radius = 3 + Math.random() * 7;
      const r = (baseColor >> 16) & 0xFF;
      const g = (baseColor >> 8) & 0xFF;
      const b = baseColor & 0xFF;
      const shadeFactor = 0.8 + Math.random() * 0.4;
      const newR = Math.min(255, Math.floor(r * shadeFactor));
      const newG = Math.min(255, Math.floor(g * shadeFactor));
      const newB = Math.min(255, Math.floor(b * shadeFactor));
      const clumpColor = (newR << 16) + (newG << 8) + newB;
      this.background.circle(x, y, radius);
      this.background.fill({ color: clumpColor, alpha: 0.6 + Math.random() * 0.4 });
    }
  }

  drawPath() {
    this.pathGraphics.clear();
    this.pathGraphics.moveTo(this.path[0].x, this.path[0].y);
    
    for (let i = 1; i < this.path.length; i++) {
      this.pathGraphics.lineTo(this.path[i].x, this.path[i].y);
    }
    
    this.pathGraphics.stroke({ width: this.pathWidth, color: 0x4a4032 });
  }

  drawBase() {
    if (this.baseSprite) {
      this.gameContainer.removeChild(this.baseSprite);
      this.baseSprite.destroy();
    }
    this.baseSprite = PIXI.Sprite.from('https://storage.googleapis.com/scraper_ludo/user_images_prod/41d4c63845623b852c905cd8e515f3ca.webp');
    this.baseSprite.anchor.set(0.5);
    this.baseSprite.x = this.basePos.x;
    this.baseSprite.y = this.basePos.y;
    this.baseSprite.scale.set(0.225);
    this.gameContainer.addChild(this.baseSprite);
  }

  onPointerDown(e: PointerEvent) {
    if (this.state !== 'play') return;
    const pos = this.getPointerPos(e);
    if (this.placingTower) {
      if (this.isValidTowerPos(pos.x, pos.y)) {
        if (this.money >= this.towerCost) {
          this.placeTower(pos.x, pos.y);
          this.money -= this.towerCost;
          this.updateUI();
        } else {
          this.flashMoney();
        }
      }
      this.hideGhostTower();
      this.placingTower = false;
    } else {
      if (this.money >= this.towerCost) {
        this.placingTower = true;
        this.showGhostTower(pos.x, pos.y);
      } else {
        this.flashMoney();
      }
    }
  }

  onPointerMove(e: PointerEvent) {
    if (this.state !== 'play') return;
    if (!this.placingTower) return;
    const pos = this.getPointerPos(e);
    this.updateGhostTower(pos.x, pos.y);
  }

  getPointerPos(e: PointerEvent) {
    const rect = this.app.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.app.renderer.width / rect.width);
    const y = (e.clientY - rect.top) * (this.app.renderer.height / rect.height);
    return { x, y };
  }

  flashMoney() {
    this.moneyText.style.fill = 0xff4444;
    setTimeout(() => {
      this.moneyText.style.fill = 0xffff99;
    }, 200);
  }

  showGhostTower(x: number, y: number) {
    if (this.ghostTower) this.hideGhostTower();
    this.ghostTower = this.createTowerGraphics(x, y, 0.5, true, this.isValidTowerPos(x, y));
    if (this.ghostTower.children[0] instanceof PIXI.Sprite) {
      this.ghostTower.children[0].tint = this.isValidTowerPos(x, y) ? 0xffffff : 0xff5555;
    }
    this.gameContainer.addChild(this.ghostTower);
  }

  updateGhostTower(x: number, y: number) {
    if (!this.ghostTower) return;
    this.ghostTower.x = x;
    this.ghostTower.y = y;
    const valid = this.isValidTowerPos(x, y);
    this.ghostTower.alpha = 0.5;
    if (this.ghostTower.children.length > 0 && this.ghostTower.children[0] instanceof PIXI.Sprite) {
      this.ghostTower.children[0].tint = valid ? 0xffffff : 0xff5555;
    }
  }

  hideGhostTower() {
    if (this.ghostTower && this.ghostTower.parent) {
      this.gameContainer.removeChild(this.ghostTower);
    }
    this.ghostTower = null;
  }

  isValidTowerPos(x: number, y: number) {
    if (x < 15 || x > 785 || y < 15 || y > 585) return false;
    if (this.pointOnPath(x, y)) return false;
    for (let t of this.towers) {
      if (Math.hypot(t.x - x, t.y - y) < 40) return false;
    }
    return true;
  }

  pointOnPath(x: number, y: number) {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      const t = this.closestTOnSegment(a, b, { x, y });
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      const dist = Math.hypot(px - x, py - y);
      if (dist <= this.pathWidth / 2 + 4) return true;
    }
    return false;
  }

  closestTOnSegment(a: any, b: any, p: any) {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (dx === 0 && dy === 0) return 0;
    const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
    return Math.max(0, Math.min(1, t));
  }

  createTowerGraphics(x: number, y: number, alpha = 1, ghost = false, valid = true) {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;
    container.alpha = alpha;

    const baseSprite = PIXI.Sprite.from('https://storage.googleapis.com/scraper_ludo/user_images_prod/a5fa8b91f2800c258421e5fabaecd380.webp');
    baseSprite.anchor.set(0.5);
    baseSprite.scale.set(0.13);
    container.addChild(baseSprite);

    const turret = new PIXI.Container();
    const turretGraphics = new PIXI.Graphics();
    turretGraphics.rect(-4, -25, 8, 25);
    turretGraphics.fill(0x888888);
    turretGraphics.rect(-5, -28, 10, 3);
    turretGraphics.fill(0xbbbbbb);
    turret.addChild(turretGraphics);
    container.addChild(turret);

    return container;
  }

  placeTower(x: number, y: number) {
    const tower = {
      x, y,
      fireCooldown: 0,
      sprite: this.createTowerGraphics(x, y),
      range: this.towerRange,
      fireRate: this.towerFireRate,
      bulletSpeed: this.towerBulletSpeed,
      bulletDamage: this.towerBulletDamage,
      rotation: 0,
      turret: null as any
    };
    tower.turret = tower.sprite.children[1];
    this.towers.push(tower);
    this.gameContainer.addChild(tower.sprite);
  }

  startWave() {
    this.waveInProgress = true;
    this.spawnTimer = 0;
    this.enemiesToSpawn = 4 + Math.floor(this.wave * 1.2);
    this.enemySpeed = 0.8 + this.wave * 0.05;
    this.enemyHealth = 60 + this.wave * 10;
  }

  update(delta: any) {
    if (this.state !== 'play') return;

    if (this.lives <= 0) {
      this.finalWaveText.text = 'Waves Survived: ' + this.wave;
      this.setState('gameover');
      return;
    }

    if (this.waveInProgress) {
      this.spawnTimer += delta.deltaTime;
      if (this.enemiesToSpawn > 0 && this.spawnTimer >= this.spawnInterval) {
        this.spawnEnemy();
        this.spawnTimer = 0;
        this.enemiesToSpawn--;
      }
    }

    this.updateEnemies(delta.deltaTime);
    this.updateTowers(delta.deltaTime);
    this.updateBullets(delta.deltaTime);

    if (this.waveInProgress && this.enemiesToSpawn === 0 && this.enemies.length === 0) {
      this.waveInProgress = false;
      setTimeout(() => {
        this.wave++;
        this.updateUI();
        this.startWave();
      }, 1200);
    }

    this.updateUI();
  }

  spawnEnemy() {
    const enemy = {
      x: this.path[0].x,
      y: this.path[0].y,
      size: 20,
      speed: this.enemySpeed,
      health: this.enemyHealth,
      maxHealth: this.enemyHealth,
      waypoint: 1,
      sprite: this.createEnemyGraphics(this.path[0].x, this.path[0].y),
      healthBar: new PIXI.Graphics()
    };
    this.enemies.push(enemy);
    this.gameContainer.addChild(enemy.sprite);
    this.gameContainer.addChild(enemy.healthBar);
  }

  createEnemyGraphics(x: number, y: number) {
    const sprite = PIXI.Sprite.from('https://storage.googleapis.com/scraper_ludo/user_images_prod/349de2da9a4b1aea1e6e7cf94460c310.webp');
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5);
    sprite.scale.set(0.055);
    return sprite;
  }

  updateEnemies(delta: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.waypoint >= this.path.length) {
        this.lives--;
        this.gameContainer.removeChild(enemy.sprite);
        this.gameContainer.removeChild(enemy.healthBar);
        this.enemies.splice(i, 1);
        continue;
      }

      const target = this.path[enemy.waypoint];
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist < enemy.speed * delta) {
        enemy.x = target.x;
        enemy.y = target.y;
        enemy.waypoint++;
      } else {
        enemy.x += (dx / dist) * enemy.speed * delta;
        enemy.y += (dy / dist) * enemy.speed * delta;
      }

      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.y;
      this.updateEnemyHealthBar(enemy);

      if (enemy.health <= 0) {
        this.money += 10;
        this.gameContainer.removeChild(enemy.sprite);
        this.gameContainer.removeChild(enemy.healthBar);
        this.enemies.splice(i, 1);
      }
    }
  }

  updateEnemyHealthBar(enemy: any) {
    enemy.healthBar.clear();
    const w = 30, h = 4;
    const hpFrac = Math.max(0, enemy.health / enemy.maxHealth);
    const color = hpFrac > 0.6 ? 0x44ff44 : hpFrac > 0.3 ? 0xffcc00 : 0xff4444;
    
    enemy.healthBar.rect(enemy.x - w / 2, enemy.y - 25, w, h);
    enemy.healthBar.fill(0x222222);
    enemy.healthBar.rect(enemy.x - w / 2 + 1, enemy.y - 25 + 1, (w - 2) * hpFrac, h - 2);
    enemy.healthBar.fill(color);
  }

  updateTowers(delta: number) {
    for (let tower of this.towers) {
      let target = null, minDist = 99999;
      for (let enemy of this.enemies) {
        const d = Math.hypot(tower.x - enemy.x, tower.y - enemy.y);
        if (d <= tower.range && d < minDist) {
          minDist = d;
          target = enemy;
        }
      }

      if (target) {
        const angle = Math.atan2(target.y - tower.y, target.x - tower.x);
        if (tower.turret) {
          tower.turret.rotation = angle + Math.PI / 2;
        }
        if (tower.fireCooldown <= 0) {
          this.fireBullet(tower, target, angle);
          tower.fireCooldown = tower.fireRate;
        }
      }

      if (tower.fireCooldown > 0) tower.fireCooldown -= delta;
    }
  }

  fireBullet(tower: any, enemy: any, angle: number) {
    const bullet = {
      x: tower.x + Math.cos(angle) * 17,
      y: tower.y + Math.sin(angle) * 17,
      vx: Math.cos(angle) * tower.bulletSpeed,
      vy: Math.sin(angle) * tower.bulletSpeed,
      target: enemy,
      damage: tower.bulletDamage,
      sprite: this.createBulletGraphics(),
      lifetime: this.bulletLifetime
    };
    bullet.sprite.x = bullet.x;
    bullet.sprite.y = bullet.y;
    this.bullets.push(bullet);
    this.gameContainer.addChild(bullet.sprite);
  }

  createBulletGraphics() {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 5);
    g.fill(0xffff33);
    return g;
  }

  updateBullets(delta: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx * delta;
      bullet.y += bullet.vy * delta;
      bullet.lifetime -= delta;
      bullet.sprite.x = bullet.x;
      bullet.sprite.y = bullet.y;

      let hit = false;
      for (let j = 0; j < this.enemies.length; j++) {
        const enemy = this.enemies[j];
        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) <= 20) {
          enemy.health -= bullet.damage;
          hit = true;
          break;
        }
      }

      if (hit || bullet.lifetime <= 0 || bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
        this.gameContainer.removeChild(bullet.sprite);
        this.bullets.splice(i, 1);
      }
    }
  }

  clearContainer(container: PIXI.Container) {
    while (container.children.length) container.removeChildAt(0);
  }
}

export default TowerDefense;
