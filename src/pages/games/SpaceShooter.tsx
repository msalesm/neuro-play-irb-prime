import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameExitButton } from '@/components/GameExitButton';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function SpaceShooter() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameInstanceRef = useRef<any>(null);

  const { isTestMode } = useGameProfile();

  useEffect(() => {
    const savedHighScore = parseInt(localStorage.getItem('space_shooter_highscore') || '0');
    setHighScore(savedHighScore);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application();
    
    (async () => {
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x000511,
      });

      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      // Starfield background
      const starfield = new PIXI.Container();
      app.stage.addChild(starfield);
      
      const stars: any[] = [];
      for (let i = 0; i < 100; i++) {
        const star = new PIXI.Graphics();
        star.circle(0, 0, Math.random() * 2 + 1);
        star.fill(0xffffff);
        star.x = Math.random() * 800;
        star.y = Math.random() * 600;
        star.alpha = Math.random() * 0.8 + 0.2;
        const starSprite = { graphics: star, speed: Math.random() * 2 + 1 };
        stars.push(starSprite);
        starfield.addChild(star);
      }

      // Player ship
      const player = new PIXI.Graphics();
      player.moveTo(0, -20);
      player.lineTo(-15, 15);
      player.lineTo(0, 10);
      player.lineTo(15, 15);
      player.closePath();
      player.fill(0x00cfff);
      player.stroke({ width: 2, color: 0x00ffff });
      player.x = 150;
      player.y = 300;
      app.stage.addChild(player);

      let playerVx = 0;
      let playerVy = 0;
      const keys: any = {};
      let gameScore = 0;
      let gameLives = 3;
      let gameWave = 1;
      let invincible = 0;
      let bullets: any[] = [];
      let enemies: any[] = [];
      let enemyBullets: any[] = [];
      let explosions: any[] = [];
      let enemySpawnTimer = 0;
      let waveTimer = 0;
      let gameActive = true;

      window.addEventListener('keydown', (e) => { keys[e.key] = true; });
      window.addEventListener('keyup', (e) => { keys[e.key] = false; });

      // HUD
      const scoreText = new PIXI.Text({ text: 'SCORE: 0', style: { fontFamily: 'monospace', fontSize: 24, fill: 0x00ff99 } });
      scoreText.x = 10;
      scoreText.y = 10;
      app.stage.addChild(scoreText);

      const livesText = new PIXI.Text({ text: '♥ ♥ ♥', style: { fontFamily: 'monospace', fontSize: 24, fill: 0xff0055 } });
      livesText.x = 700;
      livesText.y = 10;
      app.stage.addChild(livesText);

      const waveText = new PIXI.Text({ text: 'WAVE 1', style: { fontFamily: 'monospace', fontSize: 20, fill: 0xaa66ff } });
      waveText.x = 360;
      waveText.y = 560;
      app.stage.addChild(waveText);

      function fireBullet() {
        if (bullets.length >= 10) return;
        const bullet = new PIXI.Graphics();
        bullet.rect(-2, -8, 4, 16);
        bullet.fill(0x00cfff);
        bullet.x = player.x + 20;
        bullet.y = player.y;
        bullets.push({ graphics: bullet, vx: 12, vy: 0 });
        app.stage.addChild(bullet);
      }

      function spawnEnemy() {
        const enemy = new PIXI.Graphics();
        const isScout = Math.random() > 0.7;
        
        if (isScout) {
          enemy.moveTo(0, -15);
          enemy.lineTo(15, 10);
          enemy.lineTo(-15, 10);
          enemy.closePath();
          enemy.fill(0xaa66ff);
        } else {
          enemy.moveTo(0, -12);
          enemy.lineTo(-10, 12);
          enemy.lineTo(10, 12);
          enemy.closePath();
          enemy.fill(0xff0055);
        }
        
        enemy.x = 850;
        enemy.y = 100 + Math.random() * 400;
        enemies.push({ 
          graphics: enemy, 
          vx: -(2 + Math.random() * 2), 
          vy: isScout ? (Math.random() - 0.5) * 3 : 0,
          hp: isScout ? 2 : 1,
          isScout,
          shootTimer: isScout ? Math.random() * 120 : 0
        });
        app.stage.addChild(enemy);
      }

      function spawnExplosion(x: number, y: number) {
        for (let i = 0; i < 10; i++) {
          const particle = new PIXI.Graphics();
          particle.circle(0, 0, 2 + Math.random() * 2);
          particle.fill(0xffaa00 + Math.floor(Math.random() * 0x5500));
          particle.x = x;
          particle.y = y;
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 3;
          explosions.push({
            graphics: particle,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30
          });
          app.stage.addChild(particle);
        }
      }

      let bulletCooldown = 0;
      
      app.ticker.add(() => {
        if (!gameActive || paused || gameOver) return;

        // Starfield
        stars.forEach(s => {
          s.graphics.x -= s.speed;
          if (s.graphics.x < -10) s.graphics.x = 810;
        });

        // Player movement
        let targetVx = 0;
        let targetVy = 0;
        if (keys['ArrowLeft'] || keys['a']) targetVx = -5;
        if (keys['ArrowRight'] || keys['d']) targetVx = 5;
        if (keys['ArrowUp'] || keys['w']) targetVy = -5;
        if (keys['ArrowDown'] || keys['s']) targetVy = 5;
        
        playerVx += (targetVx - playerVx) * 0.2;
        playerVy += (targetVy - playerVy) * 0.2;
        player.x += playerVx;
        player.y += playerVy;
        player.x = Math.max(50, Math.min(750, player.x));
        player.y = Math.max(50, Math.min(550, player.y));

        // Shooting
        if (keys[' '] && bulletCooldown <= 0) {
          fireBullet();
          bulletCooldown = 10;
        }
        if (bulletCooldown > 0) bulletCooldown--;

        // Bullets
        bullets.forEach((b, i) => {
          b.graphics.x += b.vx;
          if (b.graphics.x > 850) {
            app.stage.removeChild(b.graphics);
            bullets.splice(i, 1);
          }
        });

        // Enemy bullets
        enemyBullets.forEach((eb, i) => {
          eb.graphics.x += eb.vx;
          if (eb.graphics.x < -50) {
            app.stage.removeChild(eb.graphics);
            enemyBullets.splice(i, 1);
          }
          
          // Check collision with player
          if (invincible <= 0) {
            const dx = eb.graphics.x - player.x;
            const dy = eb.graphics.y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 25) {
              gameLives--;
              setLives(gameLives);
              livesText.text = '♥ '.repeat(gameLives);
              invincible = 60;
              spawnExplosion(player.x, player.y);
              app.stage.removeChild(eb.graphics);
              enemyBullets.splice(i, 1);
              
              if (gameLives <= 0) {
                gameActive = false;
                setGameOver(true);
                if (gameScore > highScore) {
                  setHighScore(gameScore);
                  localStorage.setItem('space_shooter_highscore', gameScore.toString());
                }
              }
            }
          }
        });

        if (invincible > 0) {
          invincible--;
          player.alpha = 0.5 + Math.sin(invincible * 0.5) * 0.3;
        } else {
          player.alpha = 1;
        }

        // Enemies
        enemies.forEach((e, i) => {
          e.graphics.x += e.vx;
          e.graphics.y += e.vy;
          
          if (e.graphics.y < 50 || e.graphics.y > 550) e.vy *= -1;
          
          if (e.isScout && e.shootTimer > 0) {
            e.shootTimer--;
            if (e.shootTimer <= 0 && e.graphics.x < 750) {
              const enemyBullet = new PIXI.Graphics();
              enemyBullet.rect(-8, -2, 16, 4);
              enemyBullet.fill(0xff0055);
              enemyBullet.x = e.graphics.x - 20;
              enemyBullet.y = e.graphics.y;
              enemyBullets.push({ graphics: enemyBullet, vx: -6, vy: 0 });
              app.stage.addChild(enemyBullet);
              e.shootTimer = 90 + Math.random() * 60;
            }
          }
          
          if (e.graphics.x < -50) {
            app.stage.removeChild(e.graphics);
            enemies.splice(i, 1);
          }
          
          // Collision with player
          if (invincible <= 0) {
            const dx = e.graphics.x - player.x;
            const dy = e.graphics.y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
              gameLives--;
              setLives(gameLives);
              livesText.text = '♥ '.repeat(gameLives);
              invincible = 60;
              spawnExplosion(player.x, player.y);
              spawnExplosion(e.graphics.x, e.graphics.y);
              app.stage.removeChild(e.graphics);
              enemies.splice(i, 1);
              
              if (gameLives <= 0) {
                gameActive = false;
                setGameOver(true);
                if (gameScore > highScore) {
                  setHighScore(gameScore);
                  localStorage.setItem('space_shooter_highscore', gameScore.toString());
                }
              }
            }
          }
        });

        // Bullet vs Enemy collision
        bullets.forEach((b, bi) => {
          enemies.forEach((e, ei) => {
            const dx = b.graphics.x - e.graphics.x;
            const dy = b.graphics.y - e.graphics.y;
            if (Math.sqrt(dx * dx + dy * dy) < 25) {
              e.hp--;
              app.stage.removeChild(b.graphics);
              bullets.splice(bi, 1);
              
              if (e.hp <= 0) {
                const points = e.isScout ? 20 : 10;
                gameScore += points;
                setScore(gameScore);
                scoreText.text = `SCORE: ${gameScore}`;
                spawnExplosion(e.graphics.x, e.graphics.y);
                app.stage.removeChild(e.graphics);
                enemies.splice(ei, 1);
              }
            }
          });
        });

        // Explosions
        explosions.forEach((ex, i) => {
          ex.graphics.x += ex.vx;
          ex.graphics.y += ex.vy;
          ex.life--;
          ex.graphics.alpha = ex.life / 30;
          
          if (ex.life <= 0) {
            app.stage.removeChild(ex.graphics);
            explosions.splice(i, 1);
          }
        });

        // Enemy spawning
        enemySpawnTimer++;
        const spawnRate = Math.max(30, 120 - gameWave * 5);
        if (enemySpawnTimer > spawnRate) {
          enemySpawnTimer = 0;
          const count = 1 + Math.floor(gameWave / 3);
          for (let i = 0; i < Math.min(count, 4); i++) {
            spawnEnemy();
          }
        }

        // Wave progression
        waveTimer++;
        if (waveTimer > 1800) {
          waveTimer = 0;
          gameWave++;
          setWave(gameWave);
          waveText.text = `WAVE ${gameWave}`;
        }
      });

      gameInstanceRef.current = {
        reset: () => {
          gameScore = 0;
          gameLives = 3;
          gameWave = 1;
          invincible = 0;
          enemySpawnTimer = 0;
          waveTimer = 0;
          gameActive = true;
          
          setScore(0);
          setLives(3);
          setWave(1);
          setGameOver(false);
          
          player.x = 150;
          player.y = 300;
          playerVx = 0;
          playerVy = 0;
          
          bullets.forEach(b => app.stage.removeChild(b.graphics));
          enemies.forEach(e => app.stage.removeChild(e.graphics));
          enemyBullets.forEach(eb => app.stage.removeChild(eb.graphics));
          explosions.forEach(ex => app.stage.removeChild(ex.graphics));
          
          bullets = [];
          enemies = [];
          enemyBullets = [];
          explosions = [];
          
          scoreText.text = 'SCORE: 0';
          livesText.text = '♥ ♥ ♥';
          waveText.text = 'WAVE 1';
        }
      };
    })();

    return () => {
      app.destroy(true);
    };
  }, [paused, gameOver, highScore]);

  const handlePauseToggle = () => {
    setPaused(!paused);
  };

  const handleReset = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <GameExitButton />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Nave Espacial
              </h1>
              {isTestMode && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  Modo Teste
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Pilote sua nave, derrote inimigos e sobreviva às ondas! Use as setas ou WASD para mover, Espaço para atirar.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-6 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-xs text-muted-foreground">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{lives}</div>
                  <div className="text-xs text-muted-foreground">Vidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{wave}</div>
                  <div className="text-xs text-muted-foreground">Onda</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{highScore}</div>
                  <div className="text-xs text-muted-foreground">Recorde</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handlePauseToggle}>
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div 
              ref={canvasRef} 
              className="flex justify-center items-center bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-primary/20"
              style={{ minHeight: '600px' }}
            />

            {gameOver && (
              <div className="text-center space-y-4 p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                <h2 className="text-2xl font-bold text-destructive">Game Over!</h2>
                <p className="text-muted-foreground">
                  Pontuação Final: <span className="font-bold text-primary">{score}</span>
                </p>
                {score > highScore && (
                  <p className="text-accent font-bold">🎉 Novo Recorde!</p>
                )}
                <Button onClick={handleReset}>Jogar Novamente</Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-border">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs text-muted-foreground">Foco Sustentado</div>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-border">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-muted-foreground">Tempo de Reação</div>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-border">
              <div className="text-2xl mb-1">🎮</div>
              <div className="text-xs text-muted-foreground">Coordenação Motora</div>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-border">
              <div className="text-2xl mb-1">🧠</div>
              <div className="text-xs text-muted-foreground">Processamento Visual</div>
            </div>
          </div>

          <div className="md:hidden text-center text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg p-4 border border-border">
            💡 Dica: Melhor jogado no desktop. Controles de toque em breve!
          </div>
        </div>
      </div>
    </div>
  );
}
