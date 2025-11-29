import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameSession } from '@/hooks/useGameSession';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';

const GAME_STATE_PLAYING = 0;
const GAME_STATE_GAMEOVER = 1;
const BLOCK_HEIGHT = 2;
const INITIAL_BLOCK_SIZE = 10;
const INITIAL_SPEED = 0.12;
const SPEED_INCREMENT = 0.025;
const SPEED_INCREASE_EVERY = 8;
const PERFECT_EPSILON = 0.05;
const MAX_COMEBACK_SIZE = 10;
const STREAK_FOR_COMEBACK = 3;
const CAMERA_OFFSET_Y = 18;
const CAMERA_OFFSET_Z = 22;

export function StackTowerGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const {
    startSession,
    updateSession,
    endSession,
    isActive
  } = useGameSession('stack-tower');

  useEffect(() => {
    if (!containerRef.current) return;

    const game = initializeGame(containerRef.current, {
      onScoreUpdate: (newScore: number) => {
        setScore(newScore);
        if (isActive) {
          updateSession({
            score: newScore,
            correct_attempts: newScore,
            total_attempts: newScore + 1
          });
        }
      },
      onGameOver: (finalScore: number, newHighScore: number) => {
        setScore(finalScore);
        setHighScore(newHighScore);
        setGameOver(true);
        if (isActive) {
          endSession({
            score: finalScore,
            completed: true,
            session_data: { finalScore, highScore: newHighScore }
          });
        }
      },
      onGameStart: () => {
        setGameOver(false);
        startSession({ difficulty_level: 1 });
      }
    });

    gameRef.current = game;

    return () => {
      game.cleanup();
    };
  }, []);

  const handlePauseToggle = () => {
    if (gameRef.current) {
      gameRef.current.togglePause();
      setIsPaused(!isPaused);
    }
  };

  const handleReset = () => {
    if (gameRef.current) {
      gameRef.current.reset();
      setGameOver(false);
      setScore(0);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Game Controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePauseToggle}
          disabled={gameOver}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Score Display */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <div className="text-6xl font-bold text-white drop-shadow-lg">
          {score}
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 bg-black/50 p-8 rounded-lg backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
          <p className="text-2xl text-white mb-2">Score: {score}</p>
          <p className="text-xl text-white/80 mb-6">High Score: {highScore}</p>
          <Button onClick={handleReset} size="lg">
            Jogar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}

function initializeGame(container: HTMLDivElement, callbacks: any) {
  let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.OrthographicCamera;
  let blocks: any[] = [];
  let cutPieces: any[] = [];
  let activeBlock: any = null;
  let direction = 1;
  let moveAxis = 'x';
  let blockSpeed = INITIAL_SPEED;
  let score = 0;
  let highScore = 0;
  let gameState = GAME_STATE_PLAYING;
  let perfectStreak = 0;
  let flashMesh: THREE.Line | null = null;
  let flashTimer = 0;
  let isPaused = false;
  let animationId: number;

  const backgroundColor = new THREE.Color();
  const baseHue = 170;
  const topHue = 320;

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  function getGradientColor(t: number) {
    const h = lerp(baseHue, topHue, t);
    backgroundColor.setHSL(h / 360, 0.55, 0.65);
    return backgroundColor.getStyle();
  }

  function createBlock(width: number, depth: number, y: number, color: number, x = 0, z = 0) {
    const geometry = new THREE.BoxGeometry(width, BLOCK_HEIGHT, depth);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function getBlockColor(idx: number, total: number) {
    const t = total <= 1 ? 0 : idx / (total - 1);
    const h = lerp(baseHue, topHue, t);
    const c = new THREE.Color();
    c.setHSL(h / 360, 0.13 + t * 0.13, 1 - t * 0.25);
    return c.getHex();
  }

  function setupTower() {
    const color = getBlockColor(0, 16);
    const mesh = createBlock(INITIAL_BLOCK_SIZE, INITIAL_BLOCK_SIZE, BLOCK_HEIGHT / 2, color);
    scene.add(mesh);
    blocks.push({
      mesh,
      width: INITIAL_BLOCK_SIZE,
      depth: INITIAL_BLOCK_SIZE,
      x: 0,
      z: 0,
      y: BLOCK_HEIGHT / 2
    });
  }

  function spawnNextBlock() {
    if (gameState !== GAME_STATE_PLAYING) return;
    
    const prev = blocks[blocks.length - 1];
    let width = prev.width;
    let depth = prev.depth;
    let x = prev.x, z = prev.z;
    const color = getBlockColor(blocks.length, 16);
    const y = prev.y + BLOCK_HEIGHT;
    
    if (moveAxis === 'x') {
      x = -18 * direction;
    } else {
      z = -18 * direction;
    }
    
    const mesh = createBlock(width, depth, y, color, x, z);
    scene.add(mesh);
    
    activeBlock = {
      mesh,
      width,
      depth,
      x,
      z,
      y,
      direction,
      moveAxis,
      speed: blockSpeed,
      state: 'sliding'
    };
  }

  function dropActiveBlock() {
    if (!activeBlock || activeBlock.state !== 'sliding' || gameState !== GAME_STATE_PLAYING) return;
    
    activeBlock.state = 'dropping';
    const prev = blocks[blocks.length - 1];
    let overlap: number;
    const axis = activeBlock.moveAxis;
    let perfect = false;
    let offset = 0;

    if (axis === 'x') {
      offset = activeBlock.x - prev.x;
      overlap = activeBlock.width - Math.abs(offset);
      if (Math.abs(offset) < PERFECT_EPSILON) {
        perfect = true;
        overlap = activeBlock.width;
      }
      if (overlap <= 0) {
        missBlock();
        return;
      }
      if (!perfect) {
        activeBlock.width = overlap;
        activeBlock.x = prev.x + offset / 2;
      }
    } else {
      offset = activeBlock.z - prev.z;
      overlap = activeBlock.depth - Math.abs(offset);
      if (Math.abs(offset) < PERFECT_EPSILON) {
        perfect = true;
        overlap = activeBlock.depth;
      }
      if (overlap <= 0) {
        missBlock();
        return;
      }
      if (!perfect) {
        activeBlock.depth = overlap;
        activeBlock.z = prev.z + offset / 2;
      }
    }

    if (perfect) {
      perfectStreak++;
      if (perfectStreak >= STREAK_FOR_COMEBACK) {
        if (axis === 'x') {
          activeBlock.width = Math.min(MAX_COMEBACK_SIZE, INITIAL_BLOCK_SIZE);
        } else {
          activeBlock.depth = Math.min(MAX_COMEBACK_SIZE, INITIAL_BLOCK_SIZE);
        }
        perfectStreak = 0;
      }
    } else {
      perfectStreak = 0;
    }

    activeBlock.mesh.scale.set(
      activeBlock.width / INITIAL_BLOCK_SIZE,
      1,
      activeBlock.depth / INITIAL_BLOCK_SIZE
    );
    activeBlock.mesh.position.set(activeBlock.x, activeBlock.y, activeBlock.z);

    blocks.push({
      mesh: activeBlock.mesh,
      width: activeBlock.width,
      depth: activeBlock.depth,
      x: activeBlock.x,
      z: activeBlock.z,
      y: activeBlock.y
    });

    activeBlock = null;
    score++;
    callbacks.onScoreUpdate(score);
    
    if (score % SPEED_INCREASE_EVERY === 0) blockSpeed += SPEED_INCREMENT;
    direction *= -1;
    moveAxis = moveAxis === 'x' ? 'z' : 'x';
    
    setTimeout(() => spawnNextBlock(), 130);
  }

  function missBlock() {
    activeBlock.state = 'falling';
    activeBlock.fallVelocity = -0.7;
    if (score > highScore) {
      highScore = score;
    }
    gameState = GAME_STATE_GAMEOVER;
    callbacks.onGameOver(score, highScore);
  }

  function animate(time: number) {
    animationId = requestAnimationFrame(animate);
    
    if (isPaused) return;

    if (activeBlock && activeBlock.state === 'sliding') {
      const bound = 18;
      if (activeBlock.moveAxis === 'x') {
        activeBlock.x += activeBlock.speed * activeBlock.direction;
        if (activeBlock.x > bound || activeBlock.x < -bound) {
          activeBlock.direction *= -1;
          activeBlock.x = Math.max(-bound, Math.min(bound, activeBlock.x));
        }
        activeBlock.mesh.position.x = activeBlock.x;
      } else {
        activeBlock.z += activeBlock.speed * activeBlock.direction;
        if (activeBlock.z > bound || activeBlock.z < -bound) {
          activeBlock.direction *= -1;
          activeBlock.z = Math.max(-bound, Math.min(bound, activeBlock.z));
        }
        activeBlock.mesh.position.z = activeBlock.z;
      }
    }

    if (activeBlock && activeBlock.state === 'falling') {
      activeBlock.mesh.position.y += activeBlock.fallVelocity;
      activeBlock.fallVelocity -= 0.04;
    }

    if (blocks.length > 0) {
      const topY = blocks[blocks.length - 1].y;
      camera.position.y = lerp(camera.position.y, topY + CAMERA_OFFSET_Y, 0.08);
      camera.position.z = lerp(camera.position.z, CAMERA_OFFSET_Z + Math.max(0, (blocks.length - 12) * 0.5), 0.08);
    }

    if (score > 0) {
      const t = Math.min(1, score / 30);
      const col = getGradientColor(t);
      renderer.setClearColor(col);
    }

    renderer.render(scene, camera);
  }

  function onUserInput() {
    if (gameState === GAME_STATE_PLAYING && !isPaused) {
      dropActiveBlock();
    }
  }

  function resetGame() {
    while (blocks.length) {
      const b = blocks.pop();
      scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
    }
    if (activeBlock) {
      scene.remove(activeBlock.mesh);
      activeBlock.mesh.geometry.dispose();
      activeBlock.mesh.material.dispose();
      activeBlock = null;
    }
    score = 0;
    blockSpeed = INITIAL_SPEED;
    perfectStreak = 0;
    direction = 1;
    moveAxis = 'x';
    gameState = GAME_STATE_PLAYING;
    backgroundColor.setStyle(getGradientColor(0));
    renderer.setClearColor(backgroundColor);
    setupTower();
    spawnNextBlock();
    callbacks.onGameStart();
  }

  // Initialize Three.js
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  renderer.setClearColor(getGradientColor(0));

  camera = new THREE.OrthographicCamera(
    container.clientWidth / -32,
    container.clientWidth / 32,
    container.clientHeight / 32,
    container.clientHeight / -32,
    0.1,
    1000
  );
  camera.position.set(18, CAMERA_OFFSET_Y, CAMERA_OFFSET_Z);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.66);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.72);
  dirLight.position.set(8, 40, 16);
  scene.add(dirLight);

  const onResize = () => {
    if (!container) return;
    camera.left = container.clientWidth / -32;
    camera.right = container.clientWidth / 32;
    camera.top = container.clientHeight / 32;
    camera.bottom = container.clientHeight / -32;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onUserInput);
  renderer.domElement.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onUserInput();
  });

  setupTower();
  spawnNextBlock();
  animate(performance.now());

  return {
    togglePause: () => {
      isPaused = !isPaused;
    },
    reset: resetGame,
    cleanup: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onUserInput);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    }
  };
}
