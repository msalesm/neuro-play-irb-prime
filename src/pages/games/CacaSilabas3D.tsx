import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { toast } from 'sonner';
import * as THREE from 'three';

// Game configuration
const CONFIG = {
  COLLECTION_DISTANCE: 2,
  PLAYER_SPEED: 5,
  COLLECTIBLE_FLOAT_SPEED: 2,
  COLLECTIBLE_FLOAT_AMOUNT: 0.3,
  COLLECTIBLE_ROTATION_SPEED: 2,
  CAMERA_HEIGHT: 10,
  CAMERA_DISTANCE: 15,
};

const SYLLABLE_COLORS = [
  0xff6b6b, // Red
  0x4ecdc4, // Teal
  0xffe66d, // Yellow
  0x95e1d3, // Mint
  0xf38181, // Pink
  0xaa96da, // Purple
];

const getSyllableColor = (index: number) => SYLLABLE_COLORS[index % SYLLABLE_COLORS.length];

// Collectible class
class Collectible {
  scene: THREE.Scene;
  syllable: string;
  index: number;
  collected: boolean;
  time: number;
  mesh: THREE.Group;
  platform: THREE.Mesh;
  ring: THREE.Mesh;
  textSprite: THREE.Sprite;
  animateCollection: ((deltaTime: number) => boolean) | null;

  constructor(scene: THREE.Scene, syllable: string, index: number, position: THREE.Vector3) {
    this.scene = scene;
    this.syllable = syllable;
    this.index = index;
    this.collected = false;
    this.time = Math.random() * Math.PI * 2;
    this.animateCollection = null;
    
    this.mesh = new THREE.Group();
    
    // Platform/base (hexagon)
    const platformGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 6);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: getSyllableColor(index),
      roughness: 0.3,
      metalness: 0.5,
      emissive: getSyllableColor(index),
      emissiveIntensity: 0.2
    });
    this.platform = new THREE.Mesh(platformGeometry, platformMaterial);
    this.platform.castShadow = true;
    this.mesh.add(this.platform);
    
    // Glow ring
    const ringGeometry = new THREE.TorusGeometry(0.9, 0.1, 8, 24);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: getSyllableColor(index),
      emissive: getSyllableColor(index),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6
    });
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.y = -0.1;
    this.mesh.add(this.ring);
    
    // Create text sprite
    this.textSprite = this.createTextSprite(syllable);
    this.textSprite.position.y = 0.8;
    this.mesh.add(this.textSprite);
    
    this.mesh.position.copy(position);
    this.mesh.position.y = 0.5;
    
    this.scene.add(this.mesh);
  }

  createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 256;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 120px Arial';
    context.fillStyle = '#333333';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 2, 1);
    
    return sprite;
  }

  update(deltaTime: number): void {
    if (this.collected) {
      if (this.animateCollection) {
        const complete = this.animateCollection(deltaTime);
        if (complete) {
          this.destroy();
        }
      }
      return;
    }
    
    this.time += deltaTime;
    
    const floatOffset = Math.sin(this.time * CONFIG.COLLECTIBLE_FLOAT_SPEED) * CONFIG.COLLECTIBLE_FLOAT_AMOUNT;
    this.mesh.position.y = 0.5 + floatOffset;
    
    this.mesh.rotation.y += CONFIG.COLLECTIBLE_ROTATION_SPEED * deltaTime;
    
    const pulseScale = 1 + Math.sin(this.time * 3) * 0.1;
    this.ring.scale.set(pulseScale, pulseScale, pulseScale);
  }

  checkCollection(playerPosition: THREE.Vector3): boolean {
    if (this.collected) return false;
    
    const distance = this.mesh.position.distanceTo(playerPosition);
    return distance < CONFIG.COLLECTION_DISTANCE;
  }

  collect(): void {
    this.collected = true;
    
    const startScale = this.mesh.scale.clone();
    const startY = this.mesh.position.y;
    const duration = 0.5;
    let elapsed = 0;
    
    this.animateCollection = (deltaTime: number): boolean => {
      elapsed += deltaTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const scale = startScale.x * (1 + progress * 0.5);
      this.mesh.scale.set(scale, scale, scale);
      
      this.mesh.position.y = startY + progress * 2;
      
      this.mesh.traverse((child) => {
        if ((child as THREE.Mesh).material) {
          const material = (child as THREE.Mesh).material as THREE.Material;
          material.transparent = true;
          material.opacity = 1 - progress;
        }
      });
      
      return progress >= 1;
    };
  }

  destroy(): void {
    this.scene.remove(this.mesh);
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}

// Word templates for different difficulty levels
const WORD_TEMPLATES = [
  // Level 1: Simple 2-syllable words
  [
    { word: 'BOLA', syllables: ['BO', 'LA'] },
    { word: 'CASA', syllables: ['CA', 'SA'] },
    { word: 'GATO', syllables: ['GA', 'TO'] },
    { word: 'PATO', syllables: ['PA', 'TO'] },
  ],
  // Level 2: 3-syllable words
  [
    { word: 'BANANA', syllables: ['BA', 'NA', 'NA'] },
    { word: 'CAVALO', syllables: ['CA', 'VA', 'LO'] },
    { word: 'MACACO', syllables: ['MA', 'CA', 'CO'] },
    { word: 'SAPATO', syllables: ['SA', 'PA', 'TO'] },
  ],
  // Level 3: Complex 3-4 syllable words
  [
    { word: 'BORBOLETA', syllables: ['BOR', 'BO', 'LE', 'TA'] },
    { word: 'HELICOPTER', syllables: ['HE', 'LI', 'CÓP', 'TE', 'RO'] },
    { word: 'CHOCOLATE', syllables: ['CHO', 'CO', 'LA', 'TE'] },
  ],
];

export default function CacaSilabas3D() {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Mesh | null>(null);
  const collectiblesRef = useRef<Collectible[]>([]);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  const { childProfileId, isTestMode, loading } = useGameProfile();
  const { 
    startSession, 
    updateSession, 
    endSession 
  } = useGameSession('caca-silabas-3d', childProfileId, isTestMode);

  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState<{ word: string; syllables: string[] } | null>(null);
  const [collectedSyllables, setCollectedSyllables] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState({ correct: 0, total: 0 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || loading) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, CONFIG.CAMERA_HEIGHT, CONFIG.CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x90ee90,
      roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Player (sphere)
    const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const playerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.5, 0);
    player.castShadow = true;
    scene.add(player);
    playerRef.current = player;

    // Start game session
    if (!isTestMode) {
      startSession().then(result => {
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId);
        }
      });
    }

    // Setup first word
    setupWord(1);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const deltaTime = clockRef.current.getDelta();

      // Update collectibles
      collectiblesRef.current.forEach(collectible => {
        collectible.update(deltaTime);
        
        if (!collectible.collected && playerRef.current) {
          if (collectible.checkCollection(playerRef.current.position)) {
            collectible.collect();
            handleSyllableCollect(collectible.syllable);
          }
        }
      });

      // Handle player movement
      if (playerRef.current) {
        const moveSpeed = CONFIG.PLAYER_SPEED * deltaTime;
        
        if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
          playerRef.current.position.z -= moveSpeed;
        }
        if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
          playerRef.current.position.z += moveSpeed;
        }
        if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
          playerRef.current.position.x -= moveSpeed;
        }
        if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
          playerRef.current.position.x += moveSpeed;
        }

        // Camera follow
        if (cameraRef.current) {
          cameraRef.current.position.x = playerRef.current.position.x;
          cameraRef.current.position.z = playerRef.current.position.z + CONFIG.CAMERA_DISTANCE;
          cameraRef.current.lookAt(playerRef.current.position);
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Timer
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [loading]);

  const setupWord = (difficulty: number) => {
    const levelIndex = Math.min(difficulty - 1, WORD_TEMPLATES.length - 1);
    const words = WORD_TEMPLATES[levelIndex];
    const word = words[Math.floor(Math.random() * words.length)];
    
    setCurrentWord(word);
    setCollectedSyllables([]);
    
    // Clear existing collectibles
    collectiblesRef.current.forEach(c => c.destroy());
    collectiblesRef.current = [];
    
    // Create new collectibles in a circle
    if (sceneRef.current) {
      const radius = 8;
      const shuffledSyllables = [...word.syllables].sort(() => Math.random() - 0.5);
      
      shuffledSyllables.forEach((syllable, index) => {
        const angle = (index / shuffledSyllables.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const collectible = new Collectible(
          sceneRef.current!,
          syllable,
          index,
          new THREE.Vector3(x, 0, z)
        );
        collectiblesRef.current.push(collectible);
      });
    }
  };

  const handleSyllableCollect = (syllable: string) => {
    setCollectedSyllables(prev => {
      const newCollected = [...prev, syllable];
      
      // Check if word is complete
      if (currentWord && newCollected.length === currentWord.syllables.length) {
        const collectedWord = newCollected.join('');
        const correctWord = currentWord.syllables.join('');
        
        if (collectedWord === correctWord) {
          toast.success(`Correto! ${currentWord.word}! 🎉`);
          setScore(prev => prev + 100);
          setAttempts(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
          
          // Next level
          setTimeout(() => {
            const nextLevel = level + 1;
            if (nextLevel > 10) {
              handleGameComplete();
            } else {
              setLevel(nextLevel);
              setupWord(nextLevel);
            }
          }, 1000);
        } else {
          toast.error('Ordem incorreta! Tente novamente.');
          setAttempts(prev => ({ ...prev, total: prev.total + 1 }));
          setupWord(level);
        }
      }
      
      return newCollected;
    });

    // Speak syllable
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGameComplete = async () => {
    setGameState('completed');
    
    if (!isTestMode) {
      const accuracy = attempts.total > 0 ? (attempts.correct / attempts.total) * 100 : 0;
      
      await endSession({
        score,
        accuracy,
        timeSpent: timeElapsed,
        correctMoves: attempts.correct,
        totalMoves: attempts.total,
      });
    }
    
    toast.success('Parabéns! Jogo completo! 🎊');
  };

  const handleExit = async () => {
    if (!isTestMode && sessionId) {
      const accuracy = attempts.total > 0 ? (attempts.correct / attempts.total) * 100 : 0;
      
      await endSession({
        score,
        accuracy,
        timeSpent: timeElapsed,
      });
    }
    navigate('/planeta-detalhes/lumen');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-yellow-50 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
          <h1 className="text-3xl font-bold">Parabéns!</h1>
          <div className="space-y-2">
            <p className="text-5xl font-bold text-primary">{score}</p>
            <p className="text-muted-foreground">Pontos totais</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">Nível alcançado</p>
              <p className="text-2xl">{level}</p>
            </div>
            <div>
              <p className="font-semibold">Precisão</p>
              <p className="text-2xl">
                {attempts.total > 0 ? Math.round((attempts.correct / attempts.total) * 100) : 0}%
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/planeta-detalhes/lumen')} className="w-full">
            Voltar ao Planeta Lumen
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleExit}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Caça Sílabas 3D</h1>
              <p className="text-sm text-muted-foreground">
                {currentWord && `Forme: ${currentWord.word}`}
              </p>
            </div>
            {isTestMode && (
              <Badge variant="secondary" className="ml-2">
                🎮 Modo Teste
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Nível</p>
              <p className="text-2xl font-bold">{level}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pontos</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {score}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="text-2xl font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {currentWord && (
        <div className="bg-white border-b p-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">Progresso:</p>
              <div className="flex gap-2 flex-1">
                {currentWord.syllables.map((syl, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                      idx < collectedSyllables.length
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {idx < collectedSyllables.length ? collectedSyllables[idx] : '?'}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                if (currentWord && 'speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(currentWord.word);
                  utterance.lang = 'pt-BR';
                  window.speechSynthesis.speak(utterance);
                }
              }}>
                <Volume2 className="w-4 h-4 mr-2" />
                Ouvir palavra
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <p className="font-semibold mb-2">Controles:</p>
          <div className="text-sm space-y-1">
            <p>⬆️ W ou Seta Cima: Mover para frente</p>
            <p>⬇️ S ou Seta Baixo: Mover para trás</p>
            <p>⬅️ A ou Seta Esquerda: Mover para esquerda</p>
            <p>➡️ D ou Seta Direita: Mover para direita</p>
          </div>
        </div>
      </div>
    </div>
  );
}
