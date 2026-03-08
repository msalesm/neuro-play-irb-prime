import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Hand, Keyboard, Home, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface TexturePattern {
  id: number;
  type: 'smooth' | 'rough' | 'bumpy' | 'soft' | 'rigid';
  intensity: number;
  position: { x: number; y: number };
  size: number;
  discovered: boolean;
}

type SensitivityLevel = 'low' | 'medium' | 'high';

const textureTypes = {
  smooth: { name: 'Liso', color: 'bg-primary/30', description: 'Superfície lisa e uniforme', symbol: '▓' },
  rough: { name: 'Áspero', color: 'bg-warning/40', description: 'Superfície irregular', symbol: '▒' },
  bumpy: { name: 'Com Relevos', color: 'bg-success/40', description: 'Pequenas elevações', symbol: '░' },
  soft: { name: 'Macio', color: 'bg-destructive/20', description: 'Textura suave', symbol: '▪' },
  rigid: { name: 'Rígido', color: 'bg-muted', description: 'Superfície firme', symbol: '▫' }
};

const sensitivityLevels = {
  low: { name: 'Baixa', multiplier: 2.0, detectionRange: 60 },
  medium: { name: 'Média', multiplier: 1.0, detectionRange: 40 },
  high: { name: 'Alta', multiplier: 0.5, detectionRange: 25 }
};

export default function TouchMapperKeyboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentPatterns, setCurrentPatterns] = useState<TexturePattern[]>([]);
  const [discoveredPatterns, setDiscoveredPatterns] = useState<TexturePattern[]>([]);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');
  const [tolerance, setTolerance] = useState(50);
  const [accuracy, setAccuracy] = useState(100);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [explorationsCount, setExplorationsCount] = useState(0);
  const [currentTexture, setCurrentTexture] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 200, y: 150 });

  const currentSensitivity = sensitivityLevels[sensitivity];
  const gridSize = 20; // Size of each grid cell for movement

  const generatePatterns = () => {
    const patternCount = Math.min(3 + Math.floor(level / 2), 8);
    const types = Object.keys(textureTypes) as Array<keyof typeof textureTypes>;
    
    const patterns: TexturePattern[] = Array.from({ length: patternCount }, (_, index) => ({
      id: index,
      type: types[Math.floor(Math.random() * types.length)],
      intensity: Math.random() * 0.7 + 0.3,
      position: {
        x: Math.floor(Math.random() * 15) * gridSize + 50, // Snap to grid
        y: Math.floor(Math.random() * 10) * gridSize + 50
      },
      size: Math.random() * 40 + 30,
      discovered: false
    }));

    return patterns;
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setAccuracy(100);
    setDiscoveredPatterns([]);
    setExplorationsCount(0);
    setSessionStartTime(Date.now());
    setCursorPosition({ x: 200, y: 150 });
    
    const patterns = generatePatterns();
    setCurrentPatterns(patterns);
    
    toast({
      title: "🎮 Use o teclado para explorar!",
      description: "WASD ou setas para mover, ESPAÇO para explorar",
    });
  };

  const handleMovement = useCallback((direction: string) => {
    if (!isPlaying) return;
    
    setCursorPosition(prev => {
      const newPos = { ...prev };
      const moveSpeed = gridSize;
      
      switch (direction) {
        case 'up':
          newPos.y = Math.max(25, prev.y - moveSpeed);
          break;
        case 'down':
          newPos.y = Math.min(275, prev.y + moveSpeed);
          break;
        case 'left':
          newPos.x = Math.max(25, prev.x - moveSpeed);
          break;
        case 'right':
          newPos.x = Math.min(375, prev.x + moveSpeed);
          break;
      }
      
      return newPos;
    });
  }, [isPlaying, gridSize]);

  const handleExploration = useCallback(() => {
    if (!isPlaying) return;
    
    setExplorationsCount(prev => prev + 1);
    
    // Check if exploration hits a pattern
    const hitPattern = currentPatterns.find(pattern => 
      !pattern.discovered &&
      Math.abs(pattern.position.x - cursorPosition.x) < currentSensitivity.detectionRange &&
      Math.abs(pattern.position.y - cursorPosition.y) < currentSensitivity.detectionRange
    );

    if (hitPattern) {
      // Visual feedback instead of vibration
      setCurrentTexture(textureTypes[hitPattern.type].name);

      // Mark pattern as discovered
      setCurrentPatterns(prev => 
        prev.map(p => p.id === hitPattern.id ? { ...p, discovered: true } : p)
      );
      
      setDiscoveredPatterns(prev => [...prev, hitPattern]);
      
      // Update score
      const baseScore = 10;
      const sensitivityBonus = sensitivity === 'high' ? 20 : sensitivity === 'medium' ? 10 : 5;
      const intensityBonus = Math.round(hitPattern.intensity * 15);
      
      setScore(prev => prev + baseScore + sensitivityBonus + intensityBonus);
      
      toast({
        title: `✋ Textura descoberta!`,
        description: `${textureTypes[hitPattern.type].name} - ${textureTypes[hitPattern.type].description}`,
      });

      // Check if all patterns discovered
      const totalDiscovered = discoveredPatterns.length + 1;
      if (totalDiscovered === currentPatterns.length) {
        levelComplete();
      }
      
      // Clear current texture display after 2 seconds
      setTimeout(() => setCurrentTexture(null), 2000);
    } else {
      // Provide proximity feedback
      const nearbyPattern = currentPatterns.find(pattern => 
        !pattern.discovered &&
        Math.abs(pattern.position.x - cursorPosition.x) < currentSensitivity.detectionRange * 1.5 &&
        Math.abs(pattern.position.y - cursorPosition.y) < currentSensitivity.detectionRange * 1.5
      );
      
      if (nearbyPattern) {
        toast({
          title: "🔍 Quase lá!",
          description: "Você está próximo de uma textura. Continue explorando!",
        });
      }
    }
  }, [isPlaying, cursorPosition, currentPatterns, discoveredPatterns, sensitivity, currentSensitivity]);

  const levelComplete = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    
    const efficiency = currentPatterns.length / explorationsCount;
    const newAccuracy = Math.min(100, efficiency * 100);
    setAccuracy(prev => (prev + newAccuracy) / 2);
    
    toast({
      title: `🎯 Nível ${newLevel} desbloqueado!`,
      description: `Todas as texturas mapeadas! Eficiência: ${(efficiency * 100).toFixed(1)}%`,
    });
    
    setTimeout(() => {
      const patterns = generatePatterns();
      setCurrentPatterns(patterns);
      setDiscoveredPatterns([]);
      setExplorationsCount(0);
    }, 2000);
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPlaying) return;
      
      event.preventDefault();
      
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          handleMovement('up');
          break;
        case 's':
        case 'arrowdown':
          handleMovement('down');
          break;
        case 'a':
        case 'arrowleft':
          handleMovement('left');
          break;
        case 'd':
        case 'arrowright':
          handleMovement('right');
          break;
        case ' ':
          handleExploration();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, handleMovement, handleExploration]);

  const saveSession = async () => {
    if (!user || discoveredPatterns.length < 1) return;

    try {
      const sessionData = {
        user_id: user.id,
        level: level,
        score: score,
        tactile_sensitivity_score: sensitivity === 'high' ? 100 : sensitivity === 'medium' ? 70 : 40,
        texture_recognition_accuracy: accuracy,
        pressure_tolerance_level: tolerance,
        spatial_discrimination_score: Math.round((discoveredPatterns.length / currentPatterns.length) * 100),
        haptic_patterns_completed: discoveredPatterns.map(p => ({
          type: p.type,
          intensity: p.intensity,
          position: p.position
        })),
        desensitization_progress: {
          sensitivity_level: sensitivity,
          tolerance_improvement: tolerance - 50,
          explorations_count: explorationsCount,
          input_method: 'keyboard'
        },
        session_duration_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
        completed_at: new Date().toISOString()
      };

      // TODO: Uncomment when touch_mapper_sessions table is created
      // const { error } = await supabase
      //   .from('touch_mapper_sessions')
      //   .insert(sessionData);
      // if (error) throw error;

      toast({
        title: "🖐️ Sessão salva!",
        description: `${discoveredPatterns.length} texturas mapeadas • ${accuracy.toFixed(1)}% precisão`,
      });
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setScore(0);
    setLevel(1);
    setAccuracy(100);
    setCurrentPatterns([]);
    setDiscoveredPatterns([]);
    setExplorationsCount(0);
    setCurrentTexture(null);
    setCursorPosition({ x: 200, y: 150 });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar este jogo, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning/10 to-destructive/10 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
             <h1 className="font-heading text-4xl font-bold mb-2 text-foreground flex items-center gap-3">
               <Keyboard className="w-10 h-10" />
               TouchMapper - Teclado
             </h1>
             <p className="text-muted-foreground">
               Versão adaptada para notebooks - Use WASD ou setas para navegar
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/games/touch-mapper" className="flex items-center gap-2">
                <Hand className="h-4 w-4" />
                Versão Mouse
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/games" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Keyboard Controls Guide */}
            <Card className="shadow-card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Keyboard className="h-6 w-6 text-primary" />
                     <div>
                       <h3 className="font-semibold text-primary mb-1">Controles do Teclado</h3>
                       <div className="flex gap-4 text-sm text-primary/80">
                        <div className="flex items-center gap-1">
                           <kbd className="px-2 py-1 bg-primary/10 rounded text-xs">WASD</kbd>
                           <span>ou</span>
                           <div className="flex gap-1">
                             <kbd className="px-1 py-1 bg-primary/10 rounded text-xs">↑</kbd>
                             <kbd className="px-1 py-1 bg-primary/10 rounded text-xs">↓</kbd>
                             <kbd className="px-1 py-1 bg-primary/10 rounded text-xs">←</kbd>
                             <kbd className="px-1 py-1 bg-primary/10 rounded text-xs">→</kbd>
                          </div>
                          <span>Mover</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-primary/10 rounded text-xs">ESPAÇO</kbd>
                          <span>Explorar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Sensibilidade:</span>
                    <div className="flex gap-2">
                      {Object.entries(sensitivityLevels).map(([key, config]) => (
                        <Button
                          key={key}
                          variant={sensitivity === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSensitivity(key as SensitivityLevel)}
                          disabled={isPlaying}
                        >
                          {config.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-glow bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Hand className="h-6 w-6 text-warning" />
                   Mapeamento Tátil - Nível {level}
                 </CardTitle>
                 <div className="flex gap-4 text-sm">
                   <span className="text-warning font-medium">Score: {score}</span>
                   <span className="text-info font-medium">Precisão: {accuracy.toFixed(1)}%</span>
                   <span className="text-success font-medium">
                     Descobertas: {discoveredPatterns.length}/{currentPatterns.length}
                   </span>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Current Texture Display */}
                {currentTexture && (
                  <div className="text-center mb-4">
                    <Badge className="bg-warning/10 text-warning text-lg px-4 py-2">
                      <Hand className="h-4 w-4 mr-2" />
                      {currentTexture}
                    </Badge>
                  </div>
                )}

                {/* Exploration Area */}
                <div 
                  className="relative w-full h-96 bg-gradient-to-b from-muted to-muted/80 rounded-lg border-4 border-warning/40 overflow-hidden select-none"
                  style={{
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(245, 101, 101, 0.1) 0%, transparent 50%),
                      linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)
                    `
                  }}
                >
                  {/* Grid overlay for better navigation */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-border"
                        style={{ left: `${(i + 1) * gridSize}px` }}
                      />
                    ))}
                    {Array.from({ length: 15 }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-border"
                        style={{ top: `${(i + 1) * gridSize}px` }}
                      />
                    ))}
                  </div>

                  {/* Cursor */}
                  <div
                     className="absolute w-6 h-6 bg-primary rounded-full border-2 border-primary-foreground shadow-lg transition-all duration-150 flex items-center justify-center"
                     style={{
                       left: cursorPosition.x - 12,
                       top: cursorPosition.y - 12,
                     }}
                   >
                     <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>

                  {/* Texture Patterns */}
                  {currentPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className={`absolute rounded-full transition-all duration-300 ${
                        pattern.discovered
                          ? `${textureTypes[pattern.type].color} opacity-80 border-4 border-warning`
                          : 'bg-transparent'
                      }`}
                      style={{
                        left: pattern.position.x - pattern.size / 2,
                        top: pattern.position.y - pattern.size / 2,
                        width: pattern.size,
                        height: pattern.size,
                        opacity: pattern.discovered ? 0.8 : 0,
                      }}
                    >
                      {pattern.discovered && (
                        <div className="flex items-center justify-center h-full text-xs font-bold text-foreground/70">
                          {textureTypes[pattern.type].symbol}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Instructions overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="text-center text-foreground bg-card/90 p-6 rounded-lg">
                         <Keyboard className="h-16 w-16 mx-auto mb-4 text-warning" />
                        <p className="text-xl font-semibold mb-2">Explore com o teclado</p>
                        <p className="text-sm mb-2">Use WASD ou setas para mover</p>
                        <p className="text-sm">Pressione ESPAÇO para explorar texturas</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Texture Legend */}
                {discoveredPatterns.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Texturas descobertas:</p>
                    <div className="flex gap-2 flex-wrap">
                      {discoveredPatterns.map((pattern, index) => (
                        <Badge key={index} className={`${textureTypes[pattern.type].color} text-foreground/80`}>
                          {textureTypes[pattern.type].symbol} {textureTypes[pattern.type].name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  {!isPlaying ? (
                    <Button onClick={startGame} size="lg" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Começar Exploração
                    </Button>
                  ) : (
                    <Button onClick={resetGame} variant="secondary" size="lg" className="flex items-center gap-2">
                      <Pause className="h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button onClick={resetGame} variant="outline" size="lg" className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reiniciar
                  </Button>
                  
                  {discoveredPatterns.length >= 3 && (
                    <Button onClick={saveSession} size="lg" className="flex items-center gap-2 bg-warning hover:bg-warning/90">
                      <Hand className="h-5 w-5" />
                      Concluir Sessão
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nível</span>
                    <span className="font-medium">{level}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Precisão</span>
                    <span className="font-medium">{accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Explorações</span>
                    <span className="font-medium">{explorationsCount}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Posição</span>
                    <span className="font-medium text-xs">
                      X:{Math.round(cursorPosition.x)} Y:{Math.round(cursorPosition.y)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Instructions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Como Jogar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <span>Use WASD ou setas para mover o cursor</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <span>Pressione ESPAÇO para explorar texturas</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <span>Encontre todas as texturas ocultas</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <span>Maior sensibilidade = mais desafio</span>
                </div>
              </CardContent>
            </Card>

            {/* Therapeutic Benefits */}
             <Card className="shadow-card bg-gradient-to-b from-success/10 to-accent/10 border-success/20">
               <CardHeader>
                 <CardTitle className="text-lg text-success">Benefícios Terapêuticos</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2 text-sm text-success/80">
                <div>• Desenvolve coordenação motora</div>
                <div>• Melhora processamento sensorial</div>
                <div>• Fortalece atenção espacial</div>
                <div>• Aumenta controle de movimento</div>
                <div>• Promove paciência e persistência</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}