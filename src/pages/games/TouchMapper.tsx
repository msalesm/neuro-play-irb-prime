import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Hand, Vibrate, Home, Settings } from "lucide-react";
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
  smooth: { name: 'Liso', color: 'bg-blue-200', description: 'Superfície lisa e uniforme' },
  rough: { name: 'Áspero', color: 'bg-yellow-300', description: 'Superfície irregular' },
  bumpy: { name: 'Com Relevos', color: 'bg-green-300', description: 'Pequenas elevações' },
  soft: { name: 'Macio', color: 'bg-pink-200', description: 'Textura suave' },
  rigid: { name: 'Rígido', color: 'bg-gray-300', description: 'Superfície firme' }
};

const sensitivityLevels = {
  low: { name: 'Baixa', multiplier: 2.0, vibrationIntensity: 0.8 },
  medium: { name: 'Média', multiplier: 1.0, vibrationIntensity: 0.5 },
  high: { name: 'Alta', multiplier: 0.5, vibrationIntensity: 0.3 }
};

export default function TouchMapper() {
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

  const currentSensitivity = sensitivityLevels[sensitivity];

  const generatePatterns = () => {
    const patternCount = Math.min(3 + Math.floor(level / 2), 8);
    const types = Object.keys(textureTypes) as Array<keyof typeof textureTypes>;
    
    const patterns: TexturePattern[] = Array.from({ length: patternCount }, (_, index) => ({
      id: index,
      type: types[Math.floor(Math.random() * types.length)],
      intensity: Math.random() * 0.7 + 0.3, // 0.3 to 1.0
      position: {
        x: Math.random() * 300 + 50, // Keep patterns within bounds
        y: Math.random() * 200 + 50
      },
      size: Math.random() * 40 + 30, // 30 to 70px
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
    
    const patterns = generatePatterns();
    setCurrentPatterns(patterns);
    
    toast({
      title: "🖐️ Explore com o toque!",
      description: "Use o mouse para descobrir diferentes texturas",
    });
  };

  const handleExploration = (x: number, y: number) => {
    if (!isPlaying) return;
    
    setExplorationsCount(prev => prev + 1);
    
    // Check if exploration hits a pattern
    const hitPattern = currentPatterns.find(pattern => 
      !pattern.discovered &&
      Math.abs(pattern.position.x - x) < pattern.size / 2 &&
      Math.abs(pattern.position.y - y) < pattern.size / 2
    );

    if (hitPattern) {
      // Provide haptic feedback (vibration if supported)
      if ('vibrate' in navigator) {
        const vibrationIntensity = Math.round(
          hitPattern.intensity * currentSensitivity.vibrationIntensity * 200
        );
        navigator.vibrate(vibrationIntensity);
      }

      // Mark pattern as discovered
      setCurrentPatterns(prev => 
        prev.map(p => p.id === hitPattern.id ? { ...p, discovered: true } : p)
      );
      
      setDiscoveredPatterns(prev => [...prev, hitPattern]);
      
      // Update score based on sensitivity and pattern complexity
      const baseScore = 10;
      const sensitivityBonus = sensitivity === 'high' ? 20 : sensitivity === 'medium' ? 10 : 5;
      const intensityBonus = Math.round(hitPattern.intensity * 15);
      
      setScore(prev => prev + baseScore + sensitivityBonus + intensityBonus);
      setCurrentTexture(textureTypes[hitPattern.type].name);
      
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
    }
  };

  const levelComplete = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    
    // Calculate accuracy based on exploration efficiency
    const efficiency = currentPatterns.length / explorationsCount;
    const newAccuracy = Math.min(100, efficiency * 100);
    setAccuracy(prev => (prev + newAccuracy) / 2);
    
    toast({
      title: `🎯 Nível ${newLevel} desbloqueado!`,
      description: `Todas as texturas mapeadas! Eficiência: ${(efficiency * 100).toFixed(1)}%`,
    });
    
    // Generate new patterns for next level
    setTimeout(() => {
      const patterns = generatePatterns();
      setCurrentPatterns(patterns);
      setDiscoveredPatterns([]);
      setExplorationsCount(0);
    }, 2000);
  };

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
          explorations_count: explorationsCount
        },
        session_duration_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('touch_mapper_sessions')
        .insert(sessionData);

      if (error) throw error;

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 text-orange-900">
              TouchMapper
            </h1>
            <p className="text-orange-700">
              Desenvolva seu processamento tátil explorando texturas virtuais
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/games" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sensitivity Settings */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Sensibilidade:</span>
                    </div>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tolerância:</span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-20"
                      disabled={isPlaying}
                    />
                    <span className="text-sm font-medium">{tolerance}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-glow bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-6 w-6 text-orange-600" />
                  Mapeamento Tátil - Nível {level}
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="text-orange-600 font-medium">Score: {score}</span>
                  <span className="text-blue-600 font-medium">Precisão: {accuracy.toFixed(1)}%</span>
                  <span className="text-green-600 font-medium">
                    Descobertas: {discoveredPatterns.length}/{currentPatterns.length}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Current Texture Display */}
                {currentTexture && (
                  <div className="text-center mb-4">
                    <Badge className="bg-orange-100 text-orange-800 text-lg px-4 py-2">
                      <Vibrate className="h-4 w-4 mr-2" />
                      {currentTexture}
                    </Badge>
                  </div>
                )}

                {/* Exploration Area */}
                <div 
                  className="relative w-full h-96 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg border-4 border-orange-300 overflow-hidden cursor-crosshair select-none"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    handleExploration(x, y);
                  }}
                  style={{
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(245, 101, 101, 0.1) 0%, transparent 50%),
                      linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)
                    `
                  }}
                >
                  {/* Texture Patterns */}
                  {currentPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className={`absolute rounded-full transition-all duration-300 ${
                        pattern.discovered
                          ? `${textureTypes[pattern.type].color} opacity-80 border-4 border-orange-400`
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
                        <div className="flex items-center justify-center h-full text-xs font-bold text-gray-700">
                          {textureTypes[pattern.type].name}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Instructions overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-orange-700 bg-white/80 p-6 rounded-lg">
                        <Hand className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                        <p className="text-xl font-semibold mb-2">Explore com o toque</p>
                        <p className="text-sm">Clique na área para descobrir texturas ocultas</p>
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
                        <Badge key={index} className={textureTypes[pattern.type].color}>
                          {textureTypes[pattern.type].name}
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
                    <Button onClick={saveSession} size="lg" className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
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
                    <span>Descobertas</span>
                    <span className="font-medium">{discoveredPatterns.length}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Explorações</span>
                    <span className="font-medium">{explorationsCount}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tolerância</span>
                    <span className="font-medium">{tolerance}%</span>
                  </div>
                  <Progress value={tolerance} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Como Jogar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>1. Clique na área de exploração</p>
                <p>2. Sinta a vibração quando encontrar texturas</p>
                <p>3. Descubra todas as texturas do nível</p>
                <p>4. Ajuste a sensibilidade conforme necessário</p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Benefícios Terapêuticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                  <span>Discriminação tátil</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                  <span>Dessensibilização gradual</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                  <span>Propriocepção</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                  <span>Integração sensorial</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}