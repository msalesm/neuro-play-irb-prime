import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Cloud, CloudRain, Sun, CloudSnow, Zap, Wind, 
  Thermometer, Umbrella, Eye, Heart, Home, 
  Play, Pause, RotateCcw, Settings, Trophy 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type EmotionType = 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited';
type WeatherPattern = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy';

interface EmotionalWeather {
  emotion: EmotionType;
  intensity: number; // 0-100
  weather: WeatherPattern;
  description: string;
  color: string;
  tools: string[];
}

interface WeatherTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  effectiveness: { [key in EmotionType]: number }; // 0-100
  color: string;
}

interface EmotionalForecast {
  current: EmotionalWeather;
  next3Hours: EmotionalWeather[];
  triggers: string[];
  patterns: string[];
}

const emotionalWeatherTypes: { [key in EmotionType]: EmotionalWeather } = {
  happy: {
    emotion: 'happy',
    intensity: 80,
    weather: 'sunny',
    description: 'Céu claro com muita energia positiva',
    color: 'from-yellow-300 to-orange-300',
    tools: ['Compartilhamento Social', 'Gratidão', 'Exercício']
  },
  sad: {
    emotion: 'sad',
    intensity: 60,
    weather: 'rainy',
    description: 'Chuva suave com nuvens carregadas',
    color: 'from-blue-400 to-gray-500',
    tools: ['Guarda-chuva da Respiração', 'Aquecimento Emocional', 'Apoio Social']
  },
  angry: {
    emotion: 'angry',
    intensity: 85,
    weather: 'stormy',
    description: 'Tempestade intensa com raios e trovões',
    color: 'from-red-500 to-orange-600',
    tools: ['Para-raios da Calma', 'Resfriamento', 'Canalização de Energia']
  },
  anxious: {
    emotion: 'anxious',
    intensity: 70,
    weather: 'windy',
    description: 'Vento forte com nuvens em movimento',
    color: 'from-gray-400 to-blue-400',
    tools: ['Âncora da Respiração', 'Abrigo Seguro', 'Mindfulness']
  },
  calm: {
    emotion: 'calm',
    intensity: 40,
    weather: 'cloudy',
    description: 'Nuvens suaves com brisa tranquila',
    color: 'from-blue-200 to-green-200',
    tools: ['Manutenção da Paz', 'Observação', 'Meditação']
  },
  excited: {
    emotion: 'excited',
    intensity: 90,
    weather: 'sunny',
    description: 'Sol brilhante com rajadas de energia',
    color: 'from-yellow-400 to-pink-400',
    tools: ['Canalização Criativa', 'Foco Direcionado', 'Celebração']
  }
};

const weatherTools: WeatherTool[] = [
  {
    id: 'breathing_umbrella',
    name: 'Guarda-chuva da Respiração',
    icon: <Umbrella className="h-6 w-6" />,
    description: 'Protege contra chuvas emocionais com respiração profunda',
    effectiveness: {
      happy: 20, sad: 85, angry: 60, anxious: 90, calm: 30, excited: 40
    },
    color: 'bg-blue-500'
  },
  {
    id: 'calm_lightning_rod',
    name: 'Para-raios da Calma',
    icon: <Zap className="h-6 w-6" />,
    description: 'Direciona a energia intensa de forma segura',
    effectiveness: {
      happy: 30, sad: 40, angry: 95, anxious: 70, calm: 20, excited: 80
    },
    color: 'bg-purple-500'
  },
  {
    id: 'emotional_thermometer',
    name: 'Termômetro Emocional',
    icon: <Thermometer className="h-6 w-6" />,
    description: 'Monitora a temperatura das suas emoções',
    effectiveness: {
      happy: 60, sad: 60, angry: 80, anxious: 85, calm: 40, excited: 70
    },
    color: 'bg-red-500'
  },
  {
    id: 'wind_anchor',
    name: 'Âncora do Vento',
    icon: <Wind className="h-6 w-6" />,
    description: 'Oferece estabilidade em tempestades emocionais',
    effectiveness: {
      happy: 25, sad: 70, angry: 60, anxious: 95, calm: 50, excited: 65
    },
    color: 'bg-green-500'
  },
  {
    id: 'sunshine_lens',
    name: 'Lentes do Sol',
    icon: <Eye className="h-6 w-6" />,
    description: 'Ajuda a ver o lado positivo mesmo em dias nublados',
    effectiveness: {
      happy: 90, sad: 80, angry: 50, anxious: 60, calm: 70, excited: 85
    },
    color: 'bg-yellow-500'
  },
  {
    id: 'warmth_generator',
    name: 'Gerador de Calor',
    icon: <Heart className="h-6 w-6" />,
    description: 'Aquece o coração em dias frios e tristes',
    effectiveness: {
      happy: 80, sad: 90, angry: 40, anxious: 65, calm: 60, excited: 75
    },
    color: 'bg-pink-500'
  }
];

export default function EmotionalWeather() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('calm');
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [activeTool, setActiveTool] = useState<WeatherTool | null>(null);
  const [toolEffectiveness, setToolEffectiveness] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState<{emotion: EmotionType, intensity: number, timestamp: number}[]>([]);
  const [dailyPattern, setDailyPattern] = useState<EmotionType[]>([]);
  const [selfRegulationScore, setSelfRegulationScore] = useState(0);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  
  // Weather visualization
  const [weatherAnimation, setWeatherAnimation] = useState(true);
  const [forecastMode, setForecastMode] = useState(false);
  
  const weatherCanvasRef = useRef<HTMLDivElement>(null);

  const currentWeather = emotionalWeatherTypes[currentEmotion];

  // Session timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
        // Simulate natural emotion fluctuation
        if (Math.random() < 0.1) { // 10% chance per second
          simulateEmotionalChange();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  // Track emotion patterns
  useEffect(() => {
    if (isPlaying) {
      setEmotionHistory(prev => [
        ...prev.slice(-20), // Keep last 20 entries
        { emotion: currentEmotion, intensity: emotionIntensity, timestamp: Date.now() }
      ]);
    }
  }, [currentEmotion, emotionIntensity, isPlaying]);

  const simulateEmotionalChange = () => {
    const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited'];
    const weights = activeTool ? 
      emotions.map(e => activeTool.effectiveness[e] / 100) :
      emotions.map(() => 1);
    
    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < emotions.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        if (emotions[i] !== currentEmotion) {
          setCurrentEmotion(emotions[i]);
          setEmotionIntensity(Math.random() * 60 + 20); // 20-80 intensity
          
          toast({
            title: "🌦️ Mudança Climática Emocional",
            description: `O tempo mudou para ${emotionalWeatherTypes[emotions[i]].description}`,
          });
        }
        break;
      }
    }
  };

  const useTool = (tool: WeatherTool) => {
    if (!isPlaying) return;
    
    setActiveTool(tool);
    const effectiveness = tool.effectiveness[currentEmotion];
    setToolEffectiveness(effectiveness);
    
    // Apply tool effect
    setTimeout(() => {
      const improvement = Math.round(effectiveness * 0.3); // 30% of effectiveness as improvement
      setEmotionIntensity(prev => {
        const newIntensity = currentEmotion === 'angry' || currentEmotion === 'anxious' || currentEmotion === 'sad' ?
          Math.max(10, prev - improvement) : // Reduce negative emotions
          Math.min(100, prev + improvement); // Enhance positive emotions
        return newIntensity;
      });
      
      setSelfRegulationScore(prev => prev + Math.round(effectiveness / 10));
      setToolsUsed(prev => [...prev, tool.id]);
      
      toast({
        title: `🛠️ ${tool.name} Usado!`,
        description: `Efetividade: ${effectiveness}% • +${Math.round(effectiveness / 10)} pontos`,
      });
      
      // Tool duration
      setTimeout(() => {
        setActiveTool(null);
        setToolEffectiveness(0);
      }, 10000); // 10 seconds
    }, 2000);
  };

  const generateForecast = (): EmotionalForecast => {
    const current = { ...currentWeather, intensity: emotionIntensity };
    const next3Hours = [];
    
    // Generate prediction based on current state and history
    for (let i = 1; i <= 3; i++) {
      const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited'];
      const predictedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      next3Hours.push({
        ...emotionalWeatherTypes[predictedEmotion],
        intensity: Math.random() * 60 + 20
      });
    }
    
    return {
      current,
      next3Hours,
      triggers: [
        'Situações sociais desafiadoras',
        'Tarefas com prazo apertado',
        'Mudanças na rotina',
        'Interações conflituosas'
      ],
      patterns: [
        'Manhãs tendem a ser mais calmas',
        'Ansiedade aumenta antes de eventos',
        'Exercícios melhoram o humor',
        'Descanso adequado estabiliza emoções'
      ]
    };
  };

  const startSession = () => {
    setIsPlaying(true);
    setSessionTime(0);
    setEmotionHistory([]);
    setSelfRegulationScore(0);
    setToolsUsed([]);
    setCurrentEmotion('calm');
    setEmotionIntensity(50);
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setSessionTime(0);
    setEmotionHistory([]);
    setSelfRegulationScore(0);
    setToolsUsed([]);
    setActiveTool(null);
  };

  const completeSession = async () => {
    if (!user || sessionTime < 60) return; // Minimum 1 minute
    
    try {
      // Calculate session metrics
      const emotionVariability = new Set(emotionHistory.map(h => h.emotion)).size;
      const averageIntensity = emotionHistory.reduce((sum, h) => sum + h.intensity, 0) / emotionHistory.length;
      const toolsDiversity = new Set(toolsUsed).size;
      
      // NOTE: Emotional session data not persisted — needs useGameSession integration
      console.debug('[EmotionalWeather] Session data:', { emotionHistory, toolsUsed, selfRegulationScore });

      // Record activity
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'emotional_weather',
        topic_name: 'Regulação Emocional',
        content: `Pontuação: ${selfRegulationScore} • Ferramentas: ${toolsDiversity} • Tempo: ${Math.round(sessionTime / 60)}min`
      });

      toast({
        title: "🏆 Sessão de Clima Emocional Completa!",
        description: `Score: ${selfRegulationScore} • Ferramentas usadas: ${toolsDiversity} • Padrões identificados: ${emotionVariability}`,
      });

      resetSession();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro ao salvar sessão",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const changeEmotion = (emotion: EmotionType) => {
    if (!isPlaying) {
      setCurrentEmotion(emotion);
    }
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
              Para acessar o Emotional Weather, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const forecast = generateForecast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Emotional Weather
            </h1>
            <p className="text-sky-700">
              Navegue suas emoções como um meteorologista expert
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
          {/* Main Weather Station */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Weather Display */}
            <Card className="shadow-glow bg-white/90 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-6 w-6 text-sky-600" />
                    Estação Meteorológica Emocional
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={forecastMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForecastMode(!forecastMode)}
                    >
                      📊 Previsão
                    </Button>
                    <Badge className="bg-sky-100 text-sky-800">
                      Intensidade: {emotionIntensity}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Weather Visualization */}
                <div 
                  ref={weatherCanvasRef}
                  className={`relative w-full h-80 bg-gradient-to-br ${currentWeather.color} rounded-lg border-2 border-sky-300 overflow-hidden transition-all duration-1000`}
                >
                  {/* Weather Effects */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white bg-black/20 rounded-lg p-6 backdrop-blur-sm">
                      <div className="text-6xl mb-4">
                        {currentWeather.weather === 'sunny' && '☀️'}
                        {currentWeather.weather === 'cloudy' && '☁️'}
                        {currentWeather.weather === 'rainy' && '🌧️'}
                        {currentWeather.weather === 'stormy' && '⛈️'}
                        {currentWeather.weather === 'snowy' && '🌨️'}
                        {currentWeather.weather === 'windy' && '💨'}
                      </div>
                      <h3 className="text-2xl font-bold mb-2 capitalize">{currentEmotion}</h3>
                      <p className="text-lg">{currentWeather.description}</p>
                    </div>
                  </div>

                  {/* Active Tool Display */}
                  {activeTool && (
                    <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded ${activeTool.color} text-white`}>
                          {activeTool.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{activeTool.name}</p>
                          <p className="text-xs text-muted-foreground">Efetividade: {toolEffectiveness}%</p>
                        </div>
                      </div>
                      <Progress value={toolEffectiveness} className="h-2" />
                    </div>
                  )}

                  {/* Intensity Meter */}
                  <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3">
                    <p className="text-sm font-semibold mb-2">Intensidade Emocional</p>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <div className="w-24">
                        <Progress value={emotionIntensity} className="h-2" />
                      </div>
                      <span className="text-sm font-mono">{emotionIntensity}%</span>
                    </div>
                  </div>
                </div>

                {/* Weather Controls */}
                <div className="mt-6 space-y-4">
                  {/* Emotion Selector (when not playing) */}
                  {!isPlaying && (
                    <div>
                      <p className="text-sm font-semibold mb-3">Selecione sua emoção atual:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(emotionalWeatherTypes).map(([emotion, weather]) => (
                          <Button
                            key={emotion}
                            variant={currentEmotion === emotion ? "default" : "outline"}
                            size="sm"
                            onClick={() => changeEmotion(emotion as EmotionType)}
                            className="capitalize"
                          >
                            {weather.weather === 'sunny' && '☀️'}
                            {weather.weather === 'cloudy' && '☁️'}
                            {weather.weather === 'rainy' && '🌧️'}
                            {weather.weather === 'stormy' && '⛈️'}
                            {weather.weather === 'snowy' && '🌨️'}
                            {weather.weather === 'windy' && '💨'}
                            {emotion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intensity Slider */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Ajustar Intensidade: {emotionIntensity}%
                    </p>
                    <Slider
                      value={[emotionIntensity]}
                      onValueChange={(value) => setEmotionIntensity(value[0])}
                      disabled={isPlaying}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Session Controls */}
                  <div className="flex justify-center gap-4">
                    {!isPlaying ? (
                      <Button onClick={startSession} size="lg" className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Iniciar Estação
                      </Button>
                    ) : (
                      <Button onClick={pauseSession} variant="secondary" size="lg" className="flex items-center gap-2">
                        <Pause className="h-5 w-5" />
                        Pausar
                      </Button>
                    )}
                    <Button onClick={resetSession} variant="outline" size="lg" className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5" />
                      Reiniciar
                    </Button>
                    {sessionTime >= 60 && (
                      <Button onClick={completeSession} size="lg" className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700">
                        <Trophy className="h-5 w-5" />
                        Completar Sessão
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather Tools */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-sky-600" />
                  Ferramentas Meteorológicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {weatherTools.map((tool) => {
                    const effectiveness = tool.effectiveness[currentEmotion];
                    const isActive = activeTool?.id === tool.id;
                    
                    return (
                      <Button
                        key={tool.id}
                        variant={isActive ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col items-center gap-2 ${
                          isActive ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        onClick={() => useTool(tool)}
                        disabled={!isPlaying || isActive}
                      >
                        <div className={`p-2 rounded ${tool.color} text-white`}>
                          {tool.icon}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-xs">{tool.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Efetividade: {effectiveness}%
                          </p>
                          {isActive && (
                            <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                              Ativo
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Session */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-sky-600" />
                  Sessão Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Autorregulação</span>
                    <Badge variant="secondary">{selfRegulationScore}</Badge>
                  </div>
                  <Progress value={(selfRegulationScore / 500) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo de Sessão</span>
                    <span className="text-sm font-mono">
                      {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ferramentas Usadas</span>
                    <span className="text-sm">{new Set(toolsUsed).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emotional Forecast */}
            {forecastMode && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Previsão Emocional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Próximas 3 horas:</p>
                    {forecast.next3Hours.map((weather, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>+{index + 1}h</span>
                        <div className="flex items-center gap-2">
                          <span>
                            {weather.weather === 'sunny' && '☀️'}
                            {weather.weather === 'cloudy' && '☁️'}
                            {weather.weather === 'rainy' && '🌧️'}
                            {weather.weather === 'stormy' && '⛈️'}
                            {weather.weather === 'snowy' && '🌨️'}
                            {weather.weather === 'windy' && '💨'}
                          </span>
                          <span className="capitalize">{weather.emotion}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(weather.intensity)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold mb-2">Gatilhos Identificados:</p>
                    {forecast.triggers.slice(0, 2).map((trigger, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {trigger}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emotion History */}
            {emotionHistory.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Histórico Emocional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {emotionHistory.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{entry.emotion}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={entry.intensity} className="w-16 h-1" />
                          <span className="text-xs text-muted-foreground">
                            {entry.intensity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Sobre o Jogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Desenvolve autorregulação emocional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>Aumenta autoconsciência</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Ensina estratégias de enfrentamento</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}