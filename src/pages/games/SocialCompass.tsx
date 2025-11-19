import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, MessageCircle, Heart, Clock, ArrowRight, RotateCcw, 
  Compass, Brain, Smile, Meh, Frown, Eye, Pause, Home 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSocialScenarios } from "@/hooks/useSocialScenarios";
import { SocialScenariosProgress } from "@/components/SocialScenariosProgress";
import { SocialScenariosAchievements } from "@/components/SocialScenariosAchievements";

interface NPCEmotion {
  primary: 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'worried';
  intensity: number; // 1-10
  hidden?: string; // Hidden emotion that might be revealed
}

interface SocialContext {
  id: string;
  name: string;
  description: string;
  setting: 'school' | 'family' | 'friends' | 'public' | 'work';
  difficulty: 1 | 2 | 3 | 4 | 5;
  npcs: {
    id: string;
    name: string;
    role: string;
    emotion: NPCEmotion;
    bodyLanguage: string;
    dialogue: string;
  }[];
  socialGoal: string;
  timeLimit?: number; // seconds
}

interface EmotionRadar {
  detected: boolean;
  confidence: number;
  emotion: string;
  clues: string[];
}

const socialContexts: SocialContext[] = [
  {
    id: 'lunch_table',
    name: 'Mesa do Almoço',
    description: 'Você quer se juntar a um grupo durante o almoço na escola',
    setting: 'school',
    difficulty: 1,
    npcs: [
      {
        id: 'ana',
        name: 'Ana',
        role: 'Colega de classe',
        emotion: { primary: 'happy', intensity: 7 },
        bodyLanguage: 'Sorrindo, fazendo contato visual',
        dialogue: 'Oi! Como você está hoje?'
      },
      {
        id: 'carlos',
        name: 'Carlos',
        role: 'Amigo da Ana',
        emotion: { primary: 'neutral', intensity: 5, hidden: 'slightly worried about test' },
        bodyLanguage: 'Olhando para o livro, ocasionalmente para você',
        dialogue: 'Ei... estou meio preocupado com a prova de amanhã.'
      }
    ],
    socialGoal: 'Junte-se à conversa de forma natural e empática',
    timeLimit: 60
  },
  {
    id: 'family_dinner',
    name: 'Jantar em Família',
    description: 'Sua irmã parece chateada durante o jantar',
    setting: 'family',
    difficulty: 2,
    npcs: [
      {
        id: 'irma',
        name: 'Sofia (irmã)',
        role: 'Irmã mais nova',
        emotion: { primary: 'sad', intensity: 8, hidden: 'bullied at school' },
        bodyLanguage: 'Cabeça baixa, empurrando a comida no prato',
        dialogue: 'Não estou com fome...'
      },
      {
        id: 'mae',
        name: 'Mãe',
        role: 'Mãe',
        emotion: { primary: 'worried', intensity: 6 },
        bodyLanguage: 'Olhar preocupado entre você e sua irmã',
        dialogue: 'Sofia, você mal tocou na comida. Aconteceu algo na escola?'
      }
    ],
    socialGoal: 'Demonstre empatia e ofereça apoio à sua irmã',
    timeLimit: 90
  },
  {
    id: 'group_project',
    name: 'Trabalho em Grupo',
    description: 'Você precisa expressar suas ideias em um projeto de grupo',
    setting: 'school',
    difficulty: 3,
    npcs: [
      {
        id: 'leader',
        name: 'Miguel',
        role: 'Líder natural do grupo',
        emotion: { primary: 'neutral', intensity: 6 },
        bodyLanguage: 'Postura confiante, fazendo anotações',
        dialogue: 'Então, qual é a sua ideia para o projeto?'
      },
      {
        id: 'shy_student',
        name: 'Beatriz',
        role: 'Estudante tímida',
        emotion: { primary: 'worried', intensity: 7 },
        bodyLanguage: 'Evita contato visual, brinca com o lápis',
        dialogue: 'Eu... eu tinha uma ideia, mas não sei se é boa...'
      },
      {
        id: 'critic',
        name: 'João',
        role: 'Estudante crítico',
        emotion: { primary: 'angry', intensity: 4, hidden: 'stressed about grades' },
        bodyLanguage: 'Braços cruzados, expressão séria',
        dialogue: 'Precisamos de algo realmente bom. Não podemos errar neste projeto.'
      }
    ],
    socialGoal: 'Comunique suas ideias assertivamente e inclua todos na discussão'
  }
];

const emotionIcons = {
  happy: { icon: <Smile className="h-6 w-6 text-green-500" />, color: 'text-green-500' },
  sad: { icon: <Frown className="h-6 w-6 text-blue-500" />, color: 'text-blue-500' },
  angry: { icon: <Frown className="h-6 w-6 text-red-500" />, color: 'text-red-500' },
  neutral: { icon: <Meh className="h-6 w-6 text-gray-500" />, color: 'text-gray-500' },
  excited: { icon: <Smile className="h-6 w-6 text-yellow-500" />, color: 'text-yellow-500' },
  worried: { icon: <Frown className="h-6 w-6 text-orange-500" />, color: 'text-orange-500' }
};

export default function SocialCompass() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Game state
  const [gameMode, setGameMode] = useState<'menu' | 'briefing' | 'playing' | 'paused' | 'result'>('menu');
  const [currentContext, setCurrentContext] = useState<SocialContext | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [emotionRadar, setEmotionRadar] = useState<{[npcId: string]: EmotionRadar}>({});
  const [socialScore, setSocialScore] = useState(0);
  const [responseChoice, setResponseChoice] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState(0);
  
  // Radar scanning
  const [scanningNPC, setScanningNPC] = useState<string | null>(null);
  const [radarActive, setRadarActive] = useState(false);
  
  const {
    scenarios,
    userProgress,
    userSessions,
    achievements,
    unlockedAchievements,
    loading,
    completeSession,
  } = useSocialScenarios(user?.id);

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameMode === 'playing') {
      timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameMode]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para jogar Social Compass, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startContext = (context: SocialContext) => {
    setCurrentContext(context);
    setGameMode('briefing');
    setGameTime(0);
    setSocialScore(0);
    setEmotionRadar({});
    setScanningNPC(null);
    setRadarActive(false);
    setSessionStartTime(Date.now());
  };

  const beginScenario = () => {
    setGameMode('playing');
    // Initialize emotion radar for each NPC
    if (currentContext) {
      const initialRadar: {[key: string]: EmotionRadar} = {};
      currentContext.npcs.forEach(npc => {
        initialRadar[npc.id] = {
          detected: false,
          confidence: 0,
          emotion: 'unknown',
          clues: []
        };
      });
      setEmotionRadar(initialRadar);
    }
  };

  const scanEmotion = (npcId: string) => {
    if (!currentContext || !radarActive) return;
    
    const npc = currentContext.npcs.find(n => n.id === npcId);
    if (!npc) return;

    setScanningNPC(npcId);
    
    // Simulate radar scanning delay
    setTimeout(() => {
      const accuracy = Math.random() * 0.4 + 0.6; // 60-100% accuracy
      const detected = Math.random() < accuracy;
      
      setEmotionRadar(prev => ({
        ...prev,
        [npcId]: {
          detected,
          confidence: Math.round(accuracy * 100),
          emotion: detected ? npc.emotion.primary : 'uncertain',
          clues: detected ? [
            `Linguagem corporal: ${npc.bodyLanguage}`,
            `Intensidade emocional: ${npc.emotion.intensity}/10`,
            npc.emotion.hidden ? `Emoção oculta detectada: ${npc.emotion.hidden}` : ''
          ].filter(Boolean) : ['Sinal fraco - tente novamente']
        }
      }));
      
      setScanningNPC(null);
      setSocialScore(prev => prev + (detected ? 10 : 2));
      
      toast({
        title: detected ? "🎯 Emoção detectada!" : "📡 Sinal fraco",
        description: detected ? 
          `${npc.name}: ${npc.emotion.primary} (${Math.round(accuracy * 100)}%)` :
          "Tente aproximar o radar novamente",
      });
    }, 2000);
  };

  const respondToSituation = async (response: string) => {
    if (!currentContext) return;

    setResponseChoice(response);
    
    // Calculate response quality
    const empathyScore = response.includes('empático') ? 25 : 
                        response.includes('apoio') ? 20 : 10;
    const communicationScore = response.includes('assertivo') ? 25 :
                              response.includes('claro') ? 20 : 10;
    const appropriatenessScore = 25; // Base score for attempting response
    
    const totalScore = empathyScore + communicationScore + appropriatenessScore + socialScore;
    
    // Save session
    const completionTime = Math.round((Date.now() - sessionStartTime) / 1000);
    const scores = {
      empathy: Math.round(empathyScore / 25 * 5),
      assertiveness: Math.round(communicationScore / 25 * 5),
      communication: Math.round(appropriatenessScore / 25 * 5)
    };

    await completeSession(
      currentContext.id,
      [{ id: 1, text: response, empathy: scores.empathy, assertiveness: scores.assertiveness, communication: scores.communication }],
      scores,
      completionTime
    );
    
    setGameMode('result');
  };

  const backToMenu = () => {
    setGameMode('menu');
    setCurrentContext(null);
    setGameTime(0);
    setSocialScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Calibrando Social Compass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Social Compass
            </h1>
            <p className="text-teal-700">
              Navegue situações sociais com seu radar emocional
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/games" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {gameMode === 'menu' && (
              <div className="space-y-6">
                <Card className="p-6 bg-card border-0 shadow-card">
                  <div className="text-center mb-6">
                    <Compass className="h-16 w-16 mx-auto mb-4 text-teal-500" />
                    <h2 className="text-2xl font-bold mb-2">Escolha seu Cenário Social</h2>
                    <p className="text-muted-foreground">
                      Use seu radar emocional para navegar interações sociais complexas
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {socialContexts.map((context) => (
                      <Card key={context.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{context.name}</h4>
                            <div className="flex gap-2">
                              <Badge variant={
                                context.setting === 'school' ? 'default' :
                                context.setting === 'family' ? 'secondary' : 'outline'
                              }>
                                {context.setting === 'school' ? 'Escola' :
                                 context.setting === 'family' ? 'Família' :
                                 context.setting === 'friends' ? 'Amigos' : context.setting}
                              </Badge>
                              <Badge className="bg-orange-100 text-orange-800">
                                Nível {context.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {context.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {context.npcs.length} personagens
                              {context.timeLimit && (
                                <>
                                  <Clock className="h-4 w-4 ml-2" />
                                  {context.timeLimit}s
                                </>
                              )}
                            </div>
                            
                            <Button 
                              onClick={() => startContext(context)}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              Iniciar Cenário
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {gameMode === 'briefing' && currentContext && (
              <Card className="p-8 bg-card border-0 shadow-card">
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge className="mb-4 bg-teal-100 text-teal-800">
                      {currentContext.setting === 'school' ? 'Escola' :
                       currentContext.setting === 'family' ? 'Família' : currentContext.setting}
                    </Badge>
                    <h2 className="text-2xl font-bold mb-4">{currentContext.name}</h2>
                    <p className="text-muted-foreground mb-6">
                      {currentContext.description}
                    </p>
                  </div>

                  <div className="bg-teal-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-teal-600" />
                      Objetivo Social:
                    </h3>
                    <p className="text-teal-800">{currentContext.socialGoal}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Personagens Envolvidos:</h3>
                    {currentContext.npcs.map((npc) => (
                      <div key={npc.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                          {npc.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{npc.name}</h4>
                          <p className="text-sm text-muted-foreground">{npc.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={backToMenu} variant="outline">
                      <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                      Voltar
                    </Button>
                    <Button onClick={beginScenario} className="bg-teal-600 hover:bg-teal-700">
                      Começar Cenário
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {gameMode === 'playing' && currentContext && (
              <Card className="p-6 bg-card border-0 shadow-card">
                <div className="space-y-6">
                  {/* Game HUD */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-teal-100 text-teal-800">
                        Tempo: {gameTime}s
                      </Badge>
                      <Badge className="bg-cyan-100 text-cyan-800">
                        Score: {socialScore}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={radarActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRadarActive(!radarActive)}
                        className="flex items-center gap-2"
                      >
                        <Compass className={`h-4 w-4 ${radarActive ? 'animate-spin' : ''}`} />
                        Radar {radarActive ? 'ON' : 'OFF'}
                      </Button>
                      <Button 
                        onClick={() => setGameMode('paused')} 
                        variant="outline" 
                        size="sm"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Scene */}
                  <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">🎭 {currentContext.name}</h3>
                    
                    {/* NPCs */}
                    <div className="space-y-4">
                      {currentContext.npcs.map((npc) => {
                        const radar = emotionRadar[npc.id];
                        const isScanning = scanningNPC === npc.id;
                        
                        return (
                          <div key={npc.id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => scanEmotion(npc.id)}
                                disabled={!radarActive || isScanning}
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                                  isScanning ? 'animate-pulse bg-orange-400' :
                                  radarActive ? 'bg-teal-500 hover:bg-teal-600 cursor-pointer' :
                                  'bg-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {isScanning ? (
                                  <Eye className="h-6 w-6 animate-bounce" />
                                ) : (
                                  npc.name.charAt(0)
                                )}
                              </button>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{npc.name}</h4>
                                  <span className="text-sm text-muted-foreground">({npc.role})</span>
                                  {radar?.detected && emotionIcons[radar.emotion as keyof typeof emotionIcons] && (
                                    <div className="flex items-center gap-1">
                                      {emotionIcons[radar.emotion as keyof typeof emotionIcons].icon}
                                      <span className="text-xs">{radar.confidence}%</span>
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-sm mb-2 italic">"{npc.dialogue}"</p>
                                
                                {radar?.detected && (
                                  <div className="space-y-1">
                                    {radar.clues.map((clue, idx) => (
                                      <p key={idx} className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                        💡 {clue}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Response Options */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Como você vai responder?</h3>
                    <div className="grid gap-3">
                      <Button
                        variant="outline"
                        className="p-4 h-auto text-left justify-start"
                        onClick={() => respondToSituation('Resposta empática e de apoio')}
                      >
                        💙 Mostrar empatia e oferecer apoio
                      </Button>
                      <Button
                        variant="outline"
                        className="p-4 h-auto text-left justify-start"
                        onClick={() => respondToSituation('Resposta assertiva e clara')}
                      >
                        🎯 Comunicar de forma assertiva e clara
                      </Button>
                      <Button
                        variant="outline"
                        className="p-4 h-auto text-left justify-start"
                        onClick={() => respondToSituation('Resposta de observação')}
                      >
                        👁️ Observar mais antes de agir
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {gameMode === 'result' && currentContext && (
              <Card className="p-8 bg-card border-0 shadow-card text-center">
                <div className="space-y-6">
                  <div className="text-6xl">🎯</div>
                  <h2 className="text-2xl font-bold">Cenário Social Concluído!</h2>
                  <p className="text-muted-foreground">
                    Excelente navegação em "{currentContext.name}". 
                    Suas habilidades sociais estão evoluindo!
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">{socialScore}</div>
                      <div className="text-xs text-muted-foreground">Pontos Sociais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-600">{gameTime}s</div>
                      <div className="text-xs text-muted-foreground">Tempo Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.keys(emotionRadar).filter(id => emotionRadar[id].detected).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Emoções Lidas</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 justify-center">
                    <Button onClick={backToMenu} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Menu Principal
                    </Button>
                    <Button onClick={() => {
                      const nextContext = socialContexts.find(c => c.id !== currentContext.id);
                      if (nextContext) startContext(nextContext);
                      else backToMenu();
                    }}>
                      Próximo Cenário
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Instructions */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Compass className="h-5 w-5 text-teal-600" />
                Como Jogar
              </h3>
              <div className="space-y-3 text-sm">
                <p>1. 🔍 Ative seu radar emocional</p>
                <p>2. 👁️ Clique nos personagens para ler emoções</p>
                <p>3. 💡 Use as pistas para entender o contexto</p>
                <p>4. 🎯 Escolha a melhor resposta social</p>
                <p>5. 🏆 Desenvolva suas habilidades!</p>
              </div>
            </Card>

            {/* Game Info */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h3 className="font-semibold mb-4">Detalhes do Jogo</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>8-25 anos</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>10-20 min por cenário</span>
                </div>
                <div className="flex items-center text-sm">
                  <Heart className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>Jogador individual</span>
                </div>
              </div>
            </Card>

            {/* Progress */}
      <div className="grid grid-cols-1 gap-4">
        {/* Progress placeholder */}
      </div>

            {/* Achievements */}
            <SocialScenariosAchievements 
              achievements={achievements} 
              unlockedAchievements={unlockedAchievements} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}