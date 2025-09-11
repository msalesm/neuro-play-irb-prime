import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Heart, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { useSocialScenarios } from "@/hooks/useSocialScenarios";
import { SocialScenariosProgress } from "@/components/SocialScenariosProgress";
import { SocialScenariosAchievements } from "@/components/SocialScenariosAchievements";

const SocialScenarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [currentChoices, setCurrentChoices] = useState<any[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'result'>('menu');

  const {
    scenarios,
    userProgress,
    userSessions,
    achievements,
    unlockedAchievements,
    loading,
    completeSession,
  } = useSocialScenarios(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Social Scenarios Simulator</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado para acessar este jogo terapêutico.
          </p>
          <Button onClick={() => window.location.href = '/auth'} className="w-full">
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  const startScenario = (scenario: any) => {
    setCurrentScenario(scenario);
    setCurrentChoices(scenario.choices || []);
    setSelectedChoice(null);
    setShowResult(false);
    setSessionStartTime(Date.now());
    setGameMode('playing');
  };

  const selectChoice = (choiceId: number) => {
    setSelectedChoice(choiceId);
    setShowResult(true);
    
    setTimeout(() => {
      handleScenarioComplete(choiceId);
    }, 3000);
  };

  const handleScenarioComplete = async (choiceId: number) => {
    if (!currentScenario || selectedChoice === null) return;

    const selectedChoiceData = currentChoices.find(c => c.id === choiceId);
    if (!selectedChoiceData) return;

    const completionTime = Math.round((Date.now() - sessionStartTime) / 1000);
    
    const scores = {
      empathy: selectedChoiceData.empathy || 0,
      assertiveness: selectedChoiceData.assertiveness || 0,
      communication: selectedChoiceData.communication || 0,
    };

    await completeSession(
      currentScenario.id,
      [selectedChoiceData],
      scores,
      completionTime
    );

    setGameMode('result');
  };

  const backToMenu = () => {
    setGameMode('menu');
    setCurrentScenario(null);
    setSelectedChoice(null);
    setShowResult(false);
  };

  const getScenariosByDifficulty = () => {
    const beginner = scenarios.filter(s => s.difficulty_level === 'beginner');
    const intermediate = scenarios.filter(s => s.difficulty_level === 'intermediate');
    const advanced = scenarios.filter(s => s.difficulty_level === 'advanced');
    return { beginner, intermediate, advanced };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cenários sociais...</p>
        </div>
      </div>
    );
  }

  const { beginner, intermediate, advanced } = getScenariosByDifficulty();

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-purple-100 text-purple-800 mb-4">
            Social Skills
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Social Scenarios Simulator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pratique interações sociais em ambientes seguros e controlados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {gameMode === 'menu' && (
              <div className="space-y-6">
                {/* Difficulty Sections */}
                {[
                  { title: 'Iniciante', scenarios: beginner, color: 'bg-green-100 text-green-800' },
                  { title: 'Intermediário', scenarios: intermediate, color: 'bg-yellow-100 text-yellow-800' },
                  { title: 'Avançado', scenarios: advanced, color: 'bg-red-100 text-red-800' }
                ].map(({ title, scenarios: levelScenarios, color }) => (
                  <Card key={title} className="p-6 bg-card border-0 shadow-card">
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className={color}>{title}</Badge>
                      <h3 className="text-xl font-bold">{levelScenarios.length} Cenários</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {levelScenarios.map((scenario) => (
                        <Card key={scenario.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm">{scenario.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {scenario.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {scenario.skills_focus.map((skill: string) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill === 'communication' ? 'Comunicação' : 
                                   skill === 'empathy' ? 'Empatia' : 
                                   skill === 'assertiveness' ? 'Assertividade' : skill}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button 
                              onClick={() => startScenario(scenario)}
                              size="sm" 
                              className="w-full"
                            >
                              Jogar Cenário
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {gameMode === 'playing' && currentScenario && (
              <Card className="p-8 bg-card border-0 shadow-card">
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge className="mb-4">{currentScenario.context}</Badge>
                    <h2 className="text-2xl font-bold mb-4">{currentScenario.title}</h2>
                    <p className="text-muted-foreground mb-6">
                      {currentScenario.description}
                    </p>
                  </div>

                  {!showResult ? (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-center mb-4">Como você reagiria?</h3>
                      {currentChoices.map((choice) => (
                        <Button
                          key={choice.id}
                          variant="outline"
                          className="w-full justify-start p-4 h-auto text-left"
                          onClick={() => selectChoice(choice.id)}
                        >
                          {choice.text}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold mb-4">Resultado da sua escolha:</h3>
                        {selectedChoice && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="font-medium mb-2">
                              {currentChoices.find(c => c.id === selectedChoice)?.text}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {currentChoices.find(c => c.id === selectedChoice)?.consequence}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {selectedChoice && (
                        <div className="grid grid-cols-3 gap-4">
                          {['empathy', 'assertiveness', 'communication'].map((skill) => {
                            const score = currentChoices.find(c => c.id === selectedChoice)?.[skill] || 0;
                            const label = skill === 'empathy' ? 'Empatia' : 
                                         skill === 'assertiveness' ? 'Assertividade' : 'Comunicação';
                            
                            return (
                              <div key={skill} className="text-center">
                                <div className="text-2xl font-bold text-primary">{score}/5</div>
                                <div className="text-xs text-muted-foreground">{label}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="animate-pulse text-sm text-muted-foreground">
                          Processando resultado...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {gameMode === 'result' && currentScenario && (
              <Card className="p-8 bg-card border-0 shadow-card text-center">
                <div className="space-y-6">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-2xl font-bold">Cenário Concluído!</h2>
                  <p className="text-muted-foreground">
                    Parabéns por completar "{currentScenario.title}". Continue praticando suas habilidades sociais!
                  </p>
                  
                  {currentScenario.educational_notes && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-semibold mb-2">💡 Dica Terapêutica:</h4>
                      <p className="text-sm">{currentScenario.educational_notes}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4 justify-center">
                    <Button onClick={backToMenu} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Menu Principal
                    </Button>
                    <Button onClick={() => {
                      const nextScenario = scenarios.find(s => s.id !== currentScenario.id);
                      if (nextScenario) startScenario(nextScenario);
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
            {/* Game Info */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h3 className="font-semibold mb-4">Detalhes do Jogo</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>12-30 anos</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>5-15 min por cenário</span>
                </div>
                <div className="flex items-center text-sm">
                  <Heart className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>Jogador individual</span>
                </div>
              </div>
            </Card>

            {/* Progress */}
            <SocialScenariosProgress 
              userProgress={userProgress} 
              totalSessions={userSessions.length} 
            />

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
};

export default SocialScenarios;