import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shuffle, Brain, Target, Timer, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';

interface GameCard {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
  shape: 'circle' | 'square' | 'triangle' | 'star';
  number: 1 | 2 | 3 | 4;
}

interface GameRule {
  type: 'color' | 'shape' | 'number';
  description: string;
  checkMatch: (card1: GameCard, card2: GameCard) => boolean;
}

interface SessionStats {
  level: number;
  score: number;
  correctResponses: number;
  errors: number;
  setShifts: number;
  perseverativeErrors: number;
  switchCost: number;
  totalTrials: number;
  averageReactionTime: number;
  flexibilityScore: number;
}

const GAME_RULES: GameRule[] = [
  {
    type: 'color',
    description: 'Combine por COR',
    checkMatch: (card1, card2) => card1.color === card2.color
  },
  {
    type: 'shape',
    description: 'Combine por FORMA',
    checkMatch: (card1, card2) => card1.shape === card2.shape
  },
  {
    type: 'number',
    description: 'Combine por NÚMERO',
    checkMatch: (card1, card2) => card1.number === card2.number
  }
];

const COLORS = {
  red: { bg: 'bg-red-500', text: 'text-white', name: 'Vermelho' },
  blue: { bg: 'bg-blue-500', text: 'text-white', name: 'Azul' },
  green: { bg: 'bg-green-500', text: 'text-white', name: 'Verde' },
  yellow: { bg: 'bg-yellow-500', text: 'text-black', name: 'Amarelo' }
};

const SHAPES = {
  circle: { symbol: '●', name: 'Círculo' },
  square: { symbol: '■', name: 'Quadrado' },
  triangle: { symbol: '▲', name: 'Triângulo' },
  star: { symbol: '★', name: 'Estrela' }
};

export const CognitiveFlexibility: React.FC = () => {
  const { user } = useAuth();
  const { saveBehavioralMetric } = useBehavioralAnalysis();
  
  const [gameState, setGameState] = useState<'idle' | 'instructions' | 'playing' | 'completed'>('idle');
  const [currentRule, setCurrentRule] = useState<GameRule>(GAME_RULES[0]);
  const [targetCard, setTargetCard] = useState<GameCard | null>(null);
  const [choiceCards, setChoiceCards] = useState<GameCard[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    level: 1,
    score: 0,
    correctResponses: 0,
    errors: 0,
    setShifts: 0,
    perseverativeErrors: 0,
    switchCost: 0,
    totalTrials: 0,
    averageReactionTime: 0,
    flexibilityScore: 0
  });
  
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastRuleType, setLastRuleType] = useState<string>('');
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [trialsInCurrentRule, setTrialsInCurrentRule] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  
  const MAX_TRIALS = 64; // Wisconsin Card Sorting Test standard
  const RULE_CHANGE_THRESHOLD = 6; // Change rule after 6 consecutive correct responses

  // Generate random card
  const generateCard = useCallback((): GameCard => {
    const colors: (keyof typeof COLORS)[] = ['red', 'blue', 'green', 'yellow'];
    const shapes: (keyof typeof SHAPES)[] = ['circle', 'square', 'triangle', 'star'];
    const numbers: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
    
    return {
      id: `card-${Date.now()}-${Math.random()}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      number: numbers[Math.floor(Math.random() * numbers.length)]
    };
  }, []);

  // Generate choice cards ensuring one correct match
  const generateChoices = useCallback((target: GameCard, rule: GameRule): GameCard[] => {
    const choices: GameCard[] = [];
    
    // Add one correct match
    let correctCard: GameCard;
    do {
      correctCard = generateCard();
    } while (!rule.checkMatch(target, correctCard) || 
             (correctCard.color === target.color && correctCard.shape === target.shape && correctCard.number === target.number));
    
    choices.push(correctCard);
    
    // Add three incorrect choices
    while (choices.length < 4) {
      const incorrectCard = generateCard();
      const isDuplicate = choices.some(card => 
        card.color === incorrectCard.color && 
        card.shape === incorrectCard.shape && 
        card.number === incorrectCard.number
      );
      
      if (!rule.checkMatch(target, incorrectCard) && !isDuplicate) {
        choices.push(incorrectCard);
      }
    }
    
    // Shuffle choices
    return choices.sort(() => Math.random() - 0.5);
  }, [generateCard]);

  // Start next trial
  const startNextTrial = useCallback(() => {
    const target = generateCard();
    const choices = generateChoices(target, currentRule);
    
    setTargetCard(target);
    setChoiceCards(choices);
    setTrialStartTime(Date.now());
    setFeedback('');
  }, [generateCard, generateChoices, currentRule]);

  // Change rule when threshold reached
  const changeRule = useCallback(() => {
    const availableRules = GAME_RULES.filter(rule => rule.type !== currentRule.type);
    const newRule = availableRules[Math.floor(Math.random() * availableRules.length)];
    
    setCurrentRule(newRule);
    setLastRuleType(currentRule.type);
    setTrialsInCurrentRule(0);
    setStats(prev => ({ ...prev, setShifts: prev.setShifts + 1 }));
    
    // Visual feedback for rule change
    setFeedback(`Nova regra: ${newRule.description}`);
  }, [currentRule]);

  // Handle card selection
  const handleCardChoice = useCallback(async (selectedCard: GameCard) => {
    if (!targetCard) return;
    
    const reactionTime = Date.now() - trialStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    const isCorrect = currentRule.checkMatch(targetCard, selectedCard);
    const wasSwitchTrial = lastRuleType !== '' && lastRuleType !== currentRule.type && trialsInCurrentRule < 2;
    
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalTrials += 1;
      
      if (isCorrect) {
        newStats.correctResponses += 1;
        newStats.score += 10;
        setConsecutiveErrors(0);
        setFeedback('Correto! ✓');
      } else {
        newStats.errors += 1;
        setConsecutiveErrors(prev => prev + 1);
        
        // Check for perseverative errors (continuing with old rule)
        if (lastRuleType && GAME_RULES.find(r => r.type === lastRuleType)?.checkMatch(targetCard, selectedCard)) {
          newStats.perseverativeErrors += 1;
        }
        
        setFeedback('Incorreto! Tente outra estratégia.');
      }
      
      // Calculate switch cost if this was a switch trial
      if (wasSwitchTrial && reactionTimes.length > 5) {
        const recentNonSwitchRT = reactionTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
        newStats.switchCost = Math.max(newStats.switchCost, reactionTime - recentNonSwitchRT);
      }
      
      return newStats;
    });
    
    setTrialsInCurrentRule(prev => prev + 1);
    
    // Check if rule should change (after 6 consecutive correct responses)
    if (isCorrect && trialsInCurrentRule >= RULE_CHANGE_THRESHOLD - 1 && consecutiveErrors === 0) {
      setTimeout(() => {
        changeRule();
        setTimeout(startNextTrial, 1500);
      }, 1000);
    } else if (stats.totalTrials + 1 >= MAX_TRIALS) {
      // Complete the test
      setTimeout(() => completeTest(), 1000);
    } else {
      // Continue with next trial
      setTimeout(startNextTrial, 1000);
    }
  }, [targetCard, trialStartTime, currentRule, lastRuleType, trialsInCurrentRule, consecutiveErrors, reactionTimes, stats.totalTrials, changeRule, startNextTrial]);

  // Complete test and calculate results
  const completeTest = useCallback(async () => {
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    const flexibilityScore = calculateFlexibilityScore(stats);
    
    const finalStats: SessionStats = {
      ...stats,
      averageReactionTime: avgReactionTime,
      flexibilityScore
    };
    
    setStats(finalStats);
    setGameState('completed');
    
    // Save behavioral metrics
    if (user?.id) {
      await saveBehavioralMetric({
        gameType: 'cognitive_flexibility',
        sessionId: `flexibility-${Date.now()}`,
        metrics: {
          cognitiveFlexibility: flexibilityScore / 100,
          workingMemory: finalStats.correctResponses / finalStats.totalTrials,
          inhibitoryControl: 1 - (finalStats.perseverativeErrors / Math.max(finalStats.totalTrials, 1)),
          reactionTime: avgReactionTime
        },
        riskIndicators: {
          teaRisk: calculateTEARisk(finalStats),
          tdahRisk: calculateTDAHRisk(finalStats),
          dislexiaRisk: calculateDislexiaRisk(finalStats)
        },
        sessionDuration: (Date.now() - trialStartTime) / 1000
      });
    }
  }, [reactionTimes, stats, user?.id, saveBehavioralMetric, trialStartTime]);

  // Calculate flexibility score
  const calculateFlexibilityScore = (stats: SessionStats): number => {
    const accuracy = stats.correctResponses / Math.max(stats.totalTrials, 1);
    const adaptability = 1 - (stats.perseverativeErrors / Math.max(stats.errors, 1));
    const efficiency = stats.setShifts > 0 ? (stats.setShifts * 6) / stats.totalTrials : 0;
    
    return Math.round((accuracy * 0.5 + adaptability * 0.3 + efficiency * 0.2) * 100);
  };

  // Calculate risk indicators
  const calculateTEARisk = (stats: SessionStats): number => {
    let risk = 0;
    
    // High perseverative errors indicate cognitive rigidity
    const perseverativeRate = stats.perseverativeErrors / Math.max(stats.totalTrials, 1);
    if (perseverativeRate > 0.3) risk += 0.4;
    
    // Difficulty adapting to rule changes
    if (stats.setShifts < 3 && stats.totalTrials > 30) risk += 0.3;
    
    // Extremely consistent response patterns
    if (stats.errors < stats.totalTrials * 0.1 && stats.setShifts < 2) risk += 0.2;
    
    return Math.min(risk, 1.0);
  };

  const calculateTDAHRisk = (stats: SessionStats): number => {
    let risk = 0;
    
    // High error rate indicates attention problems
    const errorRate = stats.errors / Math.max(stats.totalTrials, 1);
    if (errorRate > 0.4) risk += 0.3;
    
    // High switch cost indicates executive function difficulties
    if (stats.switchCost > 200) risk += 0.3;
    
    // Inconsistent performance
    if (stats.perseverativeErrors > stats.totalTrials * 0.2) risk += 0.2;
    
    return Math.min(risk, 1.0);
  };

  const calculateDislexiaRisk = (stats: SessionStats): number => {
    let risk = 0;
    
    // Slower processing speed
    if (stats.averageReactionTime > 1500) risk += 0.2;
    
    // Difficulty with rule switching (executive function)
    if (stats.switchCost > 300) risk += 0.2;
    
    return Math.min(risk, 1.0);
  };

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setStats({
      level: 1,
      score: 0,
      correctResponses: 0,
      errors: 0,
      setShifts: 0,
      perseverativeErrors: 0,
      switchCost: 0,
      totalTrials: 0,
      averageReactionTime: 0,
      flexibilityScore: 0
    });
    setCurrentRule(GAME_RULES[0]);
    setLastRuleType('');
    setTrialsInCurrentRule(0);
    setConsecutiveErrors(0);
    setReactionTimes([]);
    startNextTrial();
  }, [startNextTrial]);

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Login Necessário</AlertTitle>
        <AlertDescription>
          Faça login para acessar o teste de flexibilidade cognitiva.
        </AlertDescription>
      </Alert>
    );
  }

  const renderCard = (card: GameCard, isClickable: boolean = false, onClick?: () => void) => {
    const colorStyle = COLORS[card.color];
    const shapeSymbol = SHAPES[card.shape].symbol;
    
    return (
      <div 
        className={`
          relative p-6 rounded-xl shadow-card transition-all duration-200
          ${colorStyle.bg} ${colorStyle.text}
          ${isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-glow' : ''}
        `}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">
            {Array(card.number).fill(shapeSymbol).join(' ')}
          </div>
          <div className="text-sm font-medium">
            {card.number} {SHAPES[card.shape].name}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-playful bg-clip-text text-transparent mb-4">
          Teste de Flexibilidade Cognitiva
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Avalia a capacidade de adaptar-se a mudanças de regras - indicador de função executiva e rigidez cognitiva
        </p>
      </div>

      {gameState === 'idle' && (
        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Shuffle className="w-6 h-6 mr-2" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p>Este teste avalia sua capacidade de se adaptar a mudanças de regras.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-red-500 text-2xl mb-2">●</div>
                  <h3 className="font-semibold">Por Cor</h3>
                  <p className="text-sm text-muted-foreground">Combine cartas da mesma cor</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-blue-500 text-2xl mb-2">■</div>
                  <h3 className="font-semibold">Por Forma</h3>
                  <p className="text-sm text-muted-foreground">Combine cartas da mesma forma</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-green-500 text-2xl mb-2">●●</div>
                  <h3 className="font-semibold">Por Número</h3>
                  <p className="text-sm text-muted-foreground">Combine cartas com mesmo número</p>
                </div>
              </div>
              
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>Objetivo Diagnóstico</AlertTitle>
                <AlertDescription>
                  Este teste identifica rigidez cognitiva (TEA), dificuldades executivas (TDAH) 
                  e problemas de processamento (Dislexia).
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => setGameState('instructions')} 
                className="w-full shadow-soft"
                size="lg"
              >
                <Target className="w-4 h-4 mr-2" />
                Iniciar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'instructions' && (
        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Instruções Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p><strong>1.</strong> Você verá uma carta no centro e 4 opções abaixo</p>
              <p><strong>2.</strong> Encontre qual carta combina com a do centro</p>
              <p><strong>3.</strong> A regra pode ser: cor, forma ou número</p>
              <p><strong>4.</strong> Descubra a regra atual pelos acertos/erros</p>
              <p><strong>5.</strong> A regra mudará sem aviso - mantenha-se flexível!</p>
              <p><strong>6.</strong> O teste analisa sua adaptabilidade mental</p>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setGameState('idle')}
              >
                Voltar
              </Button>
              <Button onClick={startGame} className="shadow-soft">
                <Timer className="w-4 h-4 mr-2" />
                Começar Teste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.score}</div>
                <div className="text-sm text-muted-foreground">Pontos</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.correctResponses}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.setShifts}</div>
                <div className="text-sm text-muted-foreground">Mudanças</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalTrials}</div>
                <div className="text-sm text-muted-foreground">Trial</div>
              </CardContent>
            </Card>
          </div>

          {/* Current Rule Hint */}
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Regra Atual: {currentRule.description}
                </div>
                <Badge variant="outline">
                  {trialsInCurrentRule}/6 corretos para mudar
                </Badge>
              </div>
              <Progress value={(trialsInCurrentRule / 6) * 100} className="mt-2" />
            </CardContent>
          </Card>

          {/* Target Card */}
          {targetCard && (
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Carta Alvo:</h3>
              <div className="flex justify-center">
                <div className="w-32">
                  {renderCard(targetCard)}
                </div>
              </div>
            </div>
          )}

          {/* Choice Cards */}
          {choiceCards.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Escolha a carta que combina:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {choiceCards.map((card, index) => (
                  <div key={card.id}>
                    {renderCard(card, true, () => handleCardChoice(card))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <Card className="shadow-soft max-w-md mx-auto">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold">{feedback}</div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span>Progresso do Teste</span>
                <span>{stats.totalTrials}/{MAX_TRIALS}</span>
              </div>
              <Progress value={(stats.totalTrials / MAX_TRIALS) * 100} />
            </CardContent>
          </Card>
        </div>
      )}

      {gameState === 'completed' && (
        <Card className="shadow-glow max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              <TrendingUp className="w-6 h-6 mr-2" />
              Teste Concluído
            </CardTitle>
            <CardDescription>Análise de Flexibilidade Cognitiva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{stats.flexibilityScore}</div>
                <div className="text-sm text-muted-foreground">Flexibilidade (%)</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.score}</div>
                <div className="text-sm text-muted-foreground">Pontuação Final</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Acurácia:</span>
                <Badge variant="secondary">
                  {((stats.correctResponses / stats.totalTrials) * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Mudanças de Regra:</span>
                <Badge variant="outline">{stats.setShifts}</Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Erros Perseverativos:</span>
                <Badge variant={stats.perseverativeErrors > stats.totalTrials * 0.2 ? "destructive" : "secondary"}>
                  {stats.perseverativeErrors}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Custo da Mudança:</span>
                <Badge variant={stats.switchCost > 200 ? "destructive" : "secondary"}>
                  {stats.switchCost.toFixed(0)}ms
                </Badge>
              </div>
            </div>
            
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Análise Clínica</AlertTitle>
              <AlertDescription>
                {stats.flexibilityScore > 70
                  ? "Boa flexibilidade cognitiva. Capacidade adequada de adaptação a mudanças."
                  : stats.flexibilityScore > 50
                  ? "Flexibilidade moderada. Algumas dificuldades em mudanças de contexto."
                  : "Possíveis indicadores de rigidez cognitiva. Recomenda-se avaliação especializada."
                }
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setGameState('idle')}
              >
                Tentar Novamente
              </Button>
              <Button onClick={() => window.location.href = '/games'}>
                Outros Jogos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};