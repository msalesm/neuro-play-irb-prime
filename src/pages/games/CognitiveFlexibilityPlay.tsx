import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, RotateCcw, Shuffle, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { cognitiveFlexibilityPhases } from '@/data/game-phases/cognitive-flexibility-phases';

type RuleType = 'color' | 'shape' | 'size';

interface GameCard {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
  shape: 'circle' | 'square' | 'triangle' | 'star';
  size: 'small' | 'large';
}

const COLORS = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500'
};

const SHAPES = {
  circle: '●',
  square: '■',
  triangle: '▲',
  star: '★'
};

export default function CognitiveFlexibilityPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase') || 'flexibility-1';
  const { childProfileId, isTestMode } = useGameProfile();
  const { toast } = useToast();
  
  const phase = cognitiveFlexibilityPhases.find(p => p.id === phaseId) || cognitiveFlexibilityPhases[0];
  const config = phase.gameConfig || {};
  const rounds = ('rounds' in config ? config.rounds : 10) as number;
  const switchFrequency = ('switchFrequency' in config ? config.switchFrequency : 3) as number;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentRule, setCurrentRule] = useState<RuleType>('color');
  const [targetCard, setTargetCard] = useState<GameCard | null>(null);
  const [options, setOptions] = useState<GameCard[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [ruleChanges, setRuleChanges] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState(0);
  
  const { startSession, endSession } = useGameSession(
    'cognitive-flexibility',
    childProfileId || undefined
  );

  const generateCard = useCallback((): GameCard => {
    const colors: GameCard['color'][] = ['red', 'blue', 'green', 'yellow'];
    const shapes: GameCard['shape'][] = ['circle', 'square', 'triangle', 'star'];
    const sizes: GameCard['size'][] = ['small', 'large'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)]
    };
  }, []);

  const generateRound = useCallback(() => {
    const target = generateCard();
    setTargetCard(target);
    
    // Generate 3 options, one must match by current rule
    const opts: GameCard[] = [generateCard(), generateCard(), generateCard()];
    
    // Ensure at least one matches by the current rule
    const matchIndex = Math.floor(Math.random() * 3);
    opts[matchIndex] = {
      ...generateCard(),
      [currentRule]: target[currentRule]
    };
    
    setOptions(opts);
    setRoundStartTime(Date.now());
  }, [generateCard, currentRule]);

  const checkMatch = (card: GameCard): boolean => {
    if (!targetCard) return false;
    return card[currentRule] === targetCard[currentRule];
  };

  const handleOptionClick = (card: GameCard) => {
    if (!isPlaying || gameComplete) return;
    
    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    const isCorrect = checkMatch(card);
    
    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setScore(prev => prev + 100 + Math.max(0, 50 - Math.floor(reactionTime / 100)));
      setStreak(prev => prev + 1);
      toast({ title: "Correto!", description: `+${100 + Math.max(0, 50 - Math.floor(reactionTime / 100))} pontos` });
    } else {
      setIncorrect(prev => prev + 1);
      setStreak(0);
      toast({ title: "Incorreto", description: `A regra era: ${getRuleLabel(currentRule)}`, variant: "destructive" });
    }
    
    // Check if rule should change
    const newRound = round + 1;
    
    if (newRound % switchFrequency === 0 && newRound < rounds) {
      const rules: RuleType[] = ['color', 'shape', 'size'];
      const otherRules = rules.filter(r => r !== currentRule);
      const newRule = otherRules[Math.floor(Math.random() * otherRules.length)];
      setCurrentRule(newRule);
      setRuleChanges(prev => prev + 1);
      toast({ title: "🔄 Regra Mudou!", description: `Agora combine por: ${getRuleLabel(newRule)}` });
    }
    
    if (newRound >= rounds) {
      setGameComplete(true);
      setIsPlaying(false);
    } else {
      setRound(newRound);
      generateRound();
    }
  };

  const getRuleLabel = (rule: RuleType): string => {
    const labels = { color: 'COR', shape: 'FORMA', size: 'TAMANHO' };
    return labels[rule];
  };

  // Timer
  useEffect(() => {
    if (!isPlaying || gameComplete) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, gameComplete]);

  const startGame = async () => {
    setIsPlaying(true);
    setGameComplete(false);
    setRound(0);
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setIncorrect(0);
    setTimeLeft(60);
    setRuleChanges(0);
    setReactionTimes([]);
    setCurrentRule('color');
    
    if (!isTestMode) {
      await startSession({ difficulty_level: phase.phaseNumber });
    } else {
      toast({ title: "Modo Teste", description: "Progresso não será salvo" });
    }
    
    generateRound();
  };

  const finishGame = async () => {
    const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    if (!isTestMode) {
      await endSession({
        score,
        accuracy_percentage: accuracy,
        correct_attempts: correct,
        incorrect_attempts: incorrect,
        avg_reaction_time_ms: avgReactionTime,
        session_data: { ruleChanges, phaseId }
      });
    }
    
    let stars = 0;
    if (accuracy >= 70) stars = 1;
    if (accuracy >= 80) stars = 2;
    if (accuracy >= 90) stars = 3;
    
    toast({
      title: "Jogo Finalizado!",
      description: `Pontuação: ${score} | Precisão: ${accuracy.toFixed(0)}% | ⭐ ${stars}`
    });
  };

  useEffect(() => {
    if (gameComplete) {
      finishGame();
    }
  }, [gameComplete]);

  const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;

  const renderCard = (card: GameCard, onClick?: () => void, isTarget = false) => {
    const sizeClass = card.size === 'large' ? 'text-6xl' : 'text-4xl';
    
    return (
      <div
        onClick={onClick}
        className={`
          ${isTarget ? 'w-32 h-32' : 'w-28 h-28'} 
          rounded-xl flex items-center justify-center
          ${COLORS[card.color]} 
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}
          shadow-lg border-4 border-white/30
        `}
      >
        <span className={`${sizeClass} text-white drop-shadow-lg`}>
          {SHAPES[card.shape]}
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold">{phase.name}</h1>
          <p className="text-sm text-muted-foreground">Fase {phase.phaseNumber}</p>
        </div>
        
        {isTestMode && (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded text-xs">
            Modo Teste
          </span>
        )}
      </div>

      {/* Stats Bar */}
      {isPlaying && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Clock className="w-5 h-5" />
                {timeLeft}s
              </div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Pontos</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Zap className="w-5 h-5 text-yellow-500" />
                {streak}
              </div>
              <div className="text-xs text-muted-foreground">Sequência</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{round}/{rounds}</div>
              <div className="text-xs text-muted-foreground">Rodada</div>
            </div>
          </div>
          
          <Progress value={(round / rounds) * 100} className="mt-3" />
        </Card>
      )}

      {/* Game Area */}
      <Card className="p-6">
        {!isPlaying && !gameComplete && (
          <div className="text-center py-12">
            <Shuffle className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">🔄 Flexibilidade Cognitiva</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Combine as cartas seguindo a regra atual. A regra muda durante o jogo - adapte-se rapidamente!
            </p>
            <Button size="lg" onClick={startGame}>
              <Play className="w-5 h-5 mr-2" />
              Iniciar
            </Button>
          </div>
        )}

        {isPlaying && targetCard && (
          <div className="text-center">
            {/* Current Rule */}
            <div className="mb-6 p-3 bg-primary/10 rounded-lg inline-block">
              <span className="text-sm text-muted-foreground">Combine por: </span>
              <span className="text-lg font-bold text-primary">{getRuleLabel(currentRule)}</span>
            </div>

            {/* Target Card */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-3">Carta Alvo:</p>
              <div className="flex justify-center">
                {renderCard(targetCard, undefined, true)}
              </div>
            </div>

            {/* Options */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">Escolha a carta que combina por {getRuleLabel(currentRule)}:</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {options.map((card) => (
                  <div key={card.id}>
                    {renderCard(card, () => handleOptionClick(card))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameComplete && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-3xl font-bold mb-4">Jogo Completo!</h2>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Pontuação</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{accuracy.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{correct}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{ruleChanges}</div>
                <div className="text-sm text-muted-foreground">Mudanças de Regra</div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={startGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Jogar Novamente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Instructions */}
      {!isPlaying && !gameComplete && (
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-2">Como Jogar</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Observe a carta alvo no centro</li>
            <li>• Combine por COR, FORMA ou TAMANHO conforme a regra atual</li>
            <li>• A regra muda periodicamente - fique atento!</li>
            <li>• Responda rapidamente para ganhar mais pontos</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
