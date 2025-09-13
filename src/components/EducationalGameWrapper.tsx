import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  Lightbulb, 
  Target, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Brain,
  ArrowRight
} from 'lucide-react';
import { useEducationalSystem } from '@/hooks/useEducationalSystem';
import { useAuth } from '@/hooks/useAuth';

interface EducationalGameWrapperProps {
  gameId: string;
  category: string;
  children: React.ReactNode;
  onGameComplete?: (results: any) => void;
}

const educationalContent = {
  'attention-sustained': {
    title: 'Atenção Sustentada',
    preGame: {
      objective: 'Desenvolver a capacidade de manter o foco por períodos prolongados',
      instructions: [
        'Mantenha sua atenção no centro da tela',
        'Responda rapidamente aos estímulos apresentados',
        'Evite distrações do ambiente ao redor',
        'Pratique regularmente para melhorar sua concentração'
      ],
      tips: [
        '💡 Encontre um local silencioso para jogar',
        '💡 Faça pausas se sentir cansaço mental',
        '💡 Respire fundo antes de começar'
      ]
    },
    duringGame: {
      encouragements: [
        'Ótimo foco! Continue assim!',
        'Você está indo muito bem!',
        'Mantenha a concentração!',
        'Excelente trabalho!'
      ],
      hints: [
        'Lembre-se de respirar calmamente',
        'Mantenha os olhos no centro da tela',
        'Não se preocupe com erros, continue tentando'
      ]
    },
    postGame: {
      feedback: {
        high: 'Excelente! Sua capacidade de atenção está muito boa.',
        medium: 'Bom trabalho! Continue praticando para melhorar ainda mais.',
        low: 'Continue se esforçando! A prática regular vai te ajudar a melhorar.'
      },
      learningPoints: [
        'A atenção sustentada é fundamental para o aprendizado',
        'Praticar regularmente fortalece essa habilidade',
        'Pequenas melhorias fazem grande diferença'
      ]
    }
  },
  'memory-colorida': {
    title: 'Memória Colorida',
    preGame: {
      objective: 'Fortalecer a memória visual e capacidade de retenção de informações',
      instructions: [
        'Observe atentamente a sequência de cores',
        'Memorize a ordem apresentada',
        'Reproduza a sequência clicando nas cores corretas',
        'A sequência aumenta de tamanho a cada nível'
      ],
      tips: [
        '💡 Crie uma história mental com as cores',
        '💡 Repita a sequência mentalmente',
        '💡 Use técnicas de visualização'
      ]
    },
    duringGame: {
      encouragements: [
        'Sua memória está funcionando bem!',
        'Continue memorizando!',
        'Ótima sequência!',
        'Você consegue!'
      ],
      hints: [
        'Tente criar associações com as cores',
        'Visualize a sequência como um padrão',
        'Não tenha pressa, memorize bem antes de repetir'
      ]
    },
    postGame: {
      feedback: {
        high: 'Impressionante! Sua memória visual está excelente.',
        medium: 'Muito bom! Sua memória está se desenvolvendo bem.',
        low: 'Continue praticando! Exercícios regulares fortalecem a memória.'
      },
      learningPoints: [
        'A memória visual pode ser treinada e melhorada',
        'Técnicas de associação ajudam na memorização',
        'A prática regular expande a capacidade de memória'
      ]
    }
  }
  // Adicionar mais jogos conforme necessário
};

export function EducationalGameWrapper({ 
  gameId, 
  category, 
  children, 
  onGameComplete 
}: EducationalGameWrapperProps) {
  const { user } = useAuth();
  const { recordLearningSession, getTrailByCategory } = useEducationalSystem();
  const [gamePhase, setGamePhase] = useState<'pre' | 'playing' | 'post'>('pre');
  const [gameResults, setGameResults] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showHint, setShowHint] = useState(false);

  const trail = getTrailByCategory(category);
  const content = educationalContent[gameId as keyof typeof educationalContent];

  useEffect(() => {
    if (trail) {
      setCurrentLevel(trail.current_level);
    }
  }, [trail]);

  const startGame = () => {
    setSessionStartTime(new Date());
    setGamePhase('playing');
    setShowHint(false);
  };

  const handleGameComplete = async (results: any) => {
    if (!user || !sessionStartTime || !trail) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000);
    
    setGameResults(results);
    setGamePhase('post');

    // Registrar sessão no sistema educacional
    try {
      await recordLearningSession({
        trail_id: trail.id,
        game_type: gameId,
        level: currentLevel,
        performance_data: results,
        learning_indicators: {
          completion_time: duration,
          accuracy: results.accuracy || 0,
          level_completed: currentLevel
        },
        session_duration_seconds: duration,
        completed: true
      });

      if (onGameComplete) {
        onGameComplete(results);
      }
    } catch (error) {
      console.error('Error recording learning session:', error);
    }
  };

  const resetGame = () => {
    setGamePhase('pre');
    setGameResults(null);
    setSessionStartTime(null);
    setShowHint(false);
  };

  const getPerformanceFeedback = (accuracy: number) => {
    if (!content) return '';
    
    if (accuracy >= 80) return content.postGame.feedback.high;
    if (accuracy >= 60) return content.postGame.feedback.medium;
    return content.postGame.feedback.low;
  };

  const getRandomEncouragement = () => {
    if (!content) return 'Continue assim!';
    const encouragements = content.duringGame.encouragements;
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const getRandomHint = () => {
    if (!content) return '';
    const hints = content.duringGame.hints;
    return hints[Math.floor(Math.random() * hints.length)];
  };

  if (!content) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Conteúdo educacional não encontrado para este jogo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Cabeçalho com informações do nível */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{content.title}</h1>
            <p className="text-muted-foreground">Desenvolvimento Cognitivo Personalizado</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Nível {currentLevel}
            </Badge>
            {trail && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                {trail.total_xp} XP
              </Badge>
            )}
          </div>
        </div>
        
        {trail && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso no Nível</span>
              <span>{trail.completed_exercises}/5 exercícios</span>
            </div>
            <Progress value={(trail.completed_exercises / 5) * 100} className="h-2" />
          </div>
        )}
      </div>

      {/* Fase Pré-Jogo: Explicações e Preparação */}
      {gamePhase === 'pre' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Vamos Aprender!</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Objetivo
                </h3>
                <p className="text-muted-foreground">{content.preGame.objective}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">📋 Como Jogar</h3>
                <ul className="space-y-2">
                  {content.preGame.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">💡 Dicas para o Sucesso</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {content.preGame.tips.map((tip, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button onClick={startGame} size="lg" className="shadow-glow">
                <Play className="w-5 h-5 mr-2" />
                Começar Exercício
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Fase Durante o Jogo */}
      {gamePhase === 'playing' && (
        <div className="space-y-4">
          {/* Barra de controle durante o jogo */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Dica
                </Button>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {sessionStartTime && (
                    <span>
                      {Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)}s
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reiniciar
                </Button>
              </div>
            </div>
            
            {showHint && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-800">{getRandomHint()}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Encorajamento aleatório */}
          <Card className="p-3 bg-gradient-subtle">
            <p className="text-center font-medium text-primary">
              {getRandomEncouragement()}
            </p>
          </Card>

          {/* Conteúdo do jogo */}
          <div onClick={() => setShowHint(false)}>
            {children}
          </div>
        </div>
      )}

      {/* Fase Pós-Jogo: Resultados e Aprendizado */}
      {gamePhase === 'post' && gameResults && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Parabéns! Exercício Concluído!
              </h2>
              <p className="text-muted-foreground">
                {getPerformanceFeedback(gameResults.accuracy || 0)}
              </p>
            </div>

            {/* Métricas de desempenho */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {Math.round(gameResults.accuracy || 0)}%
                </div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round((sessionStartTime ? (Date.now() - sessionStartTime.getTime()) / 1000 : 0))}s
                </div>
                <div className="text-sm text-muted-foreground">Tempo</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  +{Math.round(10 + (gameResults.accuracy || 0) * 0.5)}
                </div>
                <div className="text-sm text-muted-foreground">XP Ganho</div>
              </div>
            </div>

            {/* Pontos de aprendizado */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                O que Aprendemos
              </h3>
              <ul className="space-y-2">
                {content.postGame.learningPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Jogar Novamente
              </Button>
              <Button onClick={() => window.history.back()}>
                Próximo Exercício
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}