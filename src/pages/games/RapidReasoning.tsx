import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Timer, CheckCircle, X, Home, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  type: 'math' | 'logic' | 'pattern' | 'word';
  question: string;
  options: string[];
  correct: number;
  timeLimit: number;
}

const generateQuestions = (): Question[] => {
  const questions: Question[] = [];
  
  // Matemática rápida
  for (let i = 0; i < 5; i++) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '×';
    const answer = operation === '+' ? a + b : a * b;
    const wrong1 = answer + Math.floor(Math.random() * 5) + 1;
    const wrong2 = answer - Math.floor(Math.random() * 3) - 1;
    const wrong3 = answer + Math.floor(Math.random() * 8) + 2;
    
    const options = [answer, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
    
    questions.push({
      id: i + 1,
      type: 'math',
      question: `${a} ${operation} ${b} = ?`,
      options: options.map(String),
      correct: options.indexOf(answer),
      timeLimit: 8000
    });
  }
  
  // Lógica de padrões
  const patterns = [
    { sequence: [2, 4, 6, 8], next: 10, wrong: [12, 9, 7] },
    { sequence: [1, 3, 9, 27], next: 81, wrong: [54, 72, 63] },
    { sequence: [100, 90, 80, 70], next: 60, wrong: [50, 65, 55] },
    { sequence: [2, 6, 18, 54], next: 162, wrong: [108, 144, 126] },
    { sequence: [1, 4, 7, 10], next: 13, wrong: [11, 12, 15] }
  ];
  
  patterns.forEach((pattern, i) => {
    const options = [pattern.next, ...pattern.wrong].sort(() => Math.random() - 0.5);
    questions.push({
      id: i + 6,
      type: 'pattern',
      question: `Qual é o próximo número: ${pattern.sequence.join(', ')}, ?`,
      options: options.map(String),
      correct: options.indexOf(pattern.next),
      timeLimit: 12000
    });
  });
  
  // Analogias verbais
  const analogies = [
    { question: 'Gato está para Miau, como Cão está para:', correct: 'Latir', wrong: ['Correr', 'Dormir', 'Comer'] },
    { question: 'Dia está para Sol, como Noite está para:', correct: 'Lua', wrong: ['Estrela', 'Escuro', 'Frio'] },
    { question: 'Livro está para Ler, como Música está para:', correct: 'Ouvir', wrong: ['Cantar', 'Dançar', 'Tocar'] },
    { question: 'Água está para Sede, como Comida está para:', correct: 'Fome', wrong: ['Sabor', 'Mesa', 'Prato'] },
    { question: 'Fogo está para Quente, como Gelo está para:', correct: 'Frio', wrong: ['Água', 'Inverno', 'Branco'] }
  ];
  
  analogies.forEach((analogy, i) => {
    const options = [analogy.correct, ...analogy.wrong].sort(() => Math.random() - 0.5);
    questions.push({
      id: i + 11,
      type: 'word',
      question: analogy.question,
      options,
      correct: options.indexOf(analogy.correct),
      timeLimit: 10000
    });
  });
  
  return questions.sort(() => Math.random() - 0.5);
};

export default function RapidReasoning() {
  const [questions] = useState<Question[]>(generateQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'answered' | 'finished'>('ready');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  const startQuestion = useCallback(() => {
    if (currentQuestion < questions.length) {
      const question = questions[currentQuestion];
      setTimeLeft(question.timeLimit);
      setSelectedAnswer(null);
      setGameState('playing');
      setQuestionStartTime(Date.now());
    } else {
      setGameState('finished');
    }
  }, [currentQuestion, questions]);

  const selectAnswer = useCallback((answerIndex: number) => {
    if (gameState !== 'playing') return;
    
    const reactionTime = Date.now() - questionStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setSelectedAnswer(answerIndex);
    setGameState('answered');
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      const timeBonus = Math.max(0, (timeLeft / 1000) - 2) * 10;
      setScore(prev => prev + 100 + Math.floor(timeBonus));
    }

    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      startQuestion();
    }, 2000);
  }, [gameState, questionStartTime, timeLeft, questions, currentQuestion, startQuestion]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft <= 0) {
      selectAnswer(-1); // Tempo esgotado
    }
  }, [gameState, timeLeft, selectAnswer]);

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setReactionTimes([]);
    setGameState('ready');
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl shadow-card border-0">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Neuroplasticidade</span>
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Raciocínio Rápido
            </CardTitle>
            
            <p className="text-muted-foreground text-lg">
              Treine sua velocidade de processamento mental com desafios de matemática, lógica e analogias.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
                <div className="text-2xl font-bold text-yellow-700 mb-1">15</div>
                <div className="text-sm text-yellow-600">Questões</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-100 to-red-100">
                <div className="text-2xl font-bold text-orange-700 mb-1">8-12s</div>
                <div className="text-sm text-orange-600">Por questão</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-red-100 to-pink-100">
                <div className="text-2xl font-bold text-red-700 mb-1">Meta</div>
                <div className="text-sm text-red-600">1200+ pontos</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tipos de Desafio:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Cálculos rápidos</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm">Sequências lógicas</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm">Analogias verbais</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-sm">Raciocínio dedutivo</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={startQuestion} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Zap className="w-4 h-4 mr-2" />
                Iniciar Treinamento
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/neuroplasticity">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const accuracy = (score / (questions.length * 100)) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl shadow-card border-0">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Treinamento Concluído</span>
            </div>
            
            <CardTitle className="text-3xl font-bold text-primary">
              Resultados do Raciocínio Rápido
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                <div className="text-3xl font-bold text-green-700 mb-1">{score}</div>
                <div className="text-sm text-green-600">Pontuação Total</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                <div className="text-3xl font-bold text-blue-700 mb-1">{accuracy.toFixed(0)}%</div>
                <div className="text-sm text-blue-600">Precisão</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="text-3xl font-bold text-purple-700 mb-1">{(avgReactionTime / 1000).toFixed(1)}s</div>
                <div className="text-sm text-purple-600">Tempo Médio</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Análise de Desempenho:</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Velocidade de Processamento:</span>
                  <Badge variant={avgReactionTime < 4000 ? "default" : avgReactionTime < 6000 ? "secondary" : "outline"}>
                    {avgReactionTime < 4000 ? 'Excelente' : avgReactionTime < 6000 ? 'Bom' : 'Precisa melhorar'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Precisão:</span>
                  <Badge variant={accuracy >= 80 ? "default" : accuracy >= 60 ? "secondary" : "outline"}>
                    {accuracy >= 80 ? 'Excelente' : accuracy >= 60 ? 'Bom' : 'Precisa melhorar'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pontuação:</span>
                  <Badge variant={score >= 1200 ? "default" : score >= 800 ? "secondary" : "outline"}>
                    {score >= 1200 ? 'Meta atingida!' : score >= 800 ? 'Quase lá!' : 'Continue praticando'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={resetGame} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Treinar Novamente
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/neuroplasticity">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Hub
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const timeProgress = (timeLeft / question.timeLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl shadow-card border-0">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Questão {currentQuestion + 1} de {questions.length}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              {(timeLeft / 1000).toFixed(1)}s
            </div>
          </div>
          
          <Progress value={timeProgress} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Raciocínio Rápido</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Pontuação: {score}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{question.question}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  gameState === 'answered'
                    ? index === question.correct
                      ? 'default'
                      : index === selectedAnswer
                      ? 'destructive'
                      : 'outline'
                    : 'outline'
                }
                size="lg"
                onClick={() => selectAnswer(index)}
                disabled={gameState !== 'playing'}
                className="h-auto py-4 text-left justify-start relative"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {gameState === 'answered' && (
                    <div className="ml-auto">
                      {index === question.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {index === selectedAnswer && index !== question.correct && <X className="w-5 h-5 text-red-600" />}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {gameState === 'answered' && (
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {selectedAnswer === question.correct 
                  ? '✅ Correto! Processamento rápido e preciso.'
                  : selectedAnswer === -1 
                  ? '⏰ Tempo esgotado! Tente ser mais rápido.'
                  : '❌ Incorreto. Continue praticando para melhorar.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}