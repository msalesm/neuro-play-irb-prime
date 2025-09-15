import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Brain, Target } from 'lucide-react';
import { withBiofeedback, useBiofeedbackIntegration } from '@/components/withBiofeedback';

function BiofeedbackDemoGame() {
  const { recordCorrectAnswer, recordIncorrectAnswer, state, checkAndTriggerBreathing } = useBiofeedbackIntegration();
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const simulateCorrectAnswer = () => {
    const responseTime = Math.random() * 1000 + 200; // 200-1200ms
    recordCorrectAnswer(responseTime, { action: 'correct_click' });
    setScore(prev => prev + 10);
    setAttempts(prev => prev + 1);
  };

  const simulateIncorrectAnswer = () => {
    const responseTime = Math.random() * 500 + 100; // 100-600ms (faster = more impulsive)
    recordIncorrectAnswer(responseTime, { action: 'incorrect_click' });
    setAttempts(prev => prev + 1);
    
    // Check if breathing should be triggered after error
    setTimeout(() => {
      checkAndTriggerBreathing();
    }, 500);
  };

  const simulateImpulsiveClicking = () => {
    // Simulate rapid clicking pattern
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const responseTime = Math.random() * 200 + 50; // Very fast responses
        recordIncorrectAnswer(responseTime, { action: 'impulsive_click', sequence: i });
        setAttempts(prev => prev + 1);
      }, i * 200);
    }
    
    setTimeout(() => {
      checkAndTriggerBreathing();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white mb-2">
              Sistema de Biofeedback
            </h1>
            <p className="text-white/90">
              Demonstração do sistema de regulação emocional
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/games" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demo Controls */}
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Simulador de Gameplay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={simulateCorrectAnswer}
                  variant="default"
                  className="w-full"
                >
                  ✅ Simular Acerto
                </Button>
                
                <Button 
                  onClick={simulateIncorrectAnswer}
                  variant="destructive"
                  className="w-full"
                >
                  ❌ Simular Erro
                </Button>
                
                <Button 
                  onClick={simulateImpulsiveClicking}
                  variant="secondary"
                  className="w-full"
                >
                  ⚡ Simular Impulsividade (5 cliques rápidos)
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{score}</p>
                    <p className="text-sm text-muted-foreground">Pontuação</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{attempts}</p>
                    <p className="text-sm text-muted-foreground">Tentativas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biofeedback Status */}
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Estado Emocional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Energy Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Energia Emocional</span>
                  <Badge 
                    variant={state.emotionalEnergy > 70 ? 'destructive' : 
                            state.emotionalEnergy > 40 ? 'secondary' : 'default'}
                  >
                    {Math.round(state.emotionalEnergy)}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      state.emotionalEnergy > 70 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                        : state.emotionalEnergy > 40 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                        : 'bg-gradient-to-r from-green-400 to-blue-400'
                    } ${state.emotionalEnergy > 70 ? 'animate-pulse' : ''}`}
                    style={{ width: `${Math.min(state.emotionalEnergy, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium text-center">
                    {state.consecutiveErrors}
                  </div>
                  <div className="text-muted-foreground text-center text-xs">
                    Erros Consecutivos
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium text-center">
                    {state.impulsivityLevel}%
                  </div>
                  <div className="text-muted-foreground text-center text-xs">
                    Nível Impulsividade
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium text-center">
                    {state.clickFrequency.toFixed(1)}
                  </div>
                  <div className="text-muted-foreground text-center text-xs">
                    Cliques/seg
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="font-medium text-center">
                    {Math.round(state.averageResponseTime)}ms
                  </div>
                  <div className="text-muted-foreground text-center text-xs">
                    Tempo Resposta
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2">
                {state.isBreathingExerciseActive && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Exercício de respiração ativo
                      </span>
                    </div>
                  </div>
                )}

                {state.emotionalEnergy > 70 && !state.isBreathingExerciseActive && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-orange-800 text-sm">
                      🧘‍♂️ Sistema detectou agitação emocional
                    </div>
                  </div>
                )}

                {state.consecutiveErrors >= 3 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-red-800 text-sm">
                      ⚠️ Padrão de múltiplos erros detectado
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Como Funciona o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🎯 Detecção Automática</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Monitora padrões de erro (3+ erros em 10s)</li>
                  <li>• Detecta cliques impulsivos (mais de 3 por segundo)</li>
                  <li>• Analisa tempo de resposta muito rápido (menos de 300ms)</li>
                  <li>• Calcula energia emocional baseada no comportamento</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🧘‍♂️ Intervenção Automática</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ativa exercícios de respiração quando necessário</li>
                  <li>• Padrões adaptativos baseados no nível de agitação</li>
                  <li>• Reduz energia emocional após completar exercícios</li>
                  <li>• Integra dados para educadores e análise</li>
                </ul>
              </div>
            </div>
                  <li>• Monitora padrões de erro (3+ erros em 10s)</li>
                  <li>• Detecta cliques impulsivos (>3 por segundo)</li>
                  <li>• Analisa tempo de resposta muito rápido (&lt;300ms)</li>
                  <li>• Calcula energia emocional baseada no comportamento</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🧘‍♂️ Intervenção Automática</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ativa exercícios de respiração quando necessário</li>
                  <li>• Padrões adaptativos baseados no nível de agitação</li>
                  <li>• Reduz energia emocional após completar exercícios</li>
                  <li>• Integra dados para educadores e análise</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Export the biofeedback-enhanced version
export default withBiofeedback(BiofeedbackDemoGame, {
  enableEnergyBar: true,
  energyBarPosition: 'bottom-right',
  autoTriggerBreathing: true,
});