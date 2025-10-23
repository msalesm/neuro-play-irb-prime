import { Brain, Activity, Target, Clock, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const metrics = [
  { label: 'Velocidade de reação', value: '285ms', icon: Zap, color: 'text-yellow-500' },
  { label: 'Precisão', value: '94%', icon: Target, color: 'text-green-500' },
  { label: 'Persistência', value: 'Alta', icon: TrendingUp, color: 'text-blue-500' },
  { label: 'Consistência', value: '88%', icon: Activity, color: 'text-purple-500' },
  { label: 'Tempo de foco', value: '12min', icon: Clock, color: 'text-orange-500' },
];

export function AIDiagnosticSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <div>
            <Badge className="mb-4" variant="secondary">
              <Brain className="w-4 h-4 mr-2" />
              Inteligência Artificial
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nosso algoritmo entende o seu modo de pensar
            </h2>

            <p className="text-xl text-muted-foreground mb-8">
              A IA analisa mais de 50 variáveis durante o jogo para criar um perfil cognitivo completo e personalizado
            </p>

            {/* Example Result */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Exemplo de Resultado:</p>
                    <p className="text-sm text-muted-foreground italic">
                      "Seu perfil sugere atenção flutuante e excelente raciocínio lógico. Recomendamos jogos de foco sustentado para desenvolvimento."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Animated Metrics Panel */}
          <div>
            <Card className="border-2 shadow-glow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold">Análise em Tempo Real</span>
                </div>

                {/* Metrics List */}
                <div className="space-y-4">
                  {metrics.map((metric, index) => (
                    <div 
                      key={metric.label}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-smooth animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      <span className="text-lg font-bold">{metric.value}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Bars */}
                <div className="mt-6 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Processando dados...</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary w-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
