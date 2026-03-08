import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Clock, Shield } from 'lucide-react';

interface RiskIndicator {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: string[];
  recommendations: string[];
  timeline: string;
}

interface RiskIndicatorCardProps {
  riskIndicator: RiskIndicator;
  onViewDetails: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function RiskIndicatorCard({ riskIndicator, onViewDetails, onRefresh, loading }: RiskIndicatorCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-6 h-6" />;
      case 'medium':
        return <Activity className="w-6 h-6" />;
      case 'low':
        return <Shield className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Risco Crítico';
      case 'high': return 'Risco Alto';
      case 'medium': return 'Risco Médio';
      case 'low': return 'Risco Baixo';
      default: return 'Risco Desconhecido';
    }
  };

  const getRiskMessage = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Atenção urgente necessária. Considere contato com profissional imediatamente.';
      case 'high':
        return 'Monitoramento próximo recomendado. Ajustes na rotina podem ser necessários.';
      case 'medium':
        return 'Observar comportamento de perto. Intervenções preventivas podem ajudar.';
      case 'low':
        return 'Situação estável. Continue monitorando rotineiramente.';
      default:
        return 'Análise em andamento.';
    }
  };

  const colorClass = getRiskColor(riskIndicator.level);

  return (
    <Card className={`border-l-4 ${colorClass}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${colorClass}`}>
              {getRiskIcon(riskIndicator.level)}
            </div>
            <div>
              <CardTitle className="text-xl">Análise Preditiva de Risco</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getRiskMessage(riskIndicator.level)}
              </p>
            </div>
          </div>
          <Badge className={colorClass} variant="outline">
            {getRiskLabel(riskIndicator.level)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Índice de Risco</span>
            <span className="text-2xl font-bold">{riskIndicator.score}%</span>
          </div>
          <Progress 
            value={riskIndicator.score} 
            className={`h-3 ${
              riskIndicator.level === 'critical' ? '[&>div]:bg-red-600' :
              riskIndicator.level === 'high' ? '[&>div]:bg-orange-600' :
              riskIndicator.level === 'medium' ? '[&>div]:bg-yellow-600' :
              '[&>div]:bg-green-600'
            }`}
          />
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Timeline de Atenção</p>
            <p className="text-xs text-muted-foreground">{riskIndicator.timeline}</p>
          </div>
        </div>

        {/* Indicators */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
            Indicadores Detectados
          </h4>
          <ul className="space-y-2">
            {riskIndicator.indicators.slice(0, 4).map((indicator, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  riskIndicator.level === 'critical' || riskIndicator.level === 'high' 
                    ? 'bg-red-500' 
                    : riskIndicator.level === 'medium' 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`} />
                <span className="text-muted-foreground">{indicator}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Recomendações Preventivas
          </h4>
          <ul className="space-y-2">
            {riskIndicator.recommendations.slice(0, 3).map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1 flex-shrink-0">✓</span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={onViewDetails} 
            className="flex-1"
            variant={riskIndicator.level === 'critical' || riskIndicator.level === 'high' ? 'default' : 'outline'}
          >
            Ver Análise Completa
          </Button>
          <Button 
            onClick={onRefresh} 
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
