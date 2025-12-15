import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PerformanceMetric {
  metric_date: string;
  total_cases: number;
  completed_cases: number;
  avg_wait_time_minutes: number;
  avg_service_time_minutes: number;
  sla_compliance_rate: number;
  sla_breaches: number;
  high_risk_cases: number;
}

interface Props {
  metrics: PerformanceMetric[];
}

export function PerformanceMetrics({ metrics }: Props) {
  const chartData = metrics.slice(0, 14).reverse().map(m => ({
    date: format(new Date(m.metric_date), 'dd/MM', { locale: ptBR }),
    casos: m.total_cases,
    concluidos: m.completed_cases,
    sla: m.sla_compliance_rate,
    tempoEspera: Math.round(m.avg_wait_time_minutes),
    tempoAtendimento: Math.round(m.avg_service_time_minutes)
  }));

  const latestMetrics = metrics[0];
  const previousMetrics = metrics[1];

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const stats = latestMetrics ? [
    {
      title: 'Casos Hoje',
      value: latestMetrics.total_cases,
      trend: previousMetrics ? calculateTrend(latestMetrics.total_cases, previousMetrics.total_cases) : 0,
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      title: 'Taxa de Conclusão',
      value: latestMetrics.total_cases > 0 
        ? `${Math.round((latestMetrics.completed_cases / latestMetrics.total_cases) * 100)}%`
        : '0%',
      trend: null,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: 'Tempo Médio Espera',
      value: `${Math.round(latestMetrics.avg_wait_time_minutes)} min`,
      trend: previousMetrics ? calculateTrend(latestMetrics.avg_wait_time_minutes, previousMetrics.avg_wait_time_minutes) : 0,
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      title: 'Conformidade SLA',
      value: `${Math.round(latestMetrics.sla_compliance_rate)}%`,
      trend: previousMetrics ? calculateTrend(latestMetrics.sla_compliance_rate, previousMetrics.sla_compliance_rate) : 0,
      icon: AlertTriangle,
      color: latestMetrics.sla_compliance_rate >= 90 ? 'text-green-500' : 'text-orange-500'
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  {stat.trend !== null && stat.trend !== 0 && (
                    <p className={`text-xs ${Number(stat.trend) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(stat.trend) > 0 ? '+' : ''}{stat.trend}% vs ontem
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de Casos (14 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="casos" name="Total" fill="hsl(var(--primary))" />
                <Bar dataKey="concluidos" name="Concluídos" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">SLA e Tempos (14 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="tempoEspera" 
                  name="Espera (min)" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="sla" 
                  name="SLA (%)" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
