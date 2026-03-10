import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';

interface StudentData {
  id: string;
  name: string;
  avgAccuracy: number;
  sessionsCount: number;
  trend?: 'up' | 'stable' | 'down';
}

interface ClassProgressChartsProps {
  students: StudentData[];
  classStats: {
    totalStudents: number;
    averageAccuracy: number;
    totalSessions: number;
  };
  cognitiveScores?: {
    attention: number;
    memory: number;
    language: number;
    executive: number;
  };
}

export function ClassProgressCharts({ students, classStats, cognitiveScores }: ClassProgressChartsProps) {
  // Per-student accuracy bar chart
  const studentAccuracyData = students
    .slice(0, 20)
    .map(s => ({
      name: s.name.split(' ')[0],
      precisão: Math.round(s.avgAccuracy),
      sessões: s.sessionsCount,
    }))
    .sort((a, b) => b.precisão - a.precisão);

  // Distribution chart
  const ranges = [
    { range: '0-25%', count: 0, fill: 'hsl(var(--destructive))' },
    { range: '26-50%', count: 0, fill: 'hsl(var(--chart-4))' },
    { range: '51-75%', count: 0, fill: 'hsl(var(--chart-3))' },
    { range: '76-100%', count: 0, fill: 'hsl(var(--primary))' },
  ];
  students.forEach(s => {
    if (s.avgAccuracy <= 25) ranges[0].count++;
    else if (s.avgAccuracy <= 50) ranges[1].count++;
    else if (s.avgAccuracy <= 75) ranges[2].count++;
    else ranges[3].count++;
  });

  // Cognitive radar
  const radarData = cognitiveScores ? [
    { domain: 'Atenção', value: cognitiveScores.attention },
    { domain: 'Memória', value: cognitiveScores.memory },
    { domain: 'Linguagem', value: cognitiveScores.language },
    { domain: 'Executivo', value: cognitiveScores.executive },
  ] : [];

  // Trend summary
  const trendCounts = {
    up: students.filter(s => s.trend === 'up').length,
    stable: students.filter(s => s.trend === 'stable').length,
    down: students.filter(s => s.trend === 'down').length,
    none: students.filter(s => !s.trend).length,
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{classStats.averageAccuracy.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Precisão Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-chart-3">{trendCounts.up}</p>
            <p className="text-xs text-muted-foreground">Evoluindo ↑</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-chart-4">{trendCounts.stable + trendCounts.none}</p>
            <p className="text-xs text-muted-foreground">Estável →</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-destructive">{trendCounts.down}</p>
            <p className="text-xs text-muted-foreground">Em queda ↓</p>
          </CardContent>
        </Card>
      </div>

      {/* Student accuracy chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Precisão por Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          {studentAccuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentAccuracyData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number, name: string) => [`${value}${name === 'precisão' ? '%' : ''}`, name]}
                />
                <Bar dataKey="precisão" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ranges}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" name="Alunos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cognitive radar */}
        {radarData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Perfil Cognitivo da Turma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Turma"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
