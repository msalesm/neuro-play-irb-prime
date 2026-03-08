/**
 * School Weekly Engagement — Weekly activity chart
 * 
 * Shows how many students were active each day of the week,
 * avg session time, and total activities completed.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Activity, Clock, Target } from 'lucide-react';

interface DailyEngagement {
  day: string;         // "Seg", "Ter", etc.
  activeStudents: number;
  totalActivities: number;
  avgSessionMinutes: number;
}

interface SchoolWeeklyEngagementProps {
  weekData: DailyEngagement[];
  totalStudents: number;
}

export function SchoolWeeklyEngagement({ weekData, totalStudents }: SchoolWeeklyEngagementProps) {
  const totalActive = weekData.reduce((sum, d) => sum + d.activeStudents, 0);
  const totalActivities = weekData.reduce((sum, d) => sum + d.totalActivities, 0);
  const avgTime = weekData.length > 0
    ? Math.round(weekData.reduce((sum, d) => sum + d.avgSessionMinutes, 0) / weekData.length)
    : 0;
  const engagementRate = totalStudents > 0
    ? Math.round((totalActive / (totalStudents * weekData.length)) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Engajamento Semanal</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {engagementRate}% participação
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Activity className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{totalActivities}</p>
              <p className="text-[10px] text-muted-foreground">Atividades</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{avgTime} min</p>
              <p className="text-[10px] text-muted-foreground">Média/sessão</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Target className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{totalActive}</p>
              <p className="text-[10px] text-muted-foreground">Acessos</p>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              width={30}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                value, 
                name === 'activeStudents' ? 'Alunos ativos' : 'Atividades'
              ]}
            />
            <Bar 
              dataKey="activeStudents" 
              name="Alunos ativos"
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
