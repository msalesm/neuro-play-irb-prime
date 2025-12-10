import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EmotionalState, SessionSummary } from '@/hooks/useUnifiedPatientData';

interface EmotionalTimelineProps {
  emotionalHistory: EmotionalState[];
  sessions: SessionSummary[];
}

const moodEmojis: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊'
};

const moodLabels: Record<number, string> = {
  1: 'Muito Triste',
  2: 'Triste',
  3: 'Neutro',
  4: 'Feliz',
  5: 'Muito Feliz'
};

export function EmotionalTimeline({ emotionalHistory, sessions }: EmotionalTimelineProps) {
  const timelineData = useMemo(() => {
    // Combine emotional and cognitive data by date
    const dataByDate: Record<string, { 
      date: string; 
      mood?: number; 
      accuracy?: number;
      emotions: string[];
    }> = {};

    emotionalHistory.forEach(e => {
      const date = e.date.split('T')[0];
      if (!dataByDate[date]) {
        dataByDate[date] = { date, emotions: [] };
      }
      dataByDate[date].mood = e.mood;
      dataByDate[date].emotions = e.emotions;
    });

    sessions.forEach(s => {
      const date = s.date.split('T')[0];
      if (!dataByDate[date]) {
        dataByDate[date] = { date, emotions: [] };
      }
      dataByDate[date].accuracy = s.accuracy;
    });

    return Object.values(dataByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [emotionalHistory, sessions]);

  const avgMood = useMemo(() => {
    const moods = emotionalHistory.slice(0, 7).map(e => e.mood);
    if (moods.length === 0) return 3;
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  }, [emotionalHistory]);

  const moodTrend = useMemo(() => {
    if (emotionalHistory.length < 4) return 'stable';
    const recent = emotionalHistory.slice(0, 3).reduce((sum, e) => sum + e.mood, 0) / 3;
    const older = emotionalHistory.slice(3, 6).reduce((sum, e) => sum + e.mood, 0) / Math.min(3, emotionalHistory.slice(3, 6).length);
    if (recent > older + 0.3) return 'improving';
    if (recent < older - 0.3) return 'declining';
    return 'stable';
  }, [emotionalHistory]);

  const emotionFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    emotionalHistory.forEach(e => {
      e.emotions.forEach(emotion => {
        freq[emotion] = (freq[emotion] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [emotionalHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Timeline Emocional
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{moodEmojis[Math.round(avgMood)]}</span>
            {moodTrend === 'improving' && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <TrendingUp className="w-3 h-3 mr-1" /> Melhorando
              </Badge>
            )}
            {moodTrend === 'declining' && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <TrendingDown className="w-3 h-3 mr-1" /> Atenção
              </Badge>
            )}
            {moodTrend === 'stable' && (
              <Badge variant="outline" className="text-muted-foreground">
                <Minus className="w-3 h-3 mr-1" /> Estável
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Combined Chart */}
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'dd/MM', { locale: ptBR })}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <YAxis 
                yAxisId="mood"
                domain={[1, 5]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => moodEmojis[value] || ''}
              />
              <YAxis 
                yAxisId="accuracy"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'mood') return [moodLabels[value] || value, 'Humor'];
                  return [`${value}%`, 'Precisão'];
                }}
              />
              <Area 
                yAxisId="mood"
                type="monotone" 
                dataKey="mood" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Line 
                yAxisId="accuracy"
                type="monotone" 
                dataKey="accuracy" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Frequency */}
        {emotionFrequency.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Emoções Frequentes</p>
            <div className="flex flex-wrap gap-2">
              {emotionFrequency.map(([emotion, count]) => (
                <Badge key={emotion} variant="secondary" className="text-xs">
                  {emotion} ({count}x)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        {emotionalHistory.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Check-ins Recentes</p>
            {emotionalHistory.slice(0, 3).map((e, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <span className="text-xl">{moodEmojis[e.mood]}</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(e.date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {e.notes && (
                    <p className="text-sm line-clamp-1">{e.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
