import { Card, CardContent } from '@/components/ui/card';
import { Activity, Star, Clock, FileText } from 'lucide-react';

interface Props {
  totalSessions: number;
  avgAccuracy: number;
  totalPlayTime: number;
  reportsCount: number;
}

export function TherapistQuickStats({ totalSessions, avgAccuracy, totalPlayTime, reportsCount }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Sessões</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Precisão Média</p>
              <p className="text-2xl font-bold">{avgAccuracy}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Tempo Total</p>
              <p className="text-2xl font-bold">{totalPlayTime} min</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Relatórios</p>
              <p className="text-2xl font-bold">{reportsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
