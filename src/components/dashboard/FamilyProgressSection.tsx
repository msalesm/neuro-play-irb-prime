import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Activity, Clock, Target, ChevronRight, 
  TrendingUp, Gamepad2, Calendar 
} from 'lucide-react';
import { useFamilyProgress, FamilyMember } from '@/hooks/useFamilyProgress';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RELATIONSHIP_LABELS: Record<string, string> = {
  filho: 'Filho',
  filha: 'Filha',
  neto: 'Neto',
  neta: 'Neta',
  sobrinho: 'Sobrinho',
  sobrinha: 'Sobrinha',
  outro: 'Familiar'
};

interface FamilyProgressSectionProps {
  onViewDetails?: (memberId: string) => void;
}

export function FamilyProgressSection({ onViewDetails }: FamilyProgressSectionProps) {
  const { familyMembers, loading } = useFamilyProgress();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  if (familyMembers.length === 0) {
    return null;
  }

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Progresso de Familiares Vinculados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {familyMembers.map((member) => (
          <FamilyMemberCard 
            key={member.id} 
            member={member} 
            formatPlayTime={formatPlayTime}
            onViewDetails={onViewDetails}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface FamilyMemberCardProps {
  member: FamilyMember;
  formatPlayTime: (seconds: number) => string;
  onViewDetails?: (memberId: string) => void;
}

function FamilyMemberCard({ member, formatPlayTime, onViewDetails }: FamilyMemberCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{member.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
              </Badge>
              {member.lastActivity && (
                <span className="text-xs text-muted-foreground">
                  Ativo {formatDistanceToNow(new Date(member.lastActivity), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(member.id)}
          >
            Ver detalhes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-background/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold">{member.totalSessions}</p>
          <p className="text-xs text-muted-foreground">Sessões</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold">{member.avgAccuracy}%</p>
          <p className="text-xs text-muted-foreground">Precisão</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold">{formatPlayTime(member.totalPlayTime)}</p>
          <p className="text-xs text-muted-foreground">Tempo</p>
        </div>
      </div>

      {/* Recent Games */}
      {member.recentGames.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividades Recentes
          </p>
          <div className="space-y-2">
            {member.recentGames.slice(0, 3).map((game, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded bg-background/30 text-sm"
              >
                <span className="font-medium">{game.game_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {game.accuracy}% precisão
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {game.score} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {member.avgAccuracy > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium">{member.avgAccuracy}%</span>
          </div>
          <Progress value={member.avgAccuracy} className="h-2" />
        </div>
      )}
    </div>
  );
}
