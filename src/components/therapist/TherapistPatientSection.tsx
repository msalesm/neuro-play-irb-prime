import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Activity, Clock, Target, ChevronRight, 
  Gamepad2, Brain, AlertCircle, UserPlus
} from 'lucide-react';
import { useTherapistPatientProgress, PatientProgress } from '@/hooks/useTherapistPatientProgress';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TherapistPatientSectionProps {
  onViewDetails?: (patientId: string) => void;
  onAddPatient?: () => void;
}

export function TherapistPatientSection({ onViewDetails, onAddPatient }: TherapistPatientSectionProps) {
  const { patients, loading } = useTherapistPatientProgress();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Progresso dos Pacientes
          </CardTitle>
          {onAddPatient && (
            <Button variant="outline" size="sm" onClick={onAddPatient}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Paciente
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum paciente vinculado</p>
            {onAddPatient && (
              <Button variant="link" onClick={onAddPatient} className="mt-2">
                Adicionar primeiro paciente
              </Button>
            )}
          </div>
        ) : (
          patients.map((patient) => (
            <PatientCard 
              key={patient.id} 
              patient={patient} 
              formatPlayTime={formatPlayTime}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface PatientCardProps {
  patient: PatientProgress;
  formatPlayTime: (seconds: number) => string;
  onViewDetails?: (patientId: string) => void;
}

function PatientCard({ patient, formatPlayTime, onViewDetails }: PatientCardProps) {
  const needsAttention = patient.totalSessions === 0 || 
    (patient.lastActivity && new Date(patient.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  return (
    <div className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {patient.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{patient.name}</h3>
              {needsAttention && (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">{patient.age} anos</span>
              {patient.conditions.map((condition, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
            {patient.lastActivity && (
              <span className="text-xs text-muted-foreground">
                Última atividade: {formatDistanceToNow(new Date(patient.lastActivity), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            )}
          </div>
        </div>
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(patient.childId)}
          >
            Ver detalhes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-background/50">
          <Gamepad2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{patient.totalSessions}</p>
          <p className="text-xs text-muted-foreground">Sessões</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{patient.avgAccuracy}%</p>
          <p className="text-xs text-muted-foreground">Precisão</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{formatPlayTime(patient.totalPlayTime)}</p>
          <p className="text-xs text-muted-foreground">Tempo</p>
        </div>
      </div>

      {/* Cognitive Scores */}
      {(patient.cognitiveScores.attention > 0 || patient.cognitiveScores.memory > 0) && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Perfil Cognitivo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {patient.cognitiveScores.attention > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Atenção</span>
                <span className="font-medium">{patient.cognitiveScores.attention}%</span>
              </div>
            )}
            {patient.cognitiveScores.memory > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Memória</span>
                <span className="font-medium">{patient.cognitiveScores.memory}%</span>
              </div>
            )}
            {patient.cognitiveScores.language > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Linguagem</span>
                <span className="font-medium">{patient.cognitiveScores.language}%</span>
              </div>
            )}
            {patient.cognitiveScores.executive > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Executivo</span>
                <span className="font-medium">{patient.cognitiveScores.executive}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Games */}
      {patient.recentGames.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividades Recentes
          </p>
          <div className="space-y-2">
            {patient.recentGames.slice(0, 3).map((game, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded bg-background/30 text-sm"
              >
                <span className="font-medium">{game.game_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {game.accuracy}%
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
      {patient.avgAccuracy > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium">{patient.avgAccuracy}%</span>
          </div>
          <Progress value={patient.avgAccuracy} className="h-2" />
        </div>
      )}
    </div>
  );
}
