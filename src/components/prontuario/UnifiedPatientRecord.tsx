import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, Brain, Heart, Activity, FileText, 
  Download, RefreshCw, Calendar, Clock,
  TrendingUp, AlertCircle, Target, Users, Sparkles, Video,
  ClipboardCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUnifiedPatientData } from '@/hooks/useUnifiedPatientData';
import { CognitiveMapRadar } from './CognitiveMapRadar';
import { EmotionalTimeline } from './EmotionalTimeline';
import { PredictiveInsightsPanel } from './PredictiveInsightsPanel';
import { RoutineHub } from './RoutineHub';
import { ImmediateInterventions } from './ImmediateInterventions';
import { MultidisciplinaryPanel } from './MultidisciplinaryPanel';
import { IntegratedTimeline } from './IntegratedTimeline';
import { AIReportGenerator } from './AIReportGenerator';
import { TeleconsultTab } from './TeleconsultTab';
import { DiagnosticsTab } from './DiagnosticsTab';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';

interface UnifiedPatientRecordProps {
  childId: string;
  onGenerateReport?: () => void;
}

export function UnifiedPatientRecord({ childId, onGenerateReport }: UnifiedPatientRecordProps) {
  const { data, loading, error, refresh } = useUnifiedPatientData(childId);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !data?.profile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">Erro ao carregar prontuário</p>
          <p className="text-muted-foreground">{error || 'Paciente não encontrado'}</p>
          <Button onClick={refresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { profile, cognitiveMetrics, cognitiveHistory, emotionalHistory, recentSessions, behavioralPatterns, predictiveInsights, weeklyTrends, correlations } = data;

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ChildAvatarDisplay
                avatar={profile.avatarUrl}
                name={profile.name}
                size="xl"
              />
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.age} anos</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.conditions.map((condition, idx) => (
                    <Badge key={idx} variant="secondary">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              {onGenerateReport && (
                <Button size="sm" onClick={onGenerateReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório IA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Cognitivo</p>
                <p className="text-2xl font-bold">
                  {Math.round(Object.values(cognitiveMetrics).reduce((a, b) => a + b, 0) / 6)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estabilidade Emocional</p>
                <p className="text-2xl font-bold">{weeklyTrends.emotionalStability}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engajamento</p>
                <p className="text-2xl font-bold">{weeklyTrends.engagement}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#c7923e]/10">
                <Target className="w-6 h-6 text-[#c7923e]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precisão Média</p>
                <p className="text-2xl font-bold">{weeklyTrends.accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap justify-start gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1 text-xs px-2">
            <User className="w-3 h-3" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="flex items-center gap-1 text-xs px-2">
            <Brain className="w-3 h-3" />
            <span className="hidden md:inline">Cognitivo</span>
          </TabsTrigger>
          <TabsTrigger value="emotional" className="flex items-center gap-1 text-xs px-2">
            <Heart className="w-3 h-3" />
            <span className="hidden md:inline">Emocional</span>
          </TabsTrigger>
          <TabsTrigger value="routine" className="flex items-center gap-1 text-xs px-2">
            <Activity className="w-3 h-3" />
            <span className="hidden md:inline">Rotina</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1 text-xs px-2">
            <Clock className="w-3 h-3" />
            <span className="hidden md:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="multidisciplinary" className="flex items-center gap-1 text-xs px-2">
            <Users className="w-3 h-3" />
            <span className="hidden md:inline">Equipe</span>
          </TabsTrigger>
          <TabsTrigger value="teleconsult" className="flex items-center gap-1 text-xs px-2">
            <Video className="w-3 h-3" />
            <span className="hidden md:inline">Teleconsulta</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-1 text-xs px-2">
            <ClipboardCheck className="w-3 h-3" />
            <span className="hidden md:inline">Diagnósticos</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1 text-xs px-2">
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">Relatórios IA</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-1 text-xs px-2">
            <TrendingUp className="w-3 h-3" />
            <span className="hidden md:inline">Preditivo</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tendências Semanais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Precisão</span>
                    <span className="text-sm font-medium">{weeklyTrends.accuracy}%</span>
                  </div>
                  <Progress value={weeklyTrends.accuracy} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Engajamento</span>
                    <span className="text-sm font-medium">{weeklyTrends.engagement}%</span>
                  </div>
                  <Progress value={weeklyTrends.engagement} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Consistência</span>
                    <span className="text-sm font-medium">{weeklyTrends.consistency}%</span>
                  </div>
                  <Progress value={weeklyTrends.consistency} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Estabilidade Emocional</span>
                    <span className="text-sm font-medium">{weeklyTrends.emotionalStability}%</span>
                  </div>
                  <Progress value={weeklyTrends.emotionalStability} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Sessões Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma sessão registrada ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentSessions.slice(0, 5).map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Brain className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Sessão de {format(new Date(session.date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.date), 'HH:mm', { locale: ptBR })} • {Math.round(session.duration / 60)} min
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{Math.round(session.accuracy)}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Behavioral Patterns */}
          {behavioralPatterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Padrões Comportamentais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {behavioralPatterns.map((pattern, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium capitalize">{pattern.type.replace('_', ' ')}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{pattern.frequency}x</span>
                        <Badge 
                          variant="outline" 
                          className={
                            pattern.trend === 'improving' ? 'text-green-600 border-green-600' :
                            pattern.trend === 'declining' ? 'text-red-600 border-red-600' :
                            'text-muted-foreground'
                          }
                        >
                          {pattern.trend === 'improving' ? '↑' : pattern.trend === 'declining' ? '↓' : '→'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cognitive Tab */}
        <TabsContent value="cognitive" className="mt-6">
          <CognitiveMapRadar 
            current={cognitiveMetrics}
            previous={cognitiveHistory[0]?.metrics}
          />
        </TabsContent>

        {/* Emotional Tab */}
        <TabsContent value="emotional" className="mt-6">
          <EmotionalTimeline 
            emotionalHistory={emotionalHistory}
            sessions={recentSessions}
          />
        </TabsContent>

        {/* Routine Tab */}
        <TabsContent value="routine" className="mt-6 space-y-6">
          <RoutineHub childId={childId} />
          <ImmediateInterventions childId={childId} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <IntegratedTimeline childId={childId} />
        </TabsContent>

        {/* Multidisciplinary Tab */}
        <TabsContent value="multidisciplinary" className="mt-6">
          <MultidisciplinaryPanel childId={childId} userRole="therapist" />
        </TabsContent>

        {/* Teleconsult Tab */}
        <TabsContent value="teleconsult" className="mt-6">
          <TeleconsultTab childId={childId} />
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="mt-6">
          <DiagnosticsTab childId={childId} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <AIReportGenerator childId={childId} childName={profile.name} />
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="mt-6">
          <PredictiveInsightsPanel 
            insights={predictiveInsights}
            correlations={correlations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
