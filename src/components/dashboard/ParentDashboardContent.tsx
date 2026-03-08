import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, TrendingUp, AlertCircle, Brain, Calendar, Award, Sparkles, Heart, Clock, Target, Trophy, Shield, FileText, BookOpen, Download, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ChildAvatarDisplay, DailyMissionSection, TourAchievementsPanel } from '@/components/gamification';
import { SmartInsightsPanel } from '@/components/ai';
import { RecentScreeningsCard } from '@/components/clinical/RecentScreeningsCard';
import { RiskIndicatorCard } from '@/components/clinical/RiskIndicatorCard';
import { FamilyProgressSection } from '@/components/dashboard/FamilyProgressSection';
import { BehavioralProfileWidget } from '@/components/dashboard/BehavioralProfileWidget';
import { ReportGeneratorWidget } from '@/components/dashboard/ReportGeneratorWidget';
import { AppointmentReminders } from '@/components/clinic/AppointmentReminders';
import type { ChildProfile, SessionData, CognitiveScores } from '@/hooks/useParentDashboard';

interface ParentDashboardContentProps {
  children: ChildProfile[];
  selectedChild: string | null;
  setSelectedChild: (id: string) => void;
  selectedChildData: ChildProfile | undefined;
  sessions: SessionData[];
  cognitiveScores: CognitiveScores | null;
  totalSessions: number;
  avgScore: number;
  missions: any[];
  missionsLoading: boolean;
  badgeProgress: any;
  avatarEvolution: any;
  getBadgeIcon: (level: string) => string;
  getBadgeColor: (level: string) => string;
  riskIndicator: any;
  analyzing: boolean;
  detectCrisisRisk: (days: number) => Promise<void>;
  reloadPredictiveAnalysis: () => Promise<void>;
  generateReport: () => Promise<void>;
  onShowAvatarModal: () => void;
  onShowAlertModal: () => void;
  onShowAddChild: () => void;
}

export function ParentDashboardContent({
  children: childrenList, selectedChild, setSelectedChild, selectedChildData,
  sessions, cognitiveScores, totalSessions, avgScore,
  missions, missionsLoading, badgeProgress, avatarEvolution, getBadgeIcon, getBadgeColor,
  riskIndicator, analyzing, detectCrisisRisk, reloadPredictiveAnalysis,
  generateReport, onShowAvatarModal, onShowAlertModal, onShowAddChild,
}: ParentDashboardContentProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Child Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {childrenList.map((child) => (
            <Button key={child.id} variant={selectedChild === child.id ? 'default' : 'outline'} onClick={() => setSelectedChild(child.id)} className="flex items-center gap-2 shrink-0" size="sm">
              <ChildAvatarDisplay avatar={child.avatar_url} name={child.name} size="sm" />
              <span className="truncate max-w-[100px]">{child.name}</span>
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={onShowAddChild} size="sm" className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Child Profile Card */}
      {selectedChildData && (
        <Card className="p-4 sm:p-6 mb-8" data-tour="avatar-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative cursor-pointer shrink-0" onClick={onShowAvatarModal}>
                <ChildAvatarDisplay avatar={selectedChildData.avatar_url} name={selectedChildData.name} size="xl" level={5} showEffects />
                <div className="absolute -bottom-2 -right-2 bg-warning text-warning-foreground rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-background">5</div>
                {!selectedChildData.avatar_url && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Clique</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedChildData.name}</h2>
                <p className="text-muted-foreground">{selectedChildData.age} anos{selectedChildData.profile && ` • ${selectedChildData.profile}`}</p>
                <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Nível 5</span>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">🏆 12 Conquistas</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate('/avatar-evolution')}>✨ Avatar</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/risk-analysis')} className="flex items-center gap-1"><Shield className="w-3 h-3" />Risco</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/platform-report')}><FileText className="w-3 h-3 mr-1" />Relatório</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/platform-manual')}><BookOpen className="w-3 h-3 mr-1" />Manual</Button>
              <Button size="sm" onClick={generateReport}><Download className="w-3 h-3 mr-1" />PDF</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sistema-planeta-azul')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-primary" /></div>
              <div><h3 className="font-semibold">Planeta Azul</h3><p className="text-sm text-muted-foreground">Universo de jogos terapêuticos</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/games/cooperative-puzzle')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center"><Heart className="w-6 h-6 text-destructive" /></div>
              <div><h3 className="font-semibold">Quebra-Cabeça Cooperativo</h3><p className="text-sm text-muted-foreground">Jogo cooperativo para pais e filhos</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center"><Heart className="w-6 h-6 text-warning" /></div>
              <div><h3 className="font-semibold">Chat Terapêutico</h3><p className="text-sm text-muted-foreground">Acompanhamento emocional</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicator */}
      {riskIndicator && (
        <div className="mb-8" data-tour="risk-indicator">
          <RiskIndicatorCard riskIndicator={riskIndicator} onViewDetails={onShowAlertModal}
            onRefresh={async () => { await detectCrisisRisk(14); await reloadPredictiveAnalysis(); }} loading={analyzing} />
        </div>
      )}

      <div className="mb-8"><FamilyProgressSection /></div>

      {/* Behavioral Profile & Reports */}
      {selectedChild && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <BehavioralProfileWidget childId={selectedChild} compact />
          <ReportGeneratorWidget childId={selectedChild} childName={selectedChildData?.name || ''} />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Planet */}
          <Card className="border-l-4 border-l-primary" data-tour="current-planet">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Sparkles className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold">Planeta Atual</h3></div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl">🌍</div>
                <div className="flex-1"><h4 className="font-semibold text-lg">TEA</h4><p className="text-sm text-muted-foreground">Foco em Atenção e Cognição Social</p><Progress value={65} className="mt-2" /></div>
                <Button onClick={() => navigate('/sistema-planeta-azul')}>Explorar</Button>
              </div>
            </CardContent>
          </Card>

          <div data-tour="daily-mission"><DailyMissionSection /></div>
          <RecentScreeningsCard />

          {/* Achievement Preview */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Trophy className="w-5 h-5" />Sistema de Conquistas</h3>
                <Button variant="outline" size="sm" asChild><Link to="/achievements">Ver Tudo</Link></Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">Badge Atual</span><span className="text-2xl">{getBadgeIcon(badgeProgress.level)}</span></div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getBadgeColor(badgeProgress.level)}`}>
                    <p className="text-white font-semibold capitalize">{badgeProgress.level}</p>
                    <p className="text-white/80 text-xs">{badgeProgress.current} conquistas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">Avatar</span><Sparkles className="w-4 h-4 text-secondary" /></div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/10 to-accent/10">
                    <p className="text-secondary font-semibold">Estágio {avatarEvolution.stage}/5</p>
                    <p className="text-secondary/70 text-xs">{avatarEvolution.xp} XP</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {selectedChild && <div data-tour="ai-recommendations"><SmartInsightsPanel childId={selectedChild} /></div>}

          {/* Appointment Reminders */}
          <AppointmentReminders />

          {/* Quick Report */}
          <Card data-tour="quick-report">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Brain className="w-5 h-5 text-foreground" /><h3 className="text-lg font-semibold">Relatório Rápido</h3></div>
              <div className="space-y-3">
                <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" /><p className="text-sm text-muted-foreground"><strong className="text-foreground">Atenção:</strong> Melhora de 15% nas últimas 3 sessões.</p></div>
                <div className="flex items-start gap-3"><TrendingUp className="w-5 h-5 text-info mt-0.5 flex-shrink-0" /><p className="text-sm text-muted-foreground"><strong className="text-foreground">Memória de Trabalho:</strong> Progresso constante.</p></div>
                <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" /><p className="text-sm text-muted-foreground"><strong className="text-foreground">Flexibilidade Cognitiva:</strong> Área que precisa mais prática.</p></div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/clinical-dashboard')}>Ver Relatório Completo</Button>
            </CardContent>
          </Card>

          {/* Weekly History */}
          <Card data-tour="stats">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Calendar className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold">Histórico Semanal</h3></div>
              <div className="space-y-3">
                {sessions.length > 0 ? sessions.slice(0, 5).map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3"><Brain className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium text-sm">{session.game_type}</p><p className="text-xs text-muted-foreground">{new Date(session.created_at).toLocaleDateString('pt-BR')}</p></div></div>
                    <div className="flex items-center gap-2"><Award className="w-4 h-4 text-warning" /><span className="font-semibold text-sm">{session.score}%</span></div>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-4">Nenhuma sessão registrada</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Sparkles className="w-5 h-5 text-warning" /><h3 className="text-lg font-semibold">Recomendações IA</h3></div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20"><p className="text-sm font-medium mb-1">Foco em Atenção Sustentada</p><p className="text-xs text-muted-foreground">Jogos de atenção terão melhor resultado nas manhãs</p></div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20"><p className="text-sm font-medium mb-1">Sessões Mais Curtas</p><p className="text-xs text-muted-foreground">Melhor desempenho em sessões de 10-15 minutos</p></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Brain className="w-5 h-5 text-foreground" /><h3 className="text-lg font-semibold">Microlearning</h3></div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
                <p className="font-medium mb-2 text-sm">Como Apoiar a Atenção em Casa</p>
                <p className="text-xs text-muted-foreground mb-3">Técnicas práticas para melhorar a atenção</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" /><span>5 minutos</span></div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/training')}>Ver Mais Conteúdos</Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Heart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold">Atividade Parent-Child</h3></div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-warning/10 border border-border">
                <p className="font-medium mb-2 text-sm">🎮 Jogo Cooperativo: Quebra-Cabeça Mágico</p>
                <p className="text-xs text-muted-foreground mb-3">Trabalhem juntos para completar desafios</p>
                <Button size="sm" className="w-full" onClick={() => navigate('/games')}>Jogar Juntos</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-4 text-center"><Award className="w-6 h-6 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{totalSessions}</p><p className="text-xs text-muted-foreground">Sessões</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Target className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{avgScore}%</p><p className="text-xs text-muted-foreground">Média</p></CardContent></Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4"><Award className="w-5 h-5 text-warning" /><h3 className="text-lg font-semibold">Badges Familiares</h3></div>
              <div className="grid grid-cols-3 gap-2">
                {['🏆', '⭐', '🎯', '💎', '🔥', '🌟'].map((badge, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer border border-border">{badge}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cognitive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="cognitive" className="text-xs sm:text-sm">Perfil Cognitivo</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm">Conquistas</TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm">Progresso</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="cognitive">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-6">Perfil Cognitivo</h3>
            {cognitiveScores ? (
              <div className="space-y-6">
                {Object.entries(cognitiveScores).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    attention: 'Atenção e Foco', memory: 'Memória', language: 'Linguagem',
                    logic: 'Raciocínio Lógico', emotion: 'Regulação Emocional', coordination: 'Coordenação Motora'
                  };
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-2"><span className="font-medium">{labels[key]}</span><span className="text-muted-foreground">{value}/100</span></div>
                      <Progress value={value} className="h-3" />
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-center py-8">Complete mais sessões para visualizar</p>}
          </Card>
        </TabsContent>

        <TabsContent value="achievements"><TourAchievementsPanel /></TabsContent>

        <TabsContent value="progress">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-6">Evolução do Progresso</h3>
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4"><CheckCircle2 className="w-6 h-6 text-primary" /><div><p className="font-medium">{session.game_type}</p><p className="text-sm text-muted-foreground">{new Date(session.created_at).toLocaleDateString('pt-BR')}</p></div></div>
                  <div className="text-right"><p className="font-bold text-lg">{session.score || 0}</p><p className="text-sm text-muted-foreground">pontos</p></div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-6">Histórico de Sessões</h3>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium">{session.game_type}</p><p className="text-sm text-muted-foreground">{new Date(session.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                  <div className="text-right"><p className="font-semibold">{session.score || 0} pts</p><p className="text-sm text-muted-foreground">{Math.round(session.duration / 60)} min</p></div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
