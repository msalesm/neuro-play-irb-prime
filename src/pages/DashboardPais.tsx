import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { AvatarSelectionModal, BadgeUnlockModal } from '@/components/gamification';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';
import { PreventiveAlertModal } from '@/components/PreventiveAlertModal';
import { AddChildModal } from '@/components/AddChildModal';
import { ParentEmptyState } from '@/components/dashboard/ParentEmptyState';
import { ParentDashboardContent } from '@/components/dashboard/ParentDashboardContent';
import { useParentDashboard } from '@/hooks/useParentDashboard';

export default function DashboardPais() {
  const navigate = useNavigate();
  const dashboard = useParentDashboard();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{ name: string; description: string; icon: string } | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [preventiveAlert, setPreventiveAlert] = useState<any>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // Check for high-risk alerts
  useEffect(() => {
    if (dashboard.riskIndicator && (dashboard.riskIndicator.level === 'high' || dashboard.riskIndicator.level === 'critical')) {
      setPreventiveAlert({
        level: dashboard.riskIndicator.level,
        title: dashboard.riskIndicator.level === 'critical' ? 'Alerta de Risco Crítico Detectado' : 'Alerta de Risco Alto Detectado',
        message: dashboard.riskIndicator.level === 'critical'
          ? 'Nossa análise preditiva identificou sinais preocupantes que requerem atenção imediata.'
          : 'Nossa análise detectou padrões comportamentais que merecem sua atenção.',
        indicators: dashboard.riskIndicator.indicators,
        urgentActions: dashboard.riskIndicator.recommendations,
        timeline: dashboard.riskIndicator.timeline,
      });
      setShowAlertModal(true);
    }
  }, [dashboard.riskIndicator]);

  return (
    <ModernPageLayout>
      <PlatformOnboarding pageName="dashboard-pais" />

      {dashboard.selectedChild && (
        <AvatarSelectionModal
          open={showAvatarModal}
          onComplete={() => { setShowAvatarModal(false); dashboard.loadChildren(); }}
          childId={dashboard.selectedChild}
        />
      )}

      <BadgeUnlockModal
        open={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        badgeName={unlockedBadge?.name || ''}
        badgeDescription={unlockedBadge?.description || ''}
        badgeIcon={unlockedBadge?.icon || '🏆'}
      />

      {preventiveAlert && (
        <PreventiveAlertModal open={showAlertModal} onClose={() => setShowAlertModal(false)} alert={preventiveAlert} />
      )}

      <AddChildModal open={showAddChildModal} onClose={() => setShowAddChildModal(false)} onSuccess={() => dashboard.loadChildren()} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dashboard da Família</h1>
          <p className="text-xl text-muted-foreground">Acompanhe o desenvolvimento e progresso do seu filho</p>
        </div>

        {dashboard.loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : dashboard.children.length === 0 ? (
          <ParentEmptyState sessions={dashboard.sessions} onAddChild={() => setShowAddChildModal(true)} />
        ) : (
          <ParentDashboardContent
            children={dashboard.children}
            selectedChild={dashboard.selectedChild}
            setSelectedChild={dashboard.setSelectedChild}
            selectedChildData={dashboard.selectedChildData}
            sessions={dashboard.sessions}
            cognitiveScores={dashboard.cognitiveScores}
            totalSessions={dashboard.totalSessions}
            avgScore={dashboard.avgScore}
            missions={dashboard.missions}
            missionsLoading={dashboard.missionsLoading}
            badgeProgress={dashboard.badgeProgress}
            avatarEvolution={dashboard.avatarEvolution}
            getBadgeIcon={dashboard.getBadgeIcon}
            getBadgeColor={dashboard.getBadgeColor}
            riskIndicator={dashboard.riskIndicator}
            analyzing={dashboard.analyzing}
            detectCrisisRisk={dashboard.detectCrisisRisk}
            reloadPredictiveAnalysis={dashboard.reloadPredictiveAnalysis}
            generateReport={dashboard.generateReport}
            onShowAvatarModal={() => setShowAvatarModal(true)}
            onShowAlertModal={() => setShowAlertModal(true)}
            onShowAddChild={() => setShowAddChildModal(true)}
          />
        )}
      </div>
    </ModernPageLayout>
  );
}
