import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { AvatarSelectionModal, BadgeUnlockModal } from '@/components/gamification';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';
import { PreventiveAlertModal } from '@/components/clinical/PreventiveAlertModal';
import { AddChildModal } from '@/components/dashboard/AddChildModal';
import { ParentEmptyState } from '@/components/dashboard/ParentEmptyState';
import { ParentDashboardContent } from '@/components/dashboard/ParentDashboardContent';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { HeroBanner } from '@/components/mobile';
import { Heart, TrendingUp } from 'lucide-react';

export default function DashboardPais() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dashboard = useParentDashboard();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{ name: string; description: string; icon: string } | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [preventiveAlert, setPreventiveAlert] = useState<any>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  useEffect(() => {
    if (dashboard.riskIndicator && (dashboard.riskIndicator.level === 'high' || dashboard.riskIndicator.level === 'critical')) {
      setPreventiveAlert({
        level: dashboard.riskIndicator.level,
        title: dashboard.riskIndicator.level === 'critical' ? 'Alerta de Risco Crítico' : 'Alerta de Risco Alto',
        message: dashboard.riskIndicator.level === 'critical'
          ? 'Sinais preocupantes que requerem atenção imediata.'
          : 'Padrões comportamentais que merecem sua atenção.',
        indicators: dashboard.riskIndicator.indicators,
        urgentActions: dashboard.riskIndicator.recommendations,
        timeline: dashboard.riskIndicator.timeline,
      });
      setShowAlertModal(true);
    }
  }, [dashboard.riskIndicator]);

  return (
    <div className="space-y-4">
      <PlatformOnboarding pageName="dashboard-pais" />

      {dashboard.selectedChild && (
        <AvatarSelectionModal
          open={showAvatarModal}
          onComplete={() => { setShowAvatarModal(false); dashboard.loadChildren(); }}
          childId={dashboard.selectedChild}
        />
      )}
      <BadgeUnlockModal
        badgeKey={showBadgeModal ? (unlockedBadge as any)?.key || 'first_game' : undefined}
        onClose={() => setShowBadgeModal(false)}
      />
      {preventiveAlert && (
        <PreventiveAlertModal open={showAlertModal} onClose={() => setShowAlertModal(false)} alert={preventiveAlert} />
      )}
      <AddChildModal open={showAddChildModal} onClose={() => setShowAddChildModal(false)} onSuccess={() => dashboard.loadChildren()} />

      {/* Page title */}
      <div>
        <h1 className="text-2xl-mobile font-bold text-foreground">Dashboard da Família</h1>
        <p className="text-sm-mobile text-muted-foreground">Acompanhe o progresso do seu filho</p>
      </div>

      {/* Hero banner on mobile */}
      {isMobile && dashboard.children.length > 0 && (
        <HeroBanner
          title="Progresso da Semana"
          subtitle={`${dashboard.totalSessions} sessões • Média ${dashboard.avgScore}%`}
          ctaLabel="Ver detalhes"
          ctaRoute="/learning-dashboard"
          icon={TrendingUp}
          gradient="primary"
        />
      )}

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
  );
}
