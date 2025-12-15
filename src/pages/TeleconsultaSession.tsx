import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TeleconsultSession } from '@/components/teleconsult/TeleconsultSession';
import { VideoCall } from '@/components/teleconsult/VideoCall';
import { PatientHistoryPanel } from '@/components/teleconsult/PatientHistoryPanel';
import { WaitingRoom } from '@/components/teleconsult/WaitingRoom';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { History, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeleconsultaSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isProfessional, setIsProfessional] = useState(false);
  const [activePanel, setActivePanel] = useState<'history' | 'session'>('history');
  const [showWaitingRoom, setShowWaitingRoom] = useState(true);
  const [professionalName, setProfessionalName] = useState('Profissional');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate('/teleconsultas');
      return;
    }
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: session, error } = await supabase
        .from('teleorientation_sessions')
        .select(`
          *,
          children:child_id (id, name)
        `)
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        toast.error('Sessão não encontrada');
        navigate('/teleconsultas');
        return;
      }

      // Carregar nome do profissional
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.professional_id)
        .single();
      
      if (profile) {
        setProfessionalName(profile.full_name || 'Profissional');
      }

      // Verificar se usuário é admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdminUser = !!userRole;

      setSessionData(session);
      // Permitir admin ou profissional da sessão ter acesso profissional
      setIsProfessional(session.professional_id === user.id || isAdminUser);

    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Erro ao carregar sessão');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    // Atualizar status da sessão
    if (sessionData?.status === 'scheduled') {
      await supabase
        .from('teleorientation_sessions')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }
    setShowWaitingRoom(false);
  };

  const handleClose = () => {
    navigate(isProfessional ? '/teleconsultas' : '/minhas-teleconsultas');
  };

  const handleComplete = () => {
    toast.success('Teleconsulta finalizada');
    navigate(isProfessional ? '/teleconsultas' : '/minhas-teleconsultas');
  };

  if (loading) {
    return <Loading />;
  }

  if (!sessionData) {
    return null;
  }

  // Mostrar sala de espera
  if (showWaitingRoom) {
    return (
      <WaitingRoom
        patientName={sessionData.children?.name || 'Paciente'}
        professionalName={professionalName}
        scheduledAt={new Date(sessionData.scheduled_at)}
        onReady={handleStartSession}
        onCancel={handleClose}
        isWaitingForOther={false}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col md:flex-row">
      {/* Video Area */}
      <div className={`flex-1 flex flex-col min-h-[40vh] md:min-h-0 ${isPanelCollapsed ? '' : 'md:w-1/2'}`}>
        <VideoCall
          sessionId={sessionId!}
          patientName={sessionData.children?.name || 'Paciente'}
          isInitiator={isProfessional}
          onEnd={handleClose}
        />
      </div>

      {/* Toggle Panel Button (Desktop) */}
      {isProfessional && (
        <button
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-l-lg p-2 shadow-lg"
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          style={{ right: isPanelCollapsed ? 0 : 'calc(50% - 1px)' }}
        >
          {isPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}

      {/* Clinical Panel - Right Side (only for professionals) */}
      {isProfessional && !isPanelCollapsed && (
        <div className="flex-1 md:w-1/2 flex flex-col border-t md:border-t-0 md:border-l border-border">
          {/* Panel Toggle */}
          <div className="p-2 border-b border-border flex gap-2 bg-muted/30">
            <Button
              variant={activePanel === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActivePanel('history')}
              className="flex-1"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </Button>
            <Button
              variant={activePanel === 'session' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActivePanel('session')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Prontuário
            </Button>
          </div>

          {/* Active Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'history' ? (
              <PatientHistoryPanel
                patientId={sessionData.child_id}
                patientName={sessionData.children?.name || 'Paciente'}
              />
            ) : (
              <TeleconsultSession
                sessionId={sessionId!}
                patientId={sessionData.child_id}
                patientName={sessionData.children?.name || 'Paciente'}
                onClose={handleClose}
                onComplete={handleComplete}
              />
            )}
          </div>
        </div>
      )}

      {/* Patient View - Simpler interface */}
      {!isProfessional && (
        <div className="md:w-1/3 flex items-center justify-center bg-muted/30 p-4 md:p-8">
          <div className="text-center max-w-md">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Teleconsulta em andamento</h2>
            <p className="text-muted-foreground mb-6">
              Você está conectado com {professionalName}. 
              Aguarde enquanto o profissional conduz a sessão.
            </p>
            <Button variant="outline" onClick={handleClose}>
              Sair da consulta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
