import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TeleconsultSession } from '@/components/teleconsult/TeleconsultSession';
import { VideoCall } from '@/components/teleconsult/VideoCall';
import { Loading } from '@/components/Loading';
import { toast } from 'sonner';

export default function TeleconsultaSessionPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isProfessional, setIsProfessional] = useState(false);

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

      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdminUser = !!userRole;

      setSessionData(session);
      // Allow admin or session professional to have professional access
      setIsProfessional(session.professional_id === user.id || isAdminUser);

      // Update session status to in_progress
      if (session.status === 'scheduled') {
        await supabase
          .from('teleorientation_sessions')
          .update({ 
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Erro ao carregar sessão');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/teleconsultas');
  };

  const handleComplete = () => {
    toast.success('Teleconsulta finalizada');
    navigate('/teleconsultas');
  };

  if (loading) {
    return <Loading />;
  }

  if (!sessionData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Video Area - Left Side */}
      <div className="w-1/2 flex flex-col">
        <VideoCall
          sessionId={sessionId!}
          patientName={sessionData.children?.name || 'Paciente'}
          isInitiator={isProfessional}
          onEnd={handleClose}
        />
      </div>

      {/* Clinical Panel - Right Side (only for professionals) */}
      {isProfessional ? (
        <div className="w-1/2">
          <TeleconsultSession
            sessionId={sessionId!}
            patientId={sessionData.child_id}
            patientName={sessionData.children?.name || 'Paciente'}
            onClose={handleClose}
            onComplete={handleComplete}
          />
        </div>
      ) : (
        <div className="w-1/2 flex items-center justify-center bg-muted/30">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Teleconsulta em andamento</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto o profissional conduz a sessão.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
