import { ModernPageLayout } from '@/components/ModernPageLayout';
import { ClinicAgenda } from '@/components/clinic/ClinicAgenda';
import { ParentAgendaView } from '@/components/clinic/ParentAgendaView';
import { TherapistAgendaView } from '@/components/clinic/TherapistAgendaView';
import { useUserRole } from '@/hooks/useUserRole';
import { Loading } from '@/components/Loading';

export default function AgendaClinica() {
  const { role, isAdmin, isTherapist, loading } = useUserRole();

  if (loading) {
    return (
      <ModernPageLayout>
        <Loading />
      </ModernPageLayout>
    );
  }

  const isParentView = role === 'parent' && !isAdmin && !isTherapist;
  const isTherapistView = isTherapist && !isAdmin;

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        {isParentView ? (
          <ParentAgendaView />
        ) : isTherapistView ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Minha Agenda</h1>
              <p className="text-muted-foreground">
                Seus agendamentos e horário de trabalho
              </p>
            </div>
            <TherapistAgendaView />
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Agenda Clínica</h1>
              <p className="text-muted-foreground">
                Gerencie agendamentos, confirmações e lista de espera
              </p>
            </div>
            <ClinicAgenda />
          </>
        )}
      </div>
    </ModernPageLayout>
  );
}
