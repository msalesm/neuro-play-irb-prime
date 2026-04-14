import { ClinicAgenda } from '@/components/clinic/ClinicAgenda';
import { ParentAgendaView } from '@/components/clinic/ParentAgendaView';
import { TherapistAgendaView } from '@/components/clinic/TherapistAgendaView';
import { useUserRole } from '@/hooks/useUserRole';
import { Loading } from '@/components/Loading';
import { Calendar } from 'lucide-react';

export default function AgendaClinica() {
  const { role, isAdmin, isTherapist, loading } = useUserRole();

  if (loading) return <Loading />;

  const isParentView = role === 'parent' && !isAdmin && !isTherapist;
  const isTherapistView = isTherapist && !isAdmin;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isParentView ? 'Agenda' : isTherapistView ? 'Minha Agenda' : 'Agenda Clínica'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isParentView ? 'Seus agendamentos' : isTherapistView ? 'Seus atendimentos' : 'Gerencie agendamentos e lista de espera'}
          </p>
        </div>
      </div>

      {isParentView ? (
        <ParentAgendaView />
      ) : isTherapistView ? (
        <TherapistAgendaView />
      ) : (
        <ClinicAgenda />
      )}
    </div>
  );
}
