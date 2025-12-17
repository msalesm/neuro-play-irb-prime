import { ModernPageLayout } from '@/components/ModernPageLayout';
import { ClinicAgenda } from '@/components/clinic/ClinicAgenda';

export default function AgendaClinica() {
  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Agenda Clínica</h1>
          <p className="text-muted-foreground">
            Gerencie agendamentos, confirmações e lista de espera
          </p>
        </div>
        
        <ClinicAgenda />
      </div>
    </ModernPageLayout>
  );
}
