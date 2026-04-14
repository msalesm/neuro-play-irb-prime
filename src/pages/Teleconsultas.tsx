import { useNavigate } from 'react-router-dom';
import { TeleconsultList } from '@/components/teleconsult/TeleconsultList';
import { Stethoscope } from 'lucide-react';

export default function Teleconsultas() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Teleconsultas</h1>
          <p className="text-xs text-muted-foreground">Consultas online com registro clínico</p>
        </div>
      </div>

      <TeleconsultList 
        onStartSession={(session) => navigate(`/teleconsulta/${session.id}`)}
        onViewRecord={(childId) => navigate(`/prontuario/${childId}`)}
      />
    </div>
  );
}
