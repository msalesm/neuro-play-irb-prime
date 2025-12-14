import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { TeleconsultList } from '@/components/teleconsult/TeleconsultList';

export default function Teleconsultas() {
  const navigate = useNavigate();

  const handleStartSession = (session: any) => {
    navigate(`/teleconsulta/${session.id}`);
  };

  const handleViewRecord = (childId: string) => {
    navigate(`/prontuario/${childId}`);
  };

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <TeleconsultList 
          onStartSession={handleStartSession}
          onViewRecord={handleViewRecord}
        />
      </div>
    </ModernPageLayout>
  );
}
