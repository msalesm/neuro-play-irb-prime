import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { TeleconsultList } from '@/components/teleconsult/TeleconsultList';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

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
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate('/teleconsulta-demo')}>
            <Video className="w-4 h-4 mr-2" />
            Testar Teleconsulta
          </Button>
        </div>
        <TeleconsultList 
          onStartSession={handleStartSession}
          onViewRecord={handleViewRecord}
        />
      </div>
    </ModernPageLayout>
  );
}
