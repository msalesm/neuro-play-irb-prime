import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PatientAvatar } from '@/components/clinical/PatientAvatar';
import { ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PatientData } from '@/hooks/useTherapistPatientData';

interface Props {
  patient: PatientData;
  onGenerateReport: () => void;
  onSetTab: (tab: string) => void;
}

export function TherapistPatientHeader({ patient, onGenerateReport, onSetTab }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={() => navigate('/therapist/patients')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Pacientes
      </Button>

      <Card data-tour="patient-info">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <PatientAvatar photoUrl={patient.avatar_url} name={patient.name} size="xl" />
              <div>
                <h1 className="text-3xl font-bold">{patient.name}</h1>
                <p className="text-muted-foreground">{patient.age} anos</p>
                <div className="flex gap-2 mt-2">
                  {patient.conditions.map((condition, idx) => (
                    <Badge key={idx} variant="secondary">{condition}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onGenerateReport}>
                <Download className="w-4 h-4 mr-2" />
                Relatório IA
              </Button>
              <Button onClick={() => onSetTab('chat')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat com Pais
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
