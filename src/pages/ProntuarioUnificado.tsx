import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { UnifiedPatientRecord } from '@/components/prontuario/UnifiedPatientRecord';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ProntuarioUnificado() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    toast.info('Gerando relatório clínico com IA...');
    try {
      const { error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          userId: childId,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reportType: 'comprehensive'
        }
      });
      if (error) throw error;
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  if (!childId) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>ID do paciente não fornecido</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <UnifiedPatientRecord 
          childId={childId} 
          onGenerateReport={handleGenerateReport}
        />
      </div>
    </ModernPageLayout>
  );
}
