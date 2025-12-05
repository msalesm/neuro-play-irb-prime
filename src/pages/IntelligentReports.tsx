import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligentReportGenerator } from '@/components/reports/IntelligentReportGenerator';
import { useTelemetry } from '@/hooks/useTelemetry';

export default function IntelligentReports() {
  const navigate = useNavigate();
  const { trackScreenView } = useTelemetry();

  useEffect(() => {
    trackScreenView('intelligent_reports');
  }, [trackScreenView]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Relatórios Inteligentes
            </h1>
            <p className="text-muted-foreground">
              Análise multidisciplinar com IA
            </p>
          </div>
        </div>

        {/* Report Generator */}
        <IntelligentReportGenerator />
      </div>
    </div>
  );
}
