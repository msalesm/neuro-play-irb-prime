import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface BehavioralReportDisclaimerProps {
  variant?: 'banner' | 'inline';
  className?: string;
}

export const BehavioralReportDisclaimer: React.FC<BehavioralReportDisclaimerProps> = ({ 
  variant = 'banner',
  className = ''
}) => {
  if (variant === 'inline') {
    return (
      <div className={`text-xs text-muted-foreground italic ${className}`}>
        ⚠️ Padrões observados - não constitui diagnóstico clínico
      </div>
    );
  }

  return (
    <Alert className={`bg-yellow-500/10 border-yellow-500/30 text-white ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-400" />
      <AlertTitle className="text-white font-semibold">
        ⚠️ Importante: Este não é um diagnóstico clínico
      </AlertTitle>
      <AlertDescription className="text-white/90 text-sm">
        <p className="mb-2">
          Este relatório apresenta <strong>PADRÕES COMPORTAMENTAIS</strong> observados durante as atividades,
          não constituindo diagnóstico clínico de qualquer condição.
        </p>
        <p>
          A interpretação dos dados deve ser feita <strong>exclusivamente por profissionais qualificados</strong> 
          (psicólogos, neurologistas, psicopedagogos) e complementada com avaliação clínica completa.
        </p>
      </AlertDescription>
    </Alert>
  );
};
