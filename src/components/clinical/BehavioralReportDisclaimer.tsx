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
        ⚠️ Padrões comportamentais observados — não constitui avaliação clínica
      </div>
    );
  }

  return (
    <Alert className={`bg-warning/10 border-warning/30 text-white ${className}`}>
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-white font-semibold">
        ⚠️ Importante: Ferramenta de Análise Comportamental Educacional
      </AlertTitle>
      <AlertDescription className="text-white/90 text-sm">
        <p className="mb-2">
          Este relatório apresenta <strong>PADRÕES COMPORTAMENTAIS</strong> observados durante atividades
          educacionais estruturadas, não constituindo avaliação clínica de qualquer condição.
        </p>
        <p>
          A interpretação dos dados deve ser feita <strong>por profissionais qualificados</strong> 
          (psicólogos, neurologistas, psicopedagogos) e complementada com avaliação completa quando indicado.
        </p>
      </AlertDescription>
    </Alert>
  );
};
