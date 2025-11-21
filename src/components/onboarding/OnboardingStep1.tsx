import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '@/pages/Onboarding';

interface OnboardingStep1Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

export function OnboardingStep1({ data, onNext }: OnboardingStep1Props) {
  const [professionalRegistration, setProfessionalRegistration] = useState(
    data.professionalRegistration || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ professionalRegistration });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Dados Profissionais</h3>
          <p className="text-sm text-muted-foreground">
            Se você é um profissional de saúde ou educação (terapeuta, psicólogo, pedagogo), 
            informe seu registro profissional.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration">
            Registro Profissional (CRP, CRM, RG, etc.)
          </Label>
          <Input
            id="registration"
            type="text"
            placeholder="Ex: CRP 06/123456 ou deixe em branco se não se aplica"
            value={professionalRegistration}
            onChange={(e) => setProfessionalRegistration(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Pais e responsáveis podem deixar este campo em branco
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm">
            <strong>Para profissionais:</strong> Seu registro será usado para identificação 
            em relatórios compartilhados e valida sua capacidade de revisar análises clínicas.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg">
          Próximo
        </Button>
      </div>
    </form>
  );
}
