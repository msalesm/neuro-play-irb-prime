import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '../OnboardingWizard';
import { Database, FlaskConical, Users } from 'lucide-react';

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
};

export function ConsentsStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Consentimentos LGPD</h3>
        <p className="text-sm text-muted-foreground">
          Você tem controle total sobre como seus dados são usados. Todas as opções abaixo são opcionais.
        </p>
      </div>

      <div className="space-y-6">
        {/* Anonymous Data */}
        <div className="border border-secondary/30 rounded-lg p-4 hover:border-secondary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Database className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Dados Pseudonimizados para Melhoria</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permitir uso de dados anônimos (sem identificação pessoal) para melhorar algoritmos 
                  de personalização e eficácia terapêutica da plataforma.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="anonymousData"
                  checked={data.consentAnonymousData}
                  onCheckedChange={(checked) => updateData({ consentAnonymousData: !!checked })}
                  className="border-secondary data-[state=checked]:bg-secondary"
                />
                <Label htmlFor="anonymousData" className="text-sm font-medium cursor-pointer">
                  Sim, autorizo uso de dados pseudonimizados
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Research */}
        <div className="border border-secondary/30 rounded-lg p-4 hover:border-secondary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Pesquisa Científica</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permitir uso de dados anonimizados para estudos científicos sobre neurodiversidade, 
                  aprendizagem e desenvolvimento infantil conduzidos por parceiros acadêmicos.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="research"
                  checked={data.consentResearch}
                  onCheckedChange={(checked) => updateData({ consentResearch: !!checked })}
                  className="border-secondary data-[state=checked]:bg-secondary"
                />
                <Label htmlFor="research" className="text-sm font-medium cursor-pointer">
                  Sim, autorizo uso para pesquisa científica
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Sharing */}
        <div className="border border-secondary/30 rounded-lg p-4 hover:border-secondary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Compartilhamento Clínico Facilitado</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permitir compartilhamento automático de relatórios e progresso com profissionais de saúde autorizados 
                  (você ainda controlará quais profissionais têm acesso).
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="clinicalSharing"
                  checked={data.consentClinicalSharing}
                  onCheckedChange={(checked) => updateData({ consentClinicalSharing: !!checked })}
                  className="border-secondary data-[state=checked]:bg-secondary"
                />
                <Label htmlFor="clinicalSharing" className="text-sm font-medium cursor-pointer">
                  Sim, autorizo compartilhamento com profissionais autorizados
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary/20 p-4 rounded-lg border border-secondary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">Você pode mudar essas escolhas a qualquer momento</strong> nas configurações 
          de privacidade. Dados já coletados sob consentimento anterior serão tratados conforme a nova escolha.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <p className="text-sm text-green-900">
          Conformidade total com Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
        </p>
      </div>
    </div>
  );
}
