import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/pages/Onboarding';
import { Shield, Users, FlaskConical } from 'lucide-react';

interface OnboardingStep3Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

export function OnboardingStep3({ data, onNext, onBack }: OnboardingStep3Props) {
  const [consents, setConsents] = useState({
    dataProcessing: data.consents?.dataProcessing || false,
    professionalSharing: data.consents?.professionalSharing || false,
    research: data.consents?.research || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consents.dataProcessing) {
      onNext({ consents });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Consentimentos LGPD</h3>
          <p className="text-sm text-muted-foreground">
            Escolha quais usos de dados você autoriza. Você pode alterar essas preferências 
            a qualquer momento nas configurações.
          </p>
        </div>

        <div className="space-y-4">
          {/* Consentimento Obrigatório */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Checkbox
                  id="data-processing"
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) =>
                    setConsents({ ...consents, dataProcessing: checked as boolean })
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <label
                    htmlFor="data-processing"
                    className="font-medium cursor-pointer"
                  >
                    Processamento de Dados para Uso da Plataforma
                  </label>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    OBRIGATÓRIO
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Autorizo o processamento dos meus dados e da criança para funcionamento 
                  da plataforma: perfil personalizado, adaptação de dificuldade, geração 
                  de relatórios e análise de progresso.
                </p>
              </div>
            </div>
          </div>

          {/* Consentimento Opcional 1 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Checkbox
                  id="professional-sharing"
                  checked={consents.professionalSharing}
                  onCheckedChange={(checked) =>
                    setConsents({ ...consents, professionalSharing: checked as boolean })
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <label
                    htmlFor="professional-sharing"
                    className="font-medium cursor-pointer"
                  >
                    Compartilhamento com Profissionais de Saúde
                  </label>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    OPCIONAL
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Autorizo o compartilhamento de relatórios e dados de desempenho com 
                  profissionais que eu vincular à conta (terapeutas, psicólogos, médicos, 
                  pedagogos). Você escolhe quais profissionais têm acesso.
                </p>
              </div>
            </div>
          </div>

          {/* Consentimento Opcional 2 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Checkbox
                  id="research"
                  checked={consents.research}
                  onCheckedChange={(checked) =>
                    setConsents({ ...consents, research: checked as boolean })
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className="h-4 w-4 text-purple-500" />
                  <label
                    htmlFor="research"
                    className="font-medium cursor-pointer"
                  >
                    Uso para Pesquisa Científica
                  </label>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    OPCIONAL
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Autorizo o uso <strong>anônimo</strong> dos dados para pesquisa científica 
                  sobre neurodiversidade e desenvolvimento infantil. Seus dados serão 
                  completamente anonimizados (sem nome, email ou informações identificáveis). 
                  Ajuda a melhorar conhecimento científico sobre TEA, TDAH e Dislexia.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm">
            <strong>Importante:</strong> Você pode revogar qualquer consentimento a qualquer 
            momento através das configurações da sua conta. Seus direitos LGPD estão sempre 
            garantidos: acesso, correção, exclusão e portabilidade de dados.
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={!consents.dataProcessing}
          size="lg"
        >
          Próximo
        </Button>
      </div>
    </form>
  );
}
