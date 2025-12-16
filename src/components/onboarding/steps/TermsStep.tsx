import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '../OnboardingWizard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield } from 'lucide-react';

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
};

export function TermsStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-irb-petrol mb-2">Termos e Políticas</h3>
        <p className="text-sm text-muted-foreground">
          Leia e aceite nossos termos para continuar.
        </p>
      </div>

      <div className="space-y-6">
        {/* Terms of Use */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-irb-blue">
            <FileText className="h-5 w-5" />
            <h4 className="font-semibold">Termos de Uso</h4>
          </div>
          <ScrollArea className="h-48 rounded-lg border border-irb-blue/30 p-4 bg-muted/20">
            <div className="text-sm space-y-3 pr-4">
              <p className="font-semibold text-irb-petrol">1. Natureza do Serviço</p>
              <p>
                A NeuroPlay é uma plataforma de apoio terapêutico e educacional baseada em evidências científicas. 
                Não substitui diagnóstico, tratamento ou acompanhamento profissional especializado.
              </p>
              
              <p className="font-semibold text-irb-petrol">2. Uso Responsável</p>
              <p>
                Os jogos, testes e conteúdos são baseados em evidências neurocientíficas e devem ser utilizados como ferramentas 
                complementares ao acompanhamento clínico realizado por profissionais habilitados.
              </p>
              
              <p className="font-semibold text-irb-petrol">3. Responsabilidade dos Usuários</p>
              <p>
                Pais e responsáveis devem monitorar o uso da plataforma pela criança, respeitando os tempos recomendados de uso 
                e o perfil sensorial individual.
              </p>
              
              <p className="font-semibold text-irb-petrol">4. Propriedade Intelectual</p>
              <p>
                Todo o conteúdo da plataforma é propriedade do Neuro IRB Prime e seus parceiros, protegido por direitos autorais.
              </p>
            </div>
          </ScrollArea>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={data.termsAccepted}
              onCheckedChange={(checked) => updateData({ termsAccepted: !!checked })}
              className="mt-1 border-irb-blue data-[state=checked]:bg-irb-blue"
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              Li e aceito os <span className="font-semibold text-irb-blue">Termos de Uso</span> da plataforma *
            </Label>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-irb-blue">
            <Shield className="h-5 w-5" />
            <h4 className="font-semibold">Política de Privacidade</h4>
          </div>
          <ScrollArea className="h-48 rounded-lg border border-irb-blue/30 p-4 bg-muted/20">
            <div className="text-sm space-y-3 pr-4">
              <p className="font-semibold text-irb-petrol">1. Dados Coletados</p>
              <p>
                Coletamos apenas dados essenciais: informações de perfil, progresso terapêutico, métricas de jogos 
                e preferências sensoriais. Todos os dados são pseudonimizados.
              </p>
              
              <p className="font-semibold text-irb-petrol">2. Uso dos Dados</p>
              <p>
                Seus dados são utilizados para: personalização terapêutica, geração de relatórios clínicos, 
                recomendações de atividades e melhoria da plataforma.
              </p>
              
              <p className="font-semibold text-irb-petrol">3. Compartilhamento</p>
              <p>
                Dados clínicos só são compartilhados com terapeutas mediante sua autorização explícita. 
                Dados anonimizados podem ser usados para pesquisa científica (opcional).
              </p>
              
              <p className="font-semibold text-irb-petrol">4. Seus Direitos (LGPD)</p>
              <p>
                Você tem direito a acessar, corrigir, exportar ou excluir seus dados a qualquer momento. 
                Entre em contato com privacidade@irbprimecare.com.br.
              </p>
              
              <p className="font-semibold text-irb-petrol">5. Segurança</p>
              <p>
                Utilizamos criptografia, controles de acesso rigorosos e auditoria de segurança para proteger seus dados.
              </p>
            </div>
          </ScrollArea>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={data.privacyAccepted}
              onCheckedChange={(checked) => updateData({ privacyAccepted: !!checked })}
              className="mt-1 border-irb-blue data-[state=checked]:bg-irb-blue"
            />
            <Label htmlFor="privacy" className="text-sm cursor-pointer">
              Li e aceito a <span className="font-semibold text-irb-blue">Política de Privacidade</span> *
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>Importante:</strong> Ao aceitar estes termos, você confirma que compreende a natureza 
          terapêutica complementar da plataforma e que manterá acompanhamento profissional especializado.
        </p>
      </div>
    </div>
  );
}
