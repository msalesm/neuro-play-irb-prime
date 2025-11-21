import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnboardingData } from '@/pages/Onboarding';
import { FileText } from 'lucide-react';

interface OnboardingStep2Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

export function OnboardingStep2({ onNext, onBack }: OnboardingStep2Props) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Consider scrolled if user reached 80% of content
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        setHasScrolled(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (acceptedTerms && acceptedPrivacy) {
      onNext({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Termos de Uso e Política de Privacidade
          </h3>
          <p className="text-sm text-muted-foreground">
            Por favor, leia atentamente os termos abaixo. Role até o final para continuar.
          </p>
        </div>

        <ScrollArea
          className="h-[400px] w-full rounded-md border p-4"
          onScrollCapture={handleScroll}
          ref={scrollRef}
        >
          <div className="space-y-6 text-sm">
            <section>
              <h4 className="font-semibold text-base mb-2">1. Termos de Uso - NeuroPlay</h4>
              
              <h5 className="font-medium mt-3">1.1 Natureza do Serviço</h5>
              <p className="text-muted-foreground">
                A NeuroPlay é uma plataforma de apoio terapêutico e educacional voltada para 
                crianças neurodivergentes. Não somos um serviço médico, não realizamos diagnósticos 
                e não substituímos profissionais de saúde.
              </p>

              <h5 className="font-medium mt-3">1.2 Uso Adequado</h5>
              <p className="text-muted-foreground">
                Os jogos, testes e relatórios devem ser utilizados como ferramentas complementares. 
                Resultados devem ser interpretados por profissionais qualificados. A plataforma não 
                deve ser a única fonte de informação para decisões sobre saúde ou educação da criança.
              </p>

              <h5 className="font-medium mt-3">1.3 Responsabilidades do Usuário</h5>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a segurança de sua conta (usuário e senha)</li>
                <li>Supervisionar o uso da plataforma pela criança</li>
                <li>Buscar ajuda profissional quando necessário</li>
                <li>Não compartilhar dados de acesso com terceiros não autorizados</li>
              </ul>

              <h5 className="font-medium mt-3">1.4 Limitações de Responsabilidade</h5>
              <p className="text-muted-foreground">
                A NeuroPlay não se responsabiliza por decisões tomadas baseadas exclusivamente 
                nos dados da plataforma sem consulta a profissionais. Não garantimos resultados 
                terapêuticos específicos. A plataforma é fornecida "como está".
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-base mb-2">2. Política de Privacidade - LGPD</h4>
              
              <h5 className="font-medium mt-3">2.1 Dados Coletados</h5>
              <p className="text-muted-foreground mb-2">Coletamos:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Dados cadastrais (nome, email, data de nascimento da criança)</li>
                <li>Dados de desempenho nos jogos (pontuações, tempos de resposta, acertos/erros)</li>
                <li>Resultados de testes de triagem</li>
                <li>Registros de uso da plataforma (logs de acesso, funcionalidades utilizadas)</li>
                <li>Dados de consentimento (quando e como você concordou com estes termos)</li>
              </ul>

              <h5 className="font-medium mt-3">2.2 Como Usamos os Dados</h5>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Personalizar a experiência e dificuldade dos jogos</li>
                <li>Gerar relatórios de progresso</li>
                <li>Melhorar a plataforma (análises agregadas e anônimas)</li>
                <li>Pesquisa científica (apenas com seu consentimento explícito e dados anonimizados)</li>
              </ul>

              <h5 className="font-medium mt-3">2.3 Compartilhamento de Dados</h5>
              <p className="text-muted-foreground">
                Seus dados NÃO são vendidos. Compartilhamento ocorre apenas:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Com profissionais que você autorizar (terapeutas, médicos, educadores)</li>
                <li>Para pesquisa científica (dados anonimizados e apenas com seu consentimento)</li>
                <li>Quando exigido por lei</li>
              </ul>

              <h5 className="font-medium mt-3">2.4 Segurança</h5>
              <p className="text-muted-foreground">
                Utilizamos criptografia, controles de acesso e monitoramento para proteger seus dados. 
                Armazenamento em servidores seguros com backup regular.
              </p>

              <h5 className="font-medium mt-3">2.5 Seus Direitos (LGPD)</h5>
              <p className="text-muted-foreground mb-2">Você tem direito a:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Acessar seus dados a qualquer momento</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar exclusão de dados (direito ao esquecimento)</li>
                <li>Revogar consentimentos</li>
                <li>Exportar seus dados em formato legível</li>
              </ul>

              <h5 className="font-medium mt-3">2.6 Retenção de Dados</h5>
              <p className="text-muted-foreground">
                Dados são mantidos enquanto a conta estiver ativa ou conforme necessário para 
                cumprir obrigações legais. Após solicitação de exclusão, dados são removidos 
                em até 30 dias, exceto aqueles exigidos por lei.
              </p>

              <h5 className="font-medium mt-3">2.7 Contato</h5>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato: 
                privacidade@neuroplay.com.br
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-base mb-2">3. Alterações</h4>
              <p className="text-muted-foreground">
                Podemos atualizar estes termos. Alterações significativas serão notificadas por 
                email. O uso continuado após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <p className="text-xs text-muted-foreground mt-6">
              Versão 1.0.0 - Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </ScrollArea>

        {!hasScrolled && (
          <p className="text-sm text-amber-600 dark:text-amber-500">
            Por favor, role até o final do texto para continuar
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              disabled={!hasScrolled}
            />
            <label
              htmlFor="terms"
              className={`text-sm leading-tight ${!hasScrolled ? 'text-muted-foreground' : 'cursor-pointer'}`}
            >
              Li e aceito os <strong>Termos de Uso</strong> da NeuroPlay
            </label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="privacy"
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              disabled={!hasScrolled}
            />
            <label
              htmlFor="privacy"
              className={`text-sm leading-tight ${!hasScrolled ? 'text-muted-foreground' : 'cursor-pointer'}`}
            >
              Li e aceito a <strong>Política de Privacidade</strong> e estou ciente do tratamento 
              de dados pessoais conforme a LGPD
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={!hasScrolled || !acceptedTerms || !acceptedPrivacy}
          size="lg"
        >
          Próximo
        </Button>
      </div>
    </form>
  );
}
