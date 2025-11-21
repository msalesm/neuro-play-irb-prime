import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const [understood, setUnderstood] = useState(false);

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Aviso Importante - Leia com Atenção
          </DialogTitle>
          <DialogDescription className="text-base">
            Antes de começar, é essencial que você compreenda a natureza desta plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertDescription className="text-sm leading-relaxed">
              <strong className="block mb-2 text-base">A NeuroPlay é uma ferramenta de apoio terapêutico e educacional.</strong>
              
              <p className="mb-2">
                <strong>NÃO substitui</strong> avaliação, diagnóstico ou tratamento profissional.
              </p>
              
              <p className="mb-2">
                Os resultados dos jogos e testes de triagem <strong>devem ser interpretados por profissionais qualificados</strong> (psicólogos, terapeutas, médicos, pedagogos especializados).
              </p>
              
              <p className="mb-2">
                Esta plataforma oferece:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Jogos cognitivos terapêuticos para estimulação</li>
                <li>Testes de triagem (não diagnóstico) para identificação de sinais</li>
                <li>Relatórios de progresso baseados em desempenho nos jogos</li>
                <li>Conteúdo educacional para pais e educadores</li>
              </ul>

              <p className="mt-4 font-semibold">
                Em caso de dúvidas, preocupações ou identificação de sinais de risco, 
                <span className="text-amber-600"> sempre consulte um especialista.</span>
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Limitações da Plataforma:</h4>
            <ul className="space-y-2 text-sm">
              <li>• Os jogos não são testes diagnósticos formais</li>
              <li>• A IA fornece insights, mas não substitui avaliação clínica</li>
              <li>• Resultados podem variar por fatores como cansaço, motivação, ambiente</li>
              <li>• Triagens têm margem de erro (falsos positivos/negativos possíveis)</li>
            </ul>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2">Quando Procurar Ajuda Profissional:</h4>
            <ul className="space-y-2 text-sm">
              <li>• Dificuldades persistentes no desenvolvimento</li>
              <li>• Resultados de triagem indicando risco</li>
              <li>• Regressão em habilidades já adquiridas</li>
              <li>• Preocupações de professores ou cuidadores</li>
              <li>• Impacto no bem-estar da criança ou família</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <div className="flex items-start gap-2 w-full">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
            />
            <label
              htmlFor="understood"
              className="text-sm leading-tight cursor-pointer"
            >
              Li e compreendi que a NeuroPlay é uma ferramenta de apoio e não substitui 
              avaliação ou tratamento profissional. Em caso de necessidade, procurarei 
              um especialista qualificado.
            </label>
          </div>
          
          <Button
            onClick={onAccept}
            disabled={!understood}
            className="w-full"
            size="lg"
          >
            Aceitar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
