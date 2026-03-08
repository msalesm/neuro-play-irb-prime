import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DISCLAIMER_KEY = 'neuroplay_clinical_disclaimer_accepted';

export function ClinicalDisclaimerModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkDisclaimerStatus();
  }, [user]);

  const checkDisclaimerStatus = async () => {
    if (!user) return;

    // Check local storage first for quick UX
    const local = localStorage.getItem(`${DISCLAIMER_KEY}_${user.id}`);
    if (local === 'true') return;

    // Check DB
    const { data } = await supabase
      .from('data_consents')
      .select('id')
      .eq('user_id', user.id)
      .eq('consent_type', 'clinical_disclaimer')
      .eq('consent_given', true)
      .maybeSingle();

    if (!data) {
      setOpen(true);
    } else {
      localStorage.setItem(`${DISCLAIMER_KEY}_${user.id}`, 'true');
    }
  };

  const handleAccept = async () => {
    if (!user || !accepted) return;

    await supabase.from('data_consents').insert({
      user_id: user.id,
      consent_type: 'clinical_disclaimer',
      consent_given: true,
      consent_version: '1.0',
    });

    localStorage.setItem(`${DISCLAIMER_KEY}_${user.id}`, 'true');
    setOpen(false);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Aviso Clínico Obrigatório
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  O NeuroPlay é uma ferramenta de apoio terapêutico e educacional. Ele NÃO substitui avaliação, diagnóstico ou tratamento profissional.
                </p>

                <p>
                  Os resultados de triagens, análises cognitivas e relatórios gerados pela plataforma são indicativos e baseados em dados de desempenho em atividades lúdicas. Eles não constituem diagnóstico clínico.
                </p>

                <p>
                  <strong>Importante:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Os scores e perfis cognitivos são baseados em métricas de jogos, não em testes padronizados.</li>
                  <li>Triagens de TEA, TDAH e Dislexia servem apenas como rastreamento inicial para orientar encaminhamento profissional.</li>
                  <li>Recomendações geradas por IA são sugestões gerais e devem ser validadas pelo profissional de saúde responsável.</li>
                  <li>Nenhuma decisão clínica deve ser tomada exclusivamente com base nos dados desta plataforma.</li>
                </ul>

                <p>
                  <strong>Para profissionais de saúde:</strong> Os dados da plataforma podem ser utilizados como informação complementar durante avaliações clínicas, mas não substituem instrumentos padronizados e validados.
                </p>

                <p>
                  <strong>Para pais e responsáveis:</strong> Consulte sempre um profissional qualificado (neuropediatra, psicólogo, fonoaudiólogo, etc.) para avaliação e acompanhamento do desenvolvimento da criança.
                </p>

                <p className="text-xs text-muted-foreground/70">
                  Em conformidade com a Lei 14.254/21 e diretrizes do CFP/CRP sobre uso de tecnologia em contextos clínicos.
                </p>
              </div>
            </ScrollArea>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-2 py-2 border-t border-b">
          <Checkbox
            id="disclaimer-accept"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          <label htmlFor="disclaimer-accept" className="text-sm cursor-pointer leading-snug">
            Declaro que li e compreendi que o NeuroPlay é uma ferramenta de apoio e não substitui avaliação profissional.
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction disabled={!accepted} onClick={handleAccept}>
            Aceitar e Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
