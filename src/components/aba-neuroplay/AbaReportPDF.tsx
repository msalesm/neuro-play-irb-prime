import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAbaInterventions, useAbaTrials, useAbaSessions, useAbaGoals, useAbaClinicalNotes } from '@/hooks/useAbaNeuroPlay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileDown, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  programId: string;
  childId: string;
}

const PROMPT_LABELS: Record<string, string> = {
  fisico_total: 'Físico Total', fisico_parcial: 'Físico Parcial', gestual: 'Gestual',
  verbal: 'Verbal', visual: 'Visual', independente: 'Independente',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa', achieved: 'Alcançada', revised: 'Revisada', in_progress: 'Em Progresso',
  mastered: 'Dominada', paused: 'Pausada', discontinued: 'Descontinuada',
};

export function AbaReportPDF({ programId, childId }: Props) {
  const [generating, setGenerating] = useState(false);
  const { data: interventions } = useAbaInterventions(programId);
  const { data: sessions } = useAbaSessions(programId);
  const { data: goals } = useAbaGoals(programId);
  const { data: notes } = useAbaClinicalNotes(childId);

  // Fetch names
  const { data: programData } = useQuery({
    queryKey: ['aba-program-name', programId],
    queryFn: async () => {
      const { data } = await supabase.from('aba_np_programs').select('program_name').eq('id', programId).maybeSingle();
      return data;
    },
  });
  const { data: childData } = useQuery({
    queryKey: ['child-name', childId],
    queryFn: async () => {
      const { data } = await supabase.from('children').select('name').eq('id', childId).maybeSingle();
      return data;
    },
  });
  const programName = programData?.program_name || 'Programa ABA';
  const childName = childData?.name || 'Paciente';

  // Fetch all trials for this program's interventions in one query
  const interventionIds = interventions?.map((i: any) => i.id) || [];
  const { data: allTrialsData } = useQuery({
    queryKey: ['aba-report-trials', programId, interventionIds.join(',')],
    queryFn: async () => {
      if (!interventionIds.length) return [];
      const { data, error } = await supabase
        .from('aba_np_trials')
        .select('*')
        .in('intervention_id', interventionIds)
        .order('recorded_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!interventionIds.length,
  });

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const checkPage = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
      };

      const addSection = (title: string) => {
        checkPage(20);
        y += 6;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(title, margin, y);
        y += 2;
        doc.setDrawColor(100, 100, 220);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + contentWidth, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
      };

      const addText = (text: string, indent = 0) => {
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        checkPage(lines.length * 5 + 2);
        doc.text(lines, margin + indent, y);
        y += lines.length * 5 + 2;
      };

      // ===== HEADER =====
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 150);
      doc.text('Relatório Clínico ABA', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, margin, y);
      y += 12;

      // ===== PATIENT INFO =====
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text('Paciente:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(childName, margin + 30, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Programa:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(programName, margin + 32, y);
      y += 10;

      // ===== SUMMARY =====
      addSection('Resumo Geral');
      
      const allTrials = allTrialsData || [];

      const totalTrials = allTrials.length;
      const correctTrials = allTrials.filter(t => t.correct).length;
      const independentTrials = allTrials.filter(t => t.prompt_level === 'independente').length;
      const accuracy = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
      const independence = totalTrials > 0 ? Math.round((independentTrials / totalTrials) * 100) : 0;
      const completedSessions = sessions?.filter((s: any) => s.status === 'completed').length || 0;

      addText(`• Total de tentativas: ${totalTrials}`);
      addText(`• Taxa de acurácia: ${accuracy}%`);
      addText(`• Taxa de independência: ${independence}%`);
      addText(`• Sessões realizadas: ${completedSessions}`);
      addText(`• Habilidades treinadas: ${interventions?.length || 0}`);

      // ===== INTERVENTIONS =====
      if (interventions?.length) {
        addSection('Habilidades e Progresso');
        interventions.forEach((intv: any, idx: number) => {
          const trials = (allTrialsData || []).filter((t: any) => t.intervention_id === intv.id);
          const iTotal = trials.length;
          const iCorrect = trials.filter((t: any) => t.correct).length;
          const iIndep = trials.filter((t: any) => t.prompt_level === 'independente').length;
          const iAcc = iTotal > 0 ? Math.round((iCorrect / iTotal) * 100) : 0;
          const iInd = iTotal > 0 ? Math.round((iIndep / iTotal) * 100) : 0;

          checkPage(25);
          doc.setFont('helvetica', 'bold');
          addText(`${idx + 1}. ${intv.aba_np_skills?.skill_name || 'Habilidade'}`);
          doc.setFont('helvetica', 'normal');
          addText(`Status: ${STATUS_LABELS[intv.status] || intv.status} | Acurácia: ${iAcc}% | Independência: ${iInd}% | Tentativas: ${iTotal}`, 6);
          if (intv.success_criteria) addText(`Critério: ${intv.success_criteria}`, 6);
          y += 2;
        });
      }

      // ===== GOALS =====
      if (goals?.length) {
        addSection('Metas do Programa');
        goals.forEach((goal: any, idx: number) => {
          checkPage(15);
          doc.setFont('helvetica', 'bold');
          addText(`${idx + 1}. ${goal.goal_description}`);
          doc.setFont('helvetica', 'normal');
          addText(`Status: ${STATUS_LABELS[goal.status] || goal.status}${goal.success_criteria ? ` | Critério: ${goal.success_criteria}` : ''}`, 6);
          if (goal.achieved_at) addText(`Alcançada em: ${format(new Date(goal.achieved_at), 'dd/MM/yyyy')}`, 6);
        });
      }

      // ===== SESSIONS =====
      if (sessions?.length) {
        addSection('Sessões Realizadas');
        const recentSessions = sessions.slice(0, 10);
        recentSessions.forEach((session: any) => {
          checkPage(12);
          const date = format(new Date(session.session_date), 'dd/MM/yyyy');
          const duration = session.duration_minutes ? `${session.duration_minutes} min` : 'N/A';
          const env = session.environment || 'N/A';
          addText(`• ${date} — Duração: ${duration} | Ambiente: ${env} | Status: ${session.status}`);
          if (session.notes) addText(`  Notas: ${session.notes}`, 6);
        });
        if (sessions.length > 10) addText(`... e mais ${sessions.length - 10} sessões`);
      }

      // ===== CLINICAL NOTES =====
      const programNotes = notes?.filter((n: any) => n.program_id === programId) || [];
      if (programNotes.length) {
        addSection('Observações Clínicas');
        programNotes.slice(0, 15).forEach((note: any) => {
          checkPage(15);
          const date = format(new Date(note.created_at), 'dd/MM/yyyy');
          const type = note.note_type === 'behavioral' ? 'Comportamental' :
                       note.note_type === 'environmental' ? 'Ambiental' :
                       note.note_type === 'family' ? 'Familiar' : 'Geral';
          doc.setFont('helvetica', 'bold');
          addText(`[${date}] ${type}`);
          doc.setFont('helvetica', 'normal');
          addText(note.content, 6);
        });
      }

      // ===== PROMPT DISTRIBUTION =====
      if (totalTrials > 0) {
        addSection('Distribuição de Prompts');
        const promptCount: Record<string, number> = {};
        allTrials.forEach(t => {
          const key = t.prompt_level || 'unknown';
          promptCount[key] = (promptCount[key] || 0) + 1;
        });
        Object.entries(promptCount)
          .sort(([a], [b]) => (PROMPT_LABELS[a] || a).localeCompare(PROMPT_LABELS[b] || b))
          .forEach(([level, count]) => {
            const pct = Math.round((count / totalTrials) * 100);
            addText(`• ${PROMPT_LABELS[level] || level}: ${count} (${pct}%)`);
          });
      }

      // ===== FOOTER =====
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `NeuroPlay — Relatório ABA — Página ${i}/${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`relatorio-aba-${childName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  // Quick stats for preview card
  let allTrials: any[] = [];
  trialQueries.forEach(q => { if (q.data) allTrials = allTrials.concat(q.data); });
  const totalTrials = allTrials.length;
  const accuracy = totalTrials > 0 ? Math.round((allTrials.filter(t => t.correct).length / totalTrials) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-primary" />
          Relatório Clínico ABA
        </CardTitle>
        <CardDescription>
          Gere um relatório PDF completo com progresso, metas, sessões e observações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Badge variant="outline">{totalTrials} tentativas</Badge>
          <Badge variant="outline">{accuracy}% acurácia</Badge>
          <Badge variant="outline">{interventions?.length || 0} habilidades</Badge>
          <Badge variant="outline">{sessions?.filter((s: any) => s.status === 'completed').length || 0} sessões</Badge>
          <Badge variant="outline">{goals?.length || 0} metas</Badge>
        </div>
        <Button onClick={generatePDF} disabled={generating || totalTrials === 0}>
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          {generating ? 'Gerando...' : 'Baixar Relatório PDF'}
        </Button>
        {totalTrials === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Registre tentativas para gerar o relatório
          </p>
        )}
      </CardContent>
    </Card>
  );
}
