import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentReportPDFProps {
  student: { name: string; birth_date: string };
  observations: any[];
  className?: string;
}

const INDICATOR_LABELS: Record<string, string> = {
  participation: 'Participação em sala',
  behavior_change: 'Mudança de comportamento',
  social_isolation: 'Isolamento social',
  aggressiveness: 'Agressividade',
  focus_difficulty: 'Dificuldade de foco',
  performance_drop: 'Queda de rendimento',
  persistent_sadness: 'Tristeza persistente',
};

const LEVEL_TEXT: Record<number, string> = { 1: 'Adequado', 2: 'Atenção', 3: 'Prioridade' };

function getReferralSuggestions(latest: any): string[] {
  const suggestions: string[] = [];
  if (latest.persistent_sadness >= 3 || latest.social_isolation >= 3) {
    suggestions.push('Psicólogo');
  }
  if (latest.focus_difficulty >= 3 && latest.performance_drop >= 3) {
    suggestions.push('Psicopedagogo');
  }
  if (latest.aggressiveness >= 3) {
    suggestions.push('Assistência Social');
  }
  if (latest.persistent_sadness >= 3 && latest.social_isolation >= 3 && latest.aggressiveness >= 3) {
    suggestions.push('Conselho Tutelar');
  }
  return suggestions;
}

function getPedagogicalSuggestions(latest: any): string[] {
  const suggestions: string[] = [];
  if (latest.participation <= 1) suggestions.push('Incentivar participação com perguntas direcionadas');
  if (latest.social_isolation >= 2) suggestions.push('Atividades em dupla ou pequenos grupos');
  if (latest.focus_difficulty >= 2) suggestions.push('Reduzir estímulos visuais, pausas frequentes');
  if (latest.aggressiveness >= 2) suggestions.push('Técnicas de regulação emocional (respiração, contagem)');
  if (latest.performance_drop >= 2) suggestions.push('Adaptação pedagógica e reforço individualizado');
  if (latest.persistent_sadness >= 2) suggestions.push('Acolhimento individual, escuta ativa');
  return suggestions;
}

export function generateStudentPDF(student: StudentReportPDFProps['student'], observations: any[], className?: string) {
  const doc = new jsPDF();
  const now = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });
  const sorted = [...observations].sort((a, b) => a.observation_week.localeCompare(b.observation_week));
  const latest = sorted[sorted.length - 1];

  // Header
  doc.setFontSize(18);
  doc.text('Relatório Individual do Aluno', 20, 25);
  doc.setFontSize(11);
  doc.text(`Aluno: ${student.name}`, 20, 35);
  doc.text(`Turma: ${className || '-'}`, 20, 42);
  doc.text(`Data de Nascimento: ${format(new Date(student.birth_date), "dd/MM/yyyy")}`, 20, 49);
  doc.text(`Gerado em: ${now}`, 20, 56);

  // Latest observation
  let y = 70;
  doc.setFontSize(13);
  doc.text('Última Observação', 20, y);
  y += 8;
  doc.setFontSize(10);

  if (latest) {
    doc.text(`Semana: ${format(new Date(latest.observation_week), "dd/MM/yyyy")}`, 25, y);
    y += 7;
    doc.text(`Nível de risco: ${latest.risk_level === 'high' ? 'PRIORIDADE' : latest.risk_level === 'moderate' ? 'ATENÇÃO' : 'ADEQUADO'}`, 25, y);
    y += 10;

    Object.entries(INDICATOR_LABELS).forEach(([key, label]) => {
      const val = latest[key] as number;
      doc.text(`${label}: ${LEVEL_TEXT[val] || val}`, 25, y);
      y += 6;
    });

    if (latest.notes) {
      y += 4;
      doc.text(`Observações: ${latest.notes}`, 25, y, { maxWidth: 160 });
      y += 10;
    }
  }

  // Evolution
  if (sorted.length > 1) {
    y += 6;
    doc.setFontSize(13);
    doc.text('Evolução Comportamental', 20, y);
    y += 8;
    doc.setFontSize(10);
    sorted.forEach((obs: any) => {
      doc.text(`${format(new Date(obs.observation_week), "dd/MM")} — Risco: ${obs.risk_level} | Score: ${obs.risk_score || '-'}`, 25, y);
      y += 6;
      if (y > 260) { doc.addPage(); y = 20; }
    });
  }

  // Pedagogical suggestions
  if (latest) {
    const pedagSugg = getPedagogicalSuggestions(latest);
    if (pedagSugg.length > 0) {
      y += 6;
      doc.setFontSize(13);
      doc.text('Sugestões Pedagógicas', 20, y);
      y += 8;
      doc.setFontSize(10);
      pedagSugg.forEach(s => {
        doc.text(`• ${s}`, 25, y);
        y += 6;
        if (y > 260) { doc.addPage(); y = 20; }
      });
    }

    // Referrals
    const referrals = getReferralSuggestions(latest);
    if (referrals.length > 0) {
      y += 6;
      doc.setFontSize(13);
      doc.text('Sugestão de Encaminhamento', 20, y);
      y += 8;
      doc.setFontSize(10);
      referrals.forEach(r => {
        doc.text(`→ ${r}`, 25, y);
        y += 6;
      });
    }
  }

  // Disclaimer
  doc.setFontSize(8);
  doc.text('⚠️ Este relatório é uma ferramenta de apoio educacional e NÃO substitui avaliação clínica profissional.', 20, 280);

  doc.save(`relatorio-${student.name.replace(/\s/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function StudentReportButton({ student, observations, className }: StudentReportPDFProps) {
  if (observations.length === 0) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1"
      onClick={(e) => {
        e.stopPropagation();
        generateStudentPDF(student, observations, className);
      }}
    >
      <FileDown className="h-3.5 w-3.5" />
      PDF
    </Button>
  );
}
