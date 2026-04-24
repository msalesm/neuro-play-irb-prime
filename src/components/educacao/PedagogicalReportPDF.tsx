import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { generateTraitProfile } from '@/modules/behavioral/trait-profile-engine';
import { toast } from 'sonner';

interface Props {
  studentId: string;
  studentName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  /** When true, attempts to also load behavioral profile by resolving child_profiles. */
  resolveProfile?: boolean;
}

/**
 * Pedagogical Report — extends StudentReportPDF with:
 *  - Trait profile (dominant + emerging) in family-friendly language
 *  - Recent observations summary (last 30 days)
 *  - Quick-win pedagogical suggestions
 *
 * Strictly pedagogical tone — no clinical/diagnostic language.
 */
export function PedagogicalReportButton({
  studentId,
  studentName,
  className,
  variant = 'outline',
  size = 'sm',
  resolveProfile = true,
}: Props) {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = toast.loading('Gerando relatório pedagógico...');
    try {
      // 1. Fetch recent observations
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data: observations = [] } = await supabase
        .from('student_observations')
        .select('*')
        .eq('child_id', studentId)
        .gte('observation_week', since.toISOString().slice(0, 10))
        .order('observation_week', { ascending: true });

      // 2. Resolve child_profile_id and load behavioral profile (best-effort)
      let traitProfile: ReturnType<typeof generateTraitProfile> | null = null;
      if (resolveProfile) {
        try {
          const { data: child } = await supabase
            .from('children')
            .select('name, birth_date')
            .eq('id', studentId)
            .maybeSingle();
          // Try matching child_profiles by parent_user_id+name fallback (best effort)
          const { data: cp } = await supabase
            .from('child_profiles')
            .select('id')
            .eq('name', child?.name || studentName)
            .limit(1)
            .maybeSingle();
          if (cp?.id) {
            const { data: profile } = await supabase
              .from('behavioral_profiles' as any)
              .select('*')
              .eq('child_profile_id', cp.id)
              .maybeSingle();
            if (profile) {
              traitProfile = generateTraitProfile(profile as any);
            }
          }
        } catch {
          // Profile lookup is best-effort; continue without it
        }
      }

      generatePedagogicalPDF({
        studentName,
        className,
        observations: observations || [],
        traitProfile,
      });
      toast.success('Relatório pronto!', { id: t });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar relatório', { id: t });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleClick} className="gap-1.5">
      <FileText className="h-4 w-4" />
      Relatório pedagógico
    </Button>
  );
}

function generatePedagogicalPDF(args: {
  studentName: string;
  className?: string;
  observations: any[];
  traitProfile: ReturnType<typeof generateTraitProfile> | null;
}) {
  const { studentName, className, observations, traitProfile } = args;
  const doc = new jsPDF();
  const PAGE_W = 210;
  const MARGIN = 18;
  const RIGHT = PAGE_W - MARGIN;
  let y = 22;

  const ensureSpace = (h = 12) => {
    if (y + h > 280) {
      doc.addPage();
      y = 22;
    }
  };

  // Header band
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, PAGE_W, 14, 'F');
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.text('NeuroPlay · Relatório Pedagógico', MARGIN, 9);
  doc.setFontSize(8);
  doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), RIGHT, 9, { align: 'right' });

  doc.setTextColor(20);
  doc.setFontSize(18);
  doc.text(studentName, MARGIN, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${className ? `Turma: ${className}  ·  ` : ''}Período: últimos 30 dias`, MARGIN, y);
  y += 10;

  // ── Trait profile ──
  if (traitProfile && traitProfile.dominantTraits.length > 0) {
    doc.setTextColor(20);
    doc.setFontSize(13);
    doc.text('Perfil pedagógico', MARGIN, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(80);
    const narrative = doc.splitTextToSize(traitProfile.narrative, PAGE_W - 2 * MARGIN);
    doc.text(narrative, MARGIN, y);
    y += narrative.length * 4.5 + 3;

    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text('Traços dominantes', MARGIN, y);
    y += 5;
    doc.setFontSize(9);
    traitProfile.dominantTraits.slice(0, 5).forEach((t) => {
      ensureSpace();
      doc.setTextColor(60);
      doc.text(`• ${t.name} — ${t.description}`, MARGIN + 2, y, { maxWidth: PAGE_W - 2 * MARGIN - 2 });
      y += 5.5;
    });

    if (traitProfile.emergingTraits.length > 0) {
      y += 2;
      ensureSpace();
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text('Traços em desenvolvimento', MARGIN, y);
      y += 5;
      doc.setFontSize(9);
      traitProfile.emergingTraits.slice(0, 3).forEach((t) => {
        ensureSpace();
        doc.setTextColor(60);
        doc.text(`• ${t.name}`, MARGIN + 2, y);
        y += 5;
      });
    }

    if (traitProfile.classroomQuickWins.length > 0) {
      y += 3;
      ensureSpace(20);
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(MARGIN, y, PAGE_W - 2 * MARGIN, 6 + traitProfile.classroomQuickWins.length * 5.5, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text('Sugestões para a sala de aula', MARGIN + 3, y + 5);
      let yi = y + 11;
      doc.setFontSize(9);
      doc.setTextColor(60);
      traitProfile.classroomQuickWins.forEach((s) => {
        doc.text(`→ ${s}`, MARGIN + 5, yi, { maxWidth: PAGE_W - 2 * MARGIN - 8 });
        yi += 5.5;
      });
      y = yi + 4;
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      'Perfil pedagógico ainda em construção. Após mais atividades nos jogos, surgirão traços para personalizar a experiência.',
      MARGIN,
      y,
      { maxWidth: PAGE_W - 2 * MARGIN }
    );
    y += 12;
  }

  // ── Observations summary ──
  ensureSpace(20);
  y += 4;
  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.text('Observações recentes', MARGIN, y);
  y += 6;
  doc.setFontSize(9);

  if (observations.length === 0) {
    doc.setTextColor(120);
    doc.text('Nenhuma observação registrada nos últimos 30 dias.', MARGIN, y);
    y += 8;
  } else {
    observations.slice(-5).reverse().forEach((obs: any) => {
      ensureSpace(14);
      doc.setTextColor(20);
      doc.setFontSize(10);
      doc.text(format(new Date(obs.observation_week), "dd 'de' MMM", { locale: ptBR }), MARGIN, y);
      y += 4.5;
      doc.setFontSize(9);
      doc.setTextColor(80);
      const summary: string[] = [];
      if (obs.participation != null) summary.push(`Participação ${labelLevel(obs.participation)}`);
      if (obs.focus_difficulty != null) summary.push(`Foco ${labelInverse(obs.focus_difficulty)}`);
      if (obs.social_isolation != null) summary.push(`Interação social ${labelInverse(obs.social_isolation)}`);
      doc.text(summary.join(' · ') || '—', MARGIN + 2, y);
      y += 4.5;
      if (obs.notes) {
        const lines = doc.splitTextToSize(`Nota: ${obs.notes}`, PAGE_W - 2 * MARGIN - 2);
        doc.setTextColor(110);
        doc.text(lines, MARGIN + 2, y);
        y += lines.length * 4 + 2;
      }
      y += 2;
    });
  }

  // Footer disclaimer
  doc.setFontSize(8);
  doc.setTextColor(130);
  const disclaimer =
    'Este relatório é uma ferramenta pedagógica de apoio à observação do(a) educador(a). Não constitui avaliação clínica nem diagnóstico.';
  doc.text(disclaimer, MARGIN, 288, { maxWidth: PAGE_W - 2 * MARGIN });

  doc.save(`relatorio-pedagogico-${studentName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

function labelLevel(v: number): string {
  if (v <= 1) return 'baixa';
  if (v >= 3) return 'alta';
  return 'moderada';
}
function labelInverse(v: number): string {
  // For "difficulty/isolation" indicators, low value = good
  if (v <= 1) return 'fluindo bem';
  if (v >= 3) return 'precisa de apoio';
  return 'em observação';
}