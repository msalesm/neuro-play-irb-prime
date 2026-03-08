import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClinicalReportData {
  childName: string;
  childAge?: number;
  reportType: 'clinical' | 'pedagogical' | 'family';
  period: { start: Date; end: Date };
  professionalName?: string;
  cognitiveScores?: Record<string, number>;
  emotionalData?: { stability: number; engagement: number; frustrationEvents: number };
  screenings?: Array<{ type: string; score: number; date: string }>;
  gameSessions?: number;
  recommendations?: string[];
  alerts?: string[];
  observations?: string;
  abaProgress?: Array<{ skill: string; baseline: number; current: number }>;
}

const REPORT_LABELS: Record<string, string> = {
  clinical: 'Relatório Clínico',
  pedagogical: 'Relatório Pedagógico',
  family: 'Relatório Familiar',
};

export function generateClinicalPDF(data: ClinicalReportData) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 0;
  const lh = 7;

  const checkPage = (needed = 20) => {
    if (y > 270 - needed) { doc.addPage(); y = 20; }
  };

  const text = (t: string, size = 10, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(t, pw - margin * 2);
    lines.forEach((line: string) => { checkPage(); doc.text(line, margin, y); y += lh; });
  };

  const section = (title: string) => {
    checkPage(30);
    y += 4;
    doc.setDrawColor(0, 90, 112);
    doc.line(margin, y, pw - margin, y);
    y += 8;
    text(title, 13, true);
    y += 2;
  };

  // ─── Header ───
  doc.setFillColor(10, 30, 53);
  doc.rect(0, 0, pw, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NEUROPLAY', margin, 22);
  doc.setFontSize(14);
  doc.text(REPORT_LABELS[data.reportType] || 'Relatório', margin, 34);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${data.childName}${data.childAge ? ` (${data.childAge} anos)` : ''}`, margin, 43);

  y = 58;
  doc.setTextColor(0, 0, 0);

  // ─── Meta ───
  text(`Período: ${format(data.period.start, 'dd/MM/yyyy')} a ${format(data.period.end, 'dd/MM/yyyy')}`);
  if (data.professionalName) text(`Profissional: ${data.professionalName}`);
  text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
  if (data.gameSessions !== undefined) text(`Sessões analisadas: ${data.gameSessions}`);

  // ─── Cognitive Scores ───
  if (data.cognitiveScores && Object.keys(data.cognitiveScores).length > 0) {
    section('PERFIL COGNITIVO');
    Object.entries(data.cognitiveScores).forEach(([domain, score]) => {
      const label = domain.charAt(0).toUpperCase() + domain.slice(1);
      text(`${label}: ${score}%`);
    });
  }

  // ─── Emotional ───
  if (data.emotionalData) {
    section('ANÁLISE EMOCIONAL');
    text(`Estabilidade: ${data.emotionalData.stability}%`);
    text(`Engajamento: ${data.emotionalData.engagement}%`);
    text(`Eventos de Frustração: ${data.emotionalData.frustrationEvents}`);
  }

  // ─── Screenings ───
  if (data.screenings && data.screenings.length > 0) {
    section('TRIAGENS REALIZADAS');
    data.screenings.forEach(s => {
      text(`${s.type.toUpperCase()}: ${s.score}% — ${format(new Date(s.date), 'dd/MM/yyyy')}`);
    });
    text('⚠ Triagens são rastreamento inicial e não constituem diagnóstico.', 8);
  }

  // ─── ABA Progress ───
  if (data.abaProgress && data.abaProgress.length > 0) {
    section('PROGRESSO ABA');
    data.abaProgress.forEach(a => {
      text(`${a.skill}: ${a.baseline}% → ${a.current}% (${a.current > a.baseline ? '↑' : a.current < a.baseline ? '↓' : '→'})`);
    });
  }

  // ─── Observations ───
  if (data.observations) {
    section('OBSERVAÇÕES');
    text(data.observations);
  }

  // ─── Recommendations ───
  if (data.recommendations && data.recommendations.length > 0) {
    section('RECOMENDAÇÕES');
    data.recommendations.forEach((r, i) => text(`${i + 1}. ${r}`));
  }

  // ─── Alerts ───
  if (data.alerts && data.alerts.length > 0) {
    section('ALERTAS CLÍNICOS');
    data.alerts.forEach(a => text(`⚠ ${a}`));
  }

  // ─── Clinical Disclaimer Footer ───
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text(
      'NeuroPlay — Ferramenta de apoio terapêutico. Não substitui avaliação profissional. Conforme Lei 14.254/21.',
      pw / 2, 287, { align: 'center' }
    );
    doc.text(`Página ${i} de ${totalPages}`, pw - 25, 287);
  }

  const slug = data.childName.toLowerCase().replace(/\s+/g, '-');
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  doc.save(`${data.reportType}-${slug}-${dateStr}.pdf`);
}
