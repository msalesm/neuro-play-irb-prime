import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Brain, FileText, Loader2, CheckCircle2, AlertTriangle, 
  Target, Lightbulb, BookOpen, Users, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BehavioralReportDisclaimer } from '@/components/BehavioralReportDisclaimer';
import jsPDF from 'jspdf';

interface SkillsInventoryReportProps {
  inventoryId: string | null;
  childName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportData {
  resumoExecutivo: string;
  pontosFortes: string[];
  areasAtencao: string[];
  analiseDetalhada: Record<string, string>;
  recomendacoes: Array<{
    area: string;
    objetivo: string;
    estrategias: string[];
    prioridade: string;
  }>;
  sugestoesAtividadesAEE: string[];
  orientacoesEquipe: string;
  conclusao: string;
}

const areaLabels: Record<string, string> = {
  comunicacaoRepresentacao: 'Comunicação e Representação',
  raciocinioLogico: 'Raciocínio Lógico',
  representacaoEspacial: 'Representação Espacial',
  percepcaoSensorial: 'Percepção Sensorial',
  areaFisicaMotora: 'Área Física e Motora',
  areaSocioemocional: 'Área Socioemocional',
};

const priorityColor: Record<string, string> = {
  alta: 'destructive',
  média: 'secondary',
  baixa: 'outline',
};

export function SkillsInventoryReport({ inventoryId, childName, open, onOpenChange }: SkillsInventoryReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const generateReport = async () => {
    if (!inventoryId) {
      toast.error('Salve o inventário antes de gerar o relatório');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-skills-report', {
        body: { inventoryId }
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setReport(data.report);
      setGeneratedAt(data.generatedAt);
      toast.success('Relatório gerado com sucesso!');
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    const addText = (text: string, fontSize: number, bold = false, color: [number, number, number] = [30, 30, 30]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      }
      y += 4;
    };

    addText(`Relatório do Inventário de Habilidades`, 16, true, [0, 100, 180]);
    addText(`Aluno(a): ${childName || 'Não identificado'}`, 11, false);
    addText(`Data: ${generatedAt ? new Date(generatedAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}`, 10, false, [100, 100, 100]);
    y += 6;

    addText('Resumo Executivo', 13, true);
    addText(report.resumoExecutivo || '', 10);
    y += 4;

    if (report.pontosFortes?.length) {
      addText('Pontos Fortes', 13, true, [0, 130, 60]);
      report.pontosFortes.forEach(p => addText(`• ${p}`, 10));
      y += 4;
    }

    if (report.areasAtencao?.length) {
      addText('Áreas de Atenção', 13, true, [200, 80, 0]);
      report.areasAtencao.forEach(a => addText(`• ${a}`, 10));
      y += 4;
    }

    if (report.analiseDetalhada) {
      addText('Análise Detalhada', 13, true);
      Object.entries(report.analiseDetalhada).forEach(([key, value]) => {
        addText(areaLabels[key] || key, 11, true, [60, 60, 60]);
        addText(value as string, 10);
      });
      y += 4;
    }

    if (report.recomendacoes?.length) {
      addText('Recomendações', 13, true, [0, 100, 180]);
      report.recomendacoes.forEach((r, i) => {
        addText(`${i + 1}. ${r.area} — ${r.objetivo} [${r.prioridade}]`, 10, true);
        r.estrategias?.forEach(e => addText(`   • ${e}`, 9));
      });
      y += 4;
    }

    if (report.sugestoesAtividadesAEE?.length) {
      addText('Sugestões para AEE', 13, true);
      report.sugestoesAtividadesAEE.forEach(s => addText(`• ${s}`, 10));
      y += 4;
    }

    if (report.orientacoesEquipe) {
      addText('Orientações para Equipe', 13, true);
      addText(report.orientacoesEquipe, 10);
      y += 4;
    }

    if (report.conclusao) {
      addText('Conclusão', 13, true);
      addText(report.conclusao, 10);
    }

    // Disclaimer
    y += 10;
    addText('⚠️ Este relatório é gerado por IA e não substitui avaliação clínica profissional.', 8, false, [150, 100, 0]);

    doc.save(`relatorio-inventario-${childName?.replace(/\s+/g, '-') || 'aluno'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF exportado!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Relatório IA — Inventário de Habilidades
          </DialogTitle>
        </DialogHeader>

        {!report && !loading && (
          <div className="text-center py-12 space-y-4">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground/40" />
            <div>
              <h3 className="text-lg font-semibold">Gerar Relatório com IA</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A inteligência artificial analisará todas as respostas do inventário e gerará um relatório 
                clínico-pedagógico completo com recomendações personalizadas.
              </p>
            </div>
            <Button onClick={generateReport} size="lg" className="mt-4">
              <Brain className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Analisando inventário e gerando relatório...</p>
            <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        )}

        {report && !loading && (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              <BehavioralReportDisclaimer />

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={generateReport}>
                  <Brain className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
                <Button variant="outline" size="sm" onClick={exportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>

              {/* Resumo Executivo */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resumo Executivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{report.resumoExecutivo}</p>
                </CardContent>
              </Card>

              {/* Pontos Fortes & Áreas de Atenção */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Pontos Fortes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {report.pontosFortes?.map((p, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Áreas de Atenção
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {report.areasAtencao?.map((a, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">!</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Análise Detalhada */}
              {report.analiseDetalhada && Object.keys(report.analiseDetalhada).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Análise Detalhada por Área
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(report.analiseDetalhada).map(([key, value]) => (
                        <AccordionItem key={key} value={key}>
                          <AccordionTrigger className="text-sm">
                            {areaLabels[key] || key}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">{value as string}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {/* Recomendações */}
              {report.recomendacoes?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Recomendações de Intervenção
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {report.recomendacoes.map((rec, i) => (
                      <div key={i} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{rec.area}</span>
                          <Badge variant={priorityColor[rec.prioridade] as any || 'secondary'}>
                            {rec.prioridade}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.objetivo}</p>
                        {rec.estrategias?.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1 ml-3">
                            {rec.estrategias.map((e, j) => (
                              <li key={j}>• {e}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Sugestões AEE */}
              {report.sugestoesAtividadesAEE?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Sugestões para AEE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {report.sugestoesAtividadesAEE.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Orientações e Conclusão */}
              {report.orientacoesEquipe && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Orientações para Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{report.orientacoesEquipe}</p>
                  </CardContent>
                </Card>
              )}

              {report.conclusao && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{report.conclusao}</p>
                  </CardContent>
                </Card>
              )}

              {generatedAt && (
                <p className="text-xs text-muted-foreground text-center">
                  Relatório gerado em {new Date(generatedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
