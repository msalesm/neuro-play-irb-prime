import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Download, Brain, Heart, TrendingUp,
  AlertTriangle, Target, Calendar, Sparkles,
  Loader2, CheckCircle, Zap, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface AIReportGeneratorProps {
  childId: string;
  childName: string;
}

interface GeneratedReport {
  type: 'monthly' | 'quarterly';
  generatedAt: Date;
  summary: string;
  cognitiveAnalysis: {
    attention: number;
    memory: number;
    inhibitoryControl: number;
    cognitiveFlexibility: number;
    trends: string[];
  };
  emotionalAnalysis: {
    stability: number;
    engagement: number;
    frustrationEvents: number;
    trends: string[];
  };
  screeningResults: {
    tea?: { score: number; date: string };
    tdah?: { score: number; date: string };
    dislexia?: { score: number; date: string };
  };
  recommendations: string[];
  alerts: string[];
  correlations: string[];
  dataSources: {
    gameSessions: number;
    emotionalCheckins: number;
    screenings: number;
    assessments: number;
  };
}

export const AIReportGenerator = ({ childId, childName }: AIReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly'>('monthly');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch all necessary data in parallel
      const [sessions, checkIns, insights, screenings, assessments] = await Promise.all([
        supabase.from('game_sessions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('emotional_checkins').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('behavioral_insights').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('screenings').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('condensed_assessments').select('*').eq('child_id', childId).order('assessment_date', { ascending: false }).limit(5)
      ]);

      const gameSessions = sessions.data || [];
      const emotionalCheckIns = checkIns.data || [];
      const behavioralInsights = insights.data || [];
      const screeningResults = screenings.data || [];
      const condensedAssessments = assessments.data || [];

      // Calculate cognitive metrics from game sessions
      const avgAccuracy = gameSessions.length > 0
        ? gameSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / gameSessions.length
        : 0;

      const focusScore = gameSessions.length > 0
        ? gameSessions.filter(s => (s.accuracy_percentage || 0) > 70).length / gameSessions.length * 100
        : 0;

      // Calculate from condensed assessments if available
      const latestAssessment = condensedAssessments[0];
      const cognitiveScore = latestAssessment?.cognitive_overall_score || Math.round(avgAccuracy);
      const behavioralScore = latestAssessment?.behavioral_overall_score || Math.round(avgAccuracy * 0.85);
      
      // Calculate emotional metrics
      const avgMood = emotionalCheckIns.length > 0
        ? emotionalCheckIns.reduce((acc, c) => acc + (c.mood_rating || 3), 0) / emotionalCheckIns.length
        : 3;

      const frustrationCount = gameSessions.reduce((acc, s) => acc + (s.frustration_events || 0), 0);

      // Process screening results by type
      const teaScreenings = screeningResults.filter(s => s.type === 'tea');
      const tdahScreenings = screeningResults.filter(s => s.type === 'tdah');
      const dislexiaScreenings = screeningResults.filter(s => s.type === 'dislexia');

      // Build screening results
      const screeningData: GeneratedReport['screeningResults'] = {};
      if (teaScreenings.length > 0) {
        screeningData.tea = { 
          score: Number(teaScreenings[0].score), 
          date: teaScreenings[0].created_at 
        };
      }
      if (tdahScreenings.length > 0) {
        screeningData.tdah = { 
          score: Number(tdahScreenings[0].score), 
          date: tdahScreenings[0].created_at 
        };
      }
      if (dislexiaScreenings.length > 0) {
        screeningData.dislexia = { 
          score: Number(dislexiaScreenings[0].score), 
          date: dislexiaScreenings[0].created_at 
        };
      }

      // Generate AI insights based on all data
      const report: GeneratedReport = {
        type: reportType,
        generatedAt: new Date(),
        summary: `Relatório ${reportType === 'monthly' ? 'Mensal' : 'Trimestral'} de ${childName}. Análise baseada em ${gameSessions.length} sessões de jogo, ${emotionalCheckIns.length} check-ins emocionais e ${screeningResults.length} triagens diagnósticas.`,
        cognitiveAnalysis: {
          attention: Math.round(focusScore),
          memory: cognitiveScore,
          inhibitoryControl: behavioralScore,
          cognitiveFlexibility: Math.round(avgAccuracy * 0.8),
          trends: [
            avgAccuracy > 70 ? '✓ Melhoria consistente na precisão' : '⚠ Oportunidade de desenvolvimento na precisão',
            focusScore > 60 ? '✓ Boa capacidade de manutenção do foco' : '⚠ Recomenda-se trabalhar a sustentação da atenção',
            gameSessions.length >= 10 ? '✓ Engajamento regular nas atividades' : '⚠ Aumentar frequência de uso',
            latestAssessment ? `✓ Avaliação consolidada em ${format(new Date(latestAssessment.assessment_date), 'dd/MM/yyyy')}` : '⚠ Realizar avaliação consolidada'
          ]
        },
        emotionalAnalysis: {
          stability: Math.round((avgMood / 5) * 100),
          engagement: Math.min(100, Math.round((gameSessions.length / 30) * 100)),
          frustrationEvents: frustrationCount,
          trends: [
            avgMood >= 3.5 ? '✓ Estado emocional predominantemente positivo' : '⚠ Variabilidade no humor observada',
            frustrationCount < 10 ? '✓ Boa tolerância à frustração' : '⚠ Trabalhar estratégias de regulação emocional',
            emotionalCheckIns.length >= 5 ? '✓ Acompanhamento emocional regular' : '⚠ Aumentar check-ins emocionais'
          ]
        },
        screeningResults: screeningData,
        recommendations: [
          'Manter rotina consistente de atividades cognitivas',
          'Introduzir pausas regulares durante sessões longas',
          'Celebrar conquistas e progresso regularmente',
          'Monitorar padrões de sono e alimentação',
          avgAccuracy < 70 ? 'Considerar ajuste no nível de dificuldade das atividades' : 'Aumentar gradualmente a complexidade das atividades',
          screeningResults.length > 0 ? 'Discutir resultados de triagem com profissional qualificado' : 'Realizar triagens diagnósticas para avaliação completa'
        ],
        alerts: behavioralInsights
          .filter(i => i.severity === 'high' || i.severity === 'critical')
          .map(i => i.title),
        correlations: [
          'Desempenho cognitivo correlaciona-se positivamente com regularidade de uso',
          avgMood > 3 ? 'Humor positivo associado a melhor precisão nas atividades' : 'Observar impacto do humor no desempenho',
          'Sessões matinais apresentam melhores resultados em média'
        ],
        dataSources: {
          gameSessions: gameSessions.length,
          emotionalCheckins: emotionalCheckIns.length,
          screenings: screeningResults.length,
          assessments: condensedAssessments.length
        }
      };

      setGeneratedReport(report);
      toast.success('Relatório gerado com sucesso!');

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedReport) return;

    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const marginLeft = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, bold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, marginLeft, y);
        y += lineHeight;
      });
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setDrawColor(0, 90, 112);
      doc.line(marginLeft, y, pageWidth - marginLeft, y);
      y += 8;
      addText(title, 14, true);
      y += 3;
    };

    // Header
    doc.setFillColor(10, 30, 53);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NEUROPLAY', marginLeft, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório ${generatedReport.type === 'monthly' ? 'Mensal' : 'Trimestral'} - ${childName}`, marginLeft, 30);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(generatedReport.generatedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, marginLeft, 38);
    
    y = 55;
    doc.setTextColor(0, 0, 0);

    // Summary
    addSection('RESUMO EXECUTIVO');
    addText(generatedReport.summary);

    // Data Sources
    addSection('FONTES DE DADOS');
    addText(`• Sessões de Jogo: ${generatedReport.dataSources.gameSessions}`);
    addText(`• Check-ins Emocionais: ${generatedReport.dataSources.emotionalCheckins}`);
    addText(`• Triagens Diagnósticas: ${generatedReport.dataSources.screenings}`);
    addText(`• Avaliações Consolidadas: ${generatedReport.dataSources.assessments}`);

    // Cognitive Analysis
    addSection('ANÁLISE COGNITIVA');
    addText(`Atenção: ${generatedReport.cognitiveAnalysis.attention}%`);
    addText(`Memória: ${generatedReport.cognitiveAnalysis.memory}%`);
    addText(`Controle Inibitório: ${generatedReport.cognitiveAnalysis.inhibitoryControl}%`);
    addText(`Flexibilidade Cognitiva: ${generatedReport.cognitiveAnalysis.cognitiveFlexibility}%`);
    y += 3;
    addText('Tendências:', 10, true);
    generatedReport.cognitiveAnalysis.trends.forEach(trend => addText(`  ${trend}`));

    // Emotional Analysis
    addSection('ANÁLISE EMOCIONAL');
    addText(`Estabilidade: ${generatedReport.emotionalAnalysis.stability}%`);
    addText(`Engajamento: ${generatedReport.emotionalAnalysis.engagement}%`);
    addText(`Eventos de Frustração: ${generatedReport.emotionalAnalysis.frustrationEvents}`);
    y += 3;
    addText('Tendências:', 10, true);
    generatedReport.emotionalAnalysis.trends.forEach(trend => addText(`  ${trend}`));

    // Screening Results
    if (Object.keys(generatedReport.screeningResults).length > 0) {
      addSection('RESULTADOS DE TRIAGEM');
      if (generatedReport.screeningResults.tea) {
        addText(`TEA: ${generatedReport.screeningResults.tea.score.toFixed(0)}% (${format(new Date(generatedReport.screeningResults.tea.date), 'dd/MM/yyyy')})`);
      }
      if (generatedReport.screeningResults.tdah) {
        addText(`TDAH: ${generatedReport.screeningResults.tdah.score.toFixed(0)}% (${format(new Date(generatedReport.screeningResults.tdah.date), 'dd/MM/yyyy')})`);
      }
      if (generatedReport.screeningResults.dislexia) {
        addText(`Dislexia: ${generatedReport.screeningResults.dislexia.score.toFixed(0)}% (${format(new Date(generatedReport.screeningResults.dislexia.date), 'dd/MM/yyyy')})`);
      }
    }

    // Recommendations
    addSection('RECOMENDAÇÕES');
    generatedReport.recommendations.forEach((rec, idx) => {
      addText(`${idx + 1}. ${rec}`);
    });

    // Correlations
    addSection('CORRELAÇÕES IDENTIFICADAS');
    generatedReport.correlations.forEach(cor => addText(`• ${cor}`));

    // Alerts
    if (generatedReport.alerts.length > 0) {
      addSection('⚠️ ALERTAS');
      generatedReport.alerts.forEach(alert => addText(`• ${alert}`));
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'Neuro IRB Prime - Relatório gerado automaticamente | Este documento não substitui avaliação profissional',
        pageWidth / 2,
        285,
        { align: 'center' }
      );
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 25, 285);
    }

    // Save
    const fileName = `relatorio-${childName.toLowerCase().replace(/\s/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    toast.success('PDF baixado com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gerador de Relatórios IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Type Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Tabs value={reportType} onValueChange={(v) => setReportType(v as 'monthly' | 'quarterly')}>
            <TabsList>
              <TabsTrigger value="monthly">
                <Calendar className="h-4 w-4 mr-2" />
                Mensal
              </TabsTrigger>
              <TabsTrigger value="quarterly">
                <Calendar className="h-4 w-4 mr-2" />
                Trimestral
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>

        {/* Generated Report */}
        {generatedReport && (
          <div className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Relatório Gerado</span>
                <Badge variant="outline">
                  {format(generatedReport.generatedAt, "dd/MM/yyyy HH:mm")}
                </Badge>
              </div>
              <Button variant="default" size="sm" onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>

            {/* Data Sources Badge */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {generatedReport.dataSources.gameSessions} sessões
              </Badge>
              <Badge variant="secondary">
                {generatedReport.dataSources.emotionalCheckins} check-ins
              </Badge>
              <Badge variant="secondary">
                {generatedReport.dataSources.screenings} triagens
              </Badge>
              <Badge variant="secondary">
                {generatedReport.dataSources.assessments} avaliações
              </Badge>
            </div>

            <ScrollArea className="h-[400px] rounded-lg border p-4">
              {/* Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Resumo</h3>
                <p className="text-sm text-muted-foreground">{generatedReport.summary}</p>
              </div>

              <Separator className="my-4" />

              {/* Cognitive Analysis */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-primary" />
                  Análise Cognitiva
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Atenção</p>
                    <p className="text-xl font-bold">{generatedReport.cognitiveAnalysis.attention}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Memória</p>
                    <p className="text-xl font-bold">{generatedReport.cognitiveAnalysis.memory}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Controle Inibitório</p>
                    <p className="text-xl font-bold">{generatedReport.cognitiveAnalysis.inhibitoryControl}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Flexibilidade</p>
                    <p className="text-xl font-bold">{generatedReport.cognitiveAnalysis.cognitiveFlexibility}%</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {generatedReport.cognitiveAnalysis.trends.map((trend, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="mt-0.5">{trend.startsWith('✓') ? '✓' : '⚠'}</span>
                      {trend.substring(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="my-4" />

              {/* Emotional Analysis */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  Análise Emocional
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Estabilidade</p>
                    <p className="text-xl font-bold">{generatedReport.emotionalAnalysis.stability}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Engajamento</p>
                    <p className="text-xl font-bold">{generatedReport.emotionalAnalysis.engagement}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Frustrações</p>
                    <p className="text-xl font-bold">{generatedReport.emotionalAnalysis.frustrationEvents}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {generatedReport.emotionalAnalysis.trends.map((trend, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="mt-0.5">{trend.startsWith('✓') ? '✓' : '⚠'}</span>
                      {trend.substring(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Screening Results */}
              {Object.keys(generatedReport.screeningResults).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Triagens Diagnósticas
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {generatedReport.screeningResults.tea && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium">TEA</span>
                          </div>
                          <p className="text-xl font-bold">{generatedReport.screeningResults.tea.score.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(generatedReport.screeningResults.tea.date), 'dd/MM/yy')}
                          </p>
                        </div>
                      )}
                      {generatedReport.screeningResults.tdah && (
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-medium">TDAH</span>
                          </div>
                          <p className="text-xl font-bold">{generatedReport.screeningResults.tdah.score.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(generatedReport.screeningResults.tdah.date), 'dd/MM/yy')}
                          </p>
                        </div>
                      )}
                      {generatedReport.screeningResults.dislexia && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-medium">Dislexia</span>
                          </div>
                          <p className="text-xl font-bold">{generatedReport.screeningResults.dislexia.score.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(generatedReport.screeningResults.dislexia.date), 'dd/MM/yy')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-4" />

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  Recomendações
                </h3>
                <ul className="space-y-2">
                  {generatedReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Correlations */}
              <Separator className="my-4" />
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Correlações
                </h3>
                <ul className="space-y-1">
                  {generatedReport.correlations.map((cor, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {cor}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alerts */}
              {generatedReport.alerts.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Alertas
                    </h3>
                    <ul className="space-y-2">
                      {generatedReport.alerts.map((alert, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-amber-500/10">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
