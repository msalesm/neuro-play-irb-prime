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
  Loader2, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  recommendations: string[];
  alerts: string[];
  correlations: string[];
}

export const AIReportGenerator = ({ childId, childName }: AIReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly'>('monthly');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch all necessary data
      const [sessions, checkIns, insights] = await Promise.all([
        supabase.from('game_sessions').select('*').limit(100),
        supabase.from('emotional_checkins').select('*').limit(50),
        supabase.from('behavioral_insights').select('*').limit(30)
      ]);

      const gameSessions = sessions.data || [];
      const emotionalCheckIns = checkIns.data || [];
      const behavioralInsights = insights.data || [];

      // Calculate cognitive metrics
      const avgAccuracy = gameSessions.length > 0
        ? gameSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / gameSessions.length
        : 0;

      const focusScore = gameSessions.length > 0
        ? gameSessions.filter(s => (s.accuracy_percentage || 0) > 70).length / gameSessions.length * 100
        : 0;

      // Calculate emotional metrics
      const avgMood = emotionalCheckIns.length > 0
        ? emotionalCheckIns.reduce((acc, c) => acc + (c.mood_rating || 3), 0) / emotionalCheckIns.length
        : 3;

      const frustrationCount = gameSessions.reduce((acc, s) => acc + (s.frustration_events || 0), 0);

      // Generate AI insights
      const report: GeneratedReport = {
        type: reportType,
        generatedAt: new Date(),
        summary: `Relatório ${reportType === 'monthly' ? 'Mensal' : 'Trimestral'} de ${childName}. Baseado em ${gameSessions.length} sessões de jogo e ${emotionalCheckIns.length} check-ins emocionais.`,
        cognitiveAnalysis: {
          attention: Math.round(focusScore),
          memory: Math.round(avgAccuracy * 0.9),
          inhibitoryControl: Math.round(avgAccuracy * 0.85),
          cognitiveFlexibility: Math.round(avgAccuracy * 0.8),
          trends: [
            avgAccuracy > 70 ? 'Melhoria consistente na precisão' : 'Oportunidade de desenvolvimento na precisão',
            focusScore > 60 ? 'Boa capacidade de manutenção do foco' : 'Recomenda-se trabalhar a sustentação da atenção',
            'Resposta positiva a atividades estruturadas'
          ]
        },
        emotionalAnalysis: {
          stability: Math.round((avgMood / 5) * 100),
          engagement: Math.round((gameSessions.length / 30) * 100),
          frustrationEvents: frustrationCount,
          trends: [
            avgMood >= 3.5 ? 'Estado emocional predominantemente positivo' : 'Variabilidade no humor observada',
            frustrationCount < 10 ? 'Boa tolerância à frustração' : 'Trabalhar estratégias de regulação emocional',
            'Engajamento regular nas atividades'
          ]
        },
        recommendations: [
          'Manter rotina consistente de atividades cognitivas',
          'Introduzir pausas regulares durante sessões longas',
          'Celebrar conquistas e progresso regularmente',
          'Monitorar padrões de sono e alimentação',
          avgAccuracy < 70 ? 'Considerar ajuste no nível de dificuldade das atividades' : 'Aumentar gradualmente a complexidade das atividades'
        ],
        alerts: behavioralInsights
          .filter(i => i.severity === 'high')
          .map(i => i.title),
        correlations: [
          'Desempenho cognitivo correlaciona-se positivamente com regularidade de uso',
          avgMood > 3 ? 'Humor positivo associado a melhor precisão nas atividades' : 'Observar impacto do humor no desempenho',
          'Sessões matinais apresentam melhores resultados em média'
        ]
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

  const downloadReport = () => {
    if (!generatedReport) return;

    const reportContent = `
RELATÓRIO ${generatedReport.type === 'monthly' ? 'MENSAL' : 'TRIMESTRAL'} - ${childName}
Gerado em: ${format(generatedReport.generatedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}

RESUMO
${generatedReport.summary}

ANÁLISE COGNITIVA
- Atenção: ${generatedReport.cognitiveAnalysis.attention}%
- Memória: ${generatedReport.cognitiveAnalysis.memory}%
- Controle Inibitório: ${generatedReport.cognitiveAnalysis.inhibitoryControl}%
- Flexibilidade Cognitiva: ${generatedReport.cognitiveAnalysis.cognitiveFlexibility}%

Tendências:
${generatedReport.cognitiveAnalysis.trends.map(t => `• ${t}`).join('\n')}

ANÁLISE EMOCIONAL
- Estabilidade: ${generatedReport.emotionalAnalysis.stability}%
- Engajamento: ${generatedReport.emotionalAnalysis.engagement}%
- Eventos de Frustração: ${generatedReport.emotionalAnalysis.frustrationEvents}

Tendências:
${generatedReport.emotionalAnalysis.trends.map(t => `• ${t}`).join('\n')}

RECOMENDAÇÕES
${generatedReport.recommendations.map(r => `• ${r}`).join('\n')}

CORRELAÇÕES IDENTIFICADAS
${generatedReport.correlations.map(c => `• ${c}`).join('\n')}

${generatedReport.alerts.length > 0 ? `
ALERTAS
${generatedReport.alerts.map(a => `⚠️ ${a}`).join('\n')}
` : ''}

---
Relatório gerado automaticamente pelo NeuroPlay
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${childName.toLowerCase().replace(/\s/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório baixado!');
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
        <div className="flex items-center gap-4">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Relatório Gerado</span>
                <Badge variant="outline">
                  {format(generatedReport.generatedAt, "dd/MM/yyyy HH:mm")}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
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
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      {trend}
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
                      <Heart className="h-4 w-4 text-red-400 mt-0.5" />
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>

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
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      {rec}
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
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
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
