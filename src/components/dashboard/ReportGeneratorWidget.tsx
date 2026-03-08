/**
 * ReportGeneratorWidget
 * 
 * Compact report generator widget for dashboards.
 * Uses the core report-engine via useReportEngine hook.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, Sparkles } from 'lucide-react';
import { useReportEngine } from '@/hooks/useReportEngine';
import type { ReportType } from '@/core/report-engine';
import { format, subMonths, subDays } from 'date-fns';

interface ReportGeneratorWidgetProps {
  childId: string;
  childName: string;
}

const reportTypeLabels: Record<ReportType, string> = {
  cognitive: 'Cognitivo',
  aba: 'ABA',
  school: 'Pedagógico',
  evolution: 'Evolução',
  family: 'Familiar',
};

export function ReportGeneratorWidget({ childId, childName }: ReportGeneratorWidgetProps) {
  const { report, generating, availableTypes, generate, hasProfile, profileLoading } = useReportEngine(childId, childName);
  const [selectedType, setSelectedType] = useState<ReportType>(availableTypes[0] || 'cognitive');

  const handleGenerate = () => {
    const end = new Date().toISOString();
    const start = subMonths(new Date(), 1).toISOString();
    generate(selectedType, start, end);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Relatórios Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ReportType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map(type => (
                <SelectItem key={type} value={type} className="text-xs">
                  {reportTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            size="sm" 
            className="h-8 text-xs" 
            onClick={handleGenerate} 
            disabled={generating || profileLoading || !hasProfile}
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
          </Button>
        </div>

        {!hasProfile && !profileLoading && (
          <p className="text-xs text-muted-foreground">Complete atividades para gerar relatórios.</p>
        )}

        {report && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="text-xs font-medium">{report.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{report.summary}</p>
            {report.alertFlags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {report.alertFlags.slice(0, 2).map((f, i) => (
                  <Badge key={i} variant="destructive" className="text-[10px]">{f}</Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {report.recommendations.slice(0, 2).map((r, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
