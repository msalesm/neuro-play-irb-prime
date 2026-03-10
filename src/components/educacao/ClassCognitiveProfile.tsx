import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Brain, BookOpen, Puzzle, AlertTriangle, Users, CheckCircle2, Scan } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateClassNCI, getNCIColor, getNCILabel } from '@/modules/cognitive-index';

interface ClassCognitiveProfileProps {
  classId: string;
  className?: string;
  studentCount: number;
}

const DOMAINS = [
  { key: 'attention', dbKey: 'attention_score', label: 'Atenção', icon: Eye, color: 'text-chart-1', bgColor: 'bg-chart-1' },
  { key: 'memory', dbKey: 'memory_score', label: 'Memória', icon: Brain, color: 'text-chart-2', bgColor: 'bg-chart-2' },
  { key: 'language', dbKey: 'language_score', label: 'Linguagem', icon: BookOpen, color: 'text-chart-3', bgColor: 'bg-chart-3' },
  { key: 'executive', dbKey: 'executive_function_score', label: 'Função Executiva', icon: Puzzle, color: 'text-chart-4', bgColor: 'bg-chart-4' },
];

function getScoreColor(score: number) {
  if (score >= 75) return 'text-chart-3';
  if (score >= 50) return 'text-chart-4';
  return 'text-destructive';
}

function getScoreLabel(score: number) {
  if (score >= 75) return 'Adequado';
  if (score >= 50) return 'Atenção';
  return 'Intervenção';
}

export function ClassCognitiveProfile({ classId, className, studentCount }: ClassCognitiveProfileProps) {
  // Get latest completed scan session for this class
  const { data: latestScan, isLoading } = useQuery({
    queryKey: ['latest-scan-profile', classId],
    queryFn: async () => {
      const { data: session } = await supabase
        .from('classroom_scan_sessions')
        .select('*')
        .eq('class_id', classId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!session) return null;

      // Get individual results
      const { data: results } = await supabase
        .from('scan_student_results')
        .select('*')
        .eq('session_id', session.id)
        .eq('status', 'completed');

      return { session, results: results || [] };
    },
    enabled: !!classId,
  });

  // Get all completed scans count
  const { data: scanCount = 0 } = useQuery({
    queryKey: ['scan-count', classId],
    queryFn: async () => {
      const { count } = await supabase
        .from('classroom_scan_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('status', 'completed');
      return count || 0;
    },
    enabled: !!classId,
  });

  const profile = useMemo(() => {
    if (!latestScan?.results?.length) return null;
    const r = latestScan.results;
    const n = r.length;
    
    const avg = (key: string) => Math.round(r.reduce((s: number, x: any) => s + (Number(x[key]) || 0), 0) / n);
    
    const risks = {
      reading: r.filter((x: any) => {
        const flags = x.risk_flags as any[];
        return Array.isArray(flags) && flags.some((f: any) => f.type === 'reading');
      }).length,
      attention: r.filter((x: any) => {
        const flags = x.risk_flags as any[];
        return Array.isArray(flags) && flags.some((f: any) => f.type === 'attention');
      }).length,
      social: r.filter((x: any) => {
        const flags = x.risk_flags as any[];
        return Array.isArray(flags) && flags.some((f: any) => f.type === 'social');
      }).length,
    };

    return {
      attention: avg('attention_score'),
      memory: avg('memory_score'),
      language: avg('language_score'),
      executive: avg('executive_function_score'),
      assessed: n,
      risks,
      date: latestScan.session.completed_at,
    };
  }, [latestScan]);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-border border-dashed">
        <CardContent className="p-6 text-center">
          <Scan className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Nenhuma triagem realizada ainda</p>
          <p className="text-xs text-muted-foreground mt-1">
            Use a aba "Triagem" para avaliar a turma
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalRisks = profile.risks.reading + profile.risks.attention + profile.risks.social;
  const screeningCoverage = studentCount > 0 ? Math.round((profile.assessed / studentCount) * 100) : 0;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Perfil Cognitivo da Turma
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {scanCount} triagem(ns)
            </Badge>
            <Badge variant="outline" className="text-xs">
              {new Date(profile.date).toLocaleDateString('pt-BR')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage */}
        <div className="flex items-center gap-3 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Cobertura:</span>
          <span className="font-medium">{profile.assessed}/{studentCount} alunos ({screeningCoverage}%)</span>
        </div>

        {/* Domain Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DOMAINS.map(domain => {
            const score = profile[domain.key as keyof typeof profile] as number;
            const Icon = domain.icon;
            return (
              <div key={domain.key} className="rounded-xl bg-muted/50 p-3 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-1 ${domain.color}`} />
                <p className={`text-xl font-bold ${getScoreColor(score)}`}>{score}</p>
                <p className="text-[10px] text-muted-foreground">{domain.label}</p>
                <div className="mt-1.5">
                  <Progress 
                    value={score} 
                    className="h-1.5" 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Alerts */}
        {totalRisks > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.risks.reading > 0 && (
              <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {profile.risks.reading} risco leitura
              </Badge>
            )}
            {profile.risks.attention > 0 && (
              <Badge variant="outline" className="text-chart-4 border-chart-4/30 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {profile.risks.attention} risco atenção
              </Badge>
            )}
            {profile.risks.social > 0 && (
              <Badge variant="outline" className="text-chart-2 border-chart-2/30 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {profile.risks.social} risco social
              </Badge>
            )}
          </div>
        )}

        {totalRisks === 0 && (
          <div className="flex items-center gap-2 text-chart-3 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Nenhum alerta de risco identificado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
