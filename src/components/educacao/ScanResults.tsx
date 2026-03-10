import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Brain, BookOpen, Puzzle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ScanResultsProps {
  session: any;
}

const DOMAINS = [
  { key: 'avg_attention', label: 'Atenção', icon: Eye, color: 'text-chart-1' },
  { key: 'avg_memory', label: 'Memória', icon: Brain, color: 'text-chart-2' },
  { key: 'avg_language', label: 'Linguagem', icon: BookOpen, color: 'text-chart-3' },
  { key: 'avg_executive', label: 'Função Executiva', icon: Puzzle, color: 'text-chart-4' },
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

function getRecommendations(results: any): string[] {
  const recs: string[] = [];
  if (results.avg_language < 60) {
    recs.push('Turma apresenta dificuldade em linguagem. Recomenda-se exercícios de consciência fonológica 10min/dia por 2 semanas.');
  }
  if (results.avg_attention < 60) {
    recs.push('Atenção abaixo da média. Incluir atividades de foco sustentado no início das aulas.');
  }
  if (results.avg_memory < 60) {
    recs.push('Memória de trabalho comprometida. Usar jogos de sequenciamento e repetição espaçada.');
  }
  if (results.avg_executive < 60) {
    recs.push('Função executiva baixa. Trabalhar organização de tarefas e flexibilidade cognitiva.');
  }
  if (recs.length === 0) {
    recs.push('Perfil cognitivo da turma dentro dos parâmetros esperados. Manter atividades de estimulação variadas.');
  }
  return recs;
}

export function ScanResults({ session }: ScanResultsProps) {
  const results = session.class_results as any;
  if (!results || !results.avg_attention) return null;

  const recommendations = getRecommendations(results);
  const hasRisks = (results.risk_reading || 0) + (results.risk_attention || 0) + (results.risk_social || 0) > 0;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resultado da Triagem
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {new Date(session.completed_at).toLocaleDateString('pt-BR')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {results.total_assessed} alunos avaliados
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Domain Scores */}
        <div className="grid grid-cols-2 gap-3">
          {DOMAINS.map(domain => {
            const score = results[domain.key] || 0;
            const Icon = domain.icon;
            return (
              <div key={domain.key} className="rounded-xl bg-muted/50 p-4 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-1 ${domain.color}`} />
                <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</p>
                <p className="text-xs text-muted-foreground">{domain.label}</p>
                <Badge variant="outline" className={`text-[10px] mt-1 ${getScoreColor(score)}`}>
                  {getScoreLabel(score)}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Risk Alerts */}
        {hasRisks && (
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Alertas Identificados
            </div>
            <div className="flex flex-wrap gap-2">
              {results.risk_reading > 0 && (
                <Badge variant="outline" className="text-destructive border-destructive/30">
                  📖 {results.risk_reading} aluno(s) risco leitura
                </Badge>
              )}
              {results.risk_attention > 0 && (
                <Badge variant="outline" className="text-chart-4 border-chart-4/30">
                  🎯 {results.risk_attention} aluno(s) risco atenção
                </Badge>
              )}
              {results.risk_social > 0 && (
                <Badge variant="outline" className="text-chart-2 border-chart-2/30">
                  🧑‍🤝‍🧑 {results.risk_social} aluno(s) risco cognição social
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            💡 Recomendações para a Turma
          </p>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
