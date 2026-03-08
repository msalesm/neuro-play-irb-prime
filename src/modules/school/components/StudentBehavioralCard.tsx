/**
 * Student Behavioral Card — Educational Indicators
 * 
 * Shows a student's behavioral indicators using educational language.
 * Domains: Foco, Persistência, Autorregulação, Adaptabilidade.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, User } from 'lucide-react';
import { EDUCATIONAL_LABELS } from '../constants';

interface StudentIndicator {
  domain: string;
  score: number; // 0-100
  trend: 'up' | 'stable' | 'down';
}

interface StudentBehavioralCardProps {
  studentName: string;
  avatarUrl?: string;
  indicators: StudentIndicator[];
  lastActiveAt?: string;
  onClick?: () => void;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-amber-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const getScoreColor = (score: number) => {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-sky-500';
  if (score >= 25) return 'bg-amber-500';
  return 'bg-rose-400';
};

const getScoreLabel = (score: number) => {
  if (score >= 75) return EDUCATIONAL_LABELS.adequate;
  if (score >= 50) return EDUCATIONAL_LABELS.monitoring;
  if (score >= 25) return EDUCATIONAL_LABELS.needsSupport;
  return EDUCATIONAL_LABELS.intervention;
};

export function StudentBehavioralCard({
  studentName,
  avatarUrl,
  indicators,
  lastActiveAt,
  onClick,
}: StudentBehavioralCardProps) {
  const avgScore = indicators.length > 0
    ? Math.round(indicators.reduce((sum, i) => sum + i.score, 0) / indicators.length)
    : 0;

  return (
    <Card 
      className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{studentName}</p>
              {lastActiveAt && (
                <p className="text-[10px] text-muted-foreground">
                  Último acesso: {new Date(lastActiveAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-[10px] ${
              avgScore >= 75 ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400' :
              avgScore >= 50 ? 'border-sky-300 text-sky-700 dark:text-sky-400' :
              'border-amber-300 text-amber-700 dark:text-amber-400'
            }`}
          >
            {getScoreLabel(avgScore)}
          </Badge>
        </div>

        {/* Indicators */}
        <div className="space-y-2">
          {indicators.slice(0, 4).map((indicator) => (
            <div key={indicator.domain} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-24 truncate">
                {EDUCATIONAL_LABELS[indicator.domain as keyof typeof EDUCATIONAL_LABELS] || indicator.domain}
              </span>
              <div className="flex-1">
                <Progress 
                  value={indicator.score} 
                  className="h-1.5"
                />
              </div>
              <TrendIcon trend={indicator.trend} />
              <span className="text-[11px] font-medium w-8 text-right">{indicator.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
