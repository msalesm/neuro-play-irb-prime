import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type NCIResult, getNCIColor, getNCILabel, NCI_BANDS, getBandInfo } from '@/modules/cognitive-index';

interface NCIDisplayProps {
  nci: NCIResult | null;
  title?: string;
  compact?: boolean;
  showDomains?: boolean;
}

const DOMAIN_LABELS = [
  { key: 'attention', label: 'Atenção', emoji: '🎯' },
  { key: 'memory', label: 'Memória', emoji: '🧠' },
  { key: 'language', label: 'Linguagem', emoji: '📖' },
  { key: 'executiveFunction', label: 'Função Executiva', emoji: '🧩' },
  { key: 'socialCognition', label: 'Cognição Social', emoji: '🤝' },
];

export function NCIDisplay({ nci, title = 'NeuroPlay Cognitive Index', compact = false, showDomains = true }: NCIDisplayProps) {
  if (!nci) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">NCI não disponível</p>
          <p className="text-xs text-muted-foreground mt-1">Realize uma triagem para gerar o índice</p>
        </CardContent>
      </Card>
    );
  }

  const bandInfo = getBandInfo(nci.band);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
        <div className={`text-2xl font-bold ${getNCIColor(nci.score)}`}>
          {nci.score}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">NCI</p>
          <Badge variant="outline" className={`text-[10px] ${getNCIColor(nci.score)}`}>
            {getNCILabel(nci.score)}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          {title}
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                O NCI é um índice proprietário que combina 5 domínios cognitivos em um score de 0 a 100, 
                permitindo acompanhar o neurodesenvolvimento ao longo do tempo.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`text-4xl font-bold ${getNCIColor(nci.score)}`}>
              {nci.score}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">/ 100</p>
          </div>
          <div className="flex-1">
            <Badge variant="outline" className={`${getNCIColor(nci.score)} mb-1`}>
              {bandInfo.labelPt}
            </Badge>
            <p className="text-xs text-muted-foreground">{bandInfo.description}</p>
          </div>
        </div>

        {/* Score Band Scale */}
        <div className="space-y-1">
          <div className="flex h-2 rounded-full overflow-hidden">
            {NCI_BANDS.slice().reverse().map((band, i) => (
              <div
                key={band.key}
                className={`flex-1 ${
                  i === 0 ? 'bg-destructive/60' :
                  i === 1 ? 'bg-destructive/40' :
                  i === 2 ? 'bg-chart-4/50' :
                  i === 3 ? 'bg-primary/40' :
                  'bg-chart-3/50'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>0</span>
            <span>30</span>
            <span>50</span>
            <span>70</span>
            <span>85</span>
            <span>100</span>
          </div>
        </div>

        {/* Domain Breakdown */}
        {showDomains && (
          <div className="space-y-2.5">
            {DOMAIN_LABELS.map(d => {
              const score = nci.domains[d.key as keyof typeof nci.domains] ?? 0;
              return (
                <div key={d.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span>{d.emoji}</span>
                      <span className="text-muted-foreground">{d.label}</span>
                    </span>
                    <span className={`font-medium ${getNCIColor(score)}`}>{score}</span>
                  </div>
                  <Progress value={score} className="h-1.5" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
