/**
 * Quick Activities — teacher view showing what each activity encourages
 * 
 * No play links — purely informational for pedagogical guidance.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Eye, Heart, RefreshCw, Crosshair, HandHeart } from 'lucide-react';
import { QUICK_ACTIVITIES, EDUCATIONAL_LABELS } from '../constants';

const DOMAIN_BENEFITS: Record<string, { skills: string[]; icon: React.ReactNode; tip: string }> = {
  attention: {
    skills: ['Concentração', 'Tempo de resposta', 'Foco sustentado'],
    icon: <Crosshair className="h-4 w-4 text-primary" />,
    tip: 'Ideal para alunos que se distraem facilmente ou demoram a iniciar tarefas.',
  },
  memory: {
    skills: ['Memória de trabalho', 'Sequenciamento', 'Retenção visual'],
    icon: <Brain className="h-4 w-4 text-secondary" />,
    tip: 'Ajuda alunos com dificuldade em reter instruções ou sequências.',
  },
  flexibility: {
    skills: ['Adaptabilidade', 'Raciocínio lógico', 'Mudança de estratégia'],
    icon: <RefreshCw className="h-4 w-4 text-accent" />,
    tip: 'Indicado para alunos que têm rigidez ou dificuldade com mudanças.',
  },
  coordination: {
    skills: ['Coordenação visuomotora', 'Percepção espacial', 'Agilidade'],
    icon: <Eye className="h-4 w-4 text-info" />,
    tip: 'Recomendado para alunos com dificuldade motora fina ou espacial.',
  },
  empathy: {
    skills: ['Empatia', 'Leitura social', 'Convivência em grupo'],
    icon: <Heart className="h-4 w-4 text-destructive" />,
    tip: 'Para trabalhar habilidades sociais e compreensão emocional.',
  },
  persistence: {
    skills: ['Persistência', 'Tolerância à frustração', 'Esforço contínuo'],
    icon: <HandHeart className="h-4 w-4 text-warning" />,
    tip: 'Para alunos que desistem rápido ou evitam desafios.',
  },
};

interface QuickActivitiesProps {
  recommendedDomain?: string;
  maxItems?: number;
}

export function QuickActivities({ recommendedDomain, maxItems = 6 }: QuickActivitiesProps) {
  const activities = recommendedDomain
    ? [...QUICK_ACTIVITIES].sort((a, b) => 
        a.domain === recommendedDomain ? -1 : b.domain === recommendedDomain ? 1 : 0
      ).slice(0, maxItems)
    : QUICK_ACTIVITIES.slice(0, maxItems);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">O que cada atividade incentiva</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activities.map((activity) => {
          const benefits = DOMAIN_BENEFITS[activity.domain] || DOMAIN_BENEFITS.attention;
          return (
            <Card key={activity.id} className="border border-border/60 h-full">
              <CardContent className="p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" role="img" aria-label={activity.name}>
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{activity.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{activity.description}</p>
                  </div>
                  {benefits.icon}
                </div>

                <div className="flex flex-wrap gap-1">
                  {benefits.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[10px] font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground/80 italic leading-snug border-l-2 border-primary/30 pl-2">
                  💡 {benefits.tip}
                </p>

                <Badge variant="outline" className="text-[9px] w-fit mt-auto">
                  {EDUCATIONAL_LABELS[activity.domain as keyof typeof EDUCATIONAL_LABELS] || activity.domain}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}