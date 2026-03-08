/**
 * Quick Activities — 3-minute school session selector
 * 
 * Shows a grid of short cognitive activities suitable for classroom use.
 * No clinical language — purely educational framing.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles } from 'lucide-react';
import { QUICK_ACTIVITIES, EDUCATIONAL_LABELS } from '../constants';

interface QuickActivitiesProps {
  /** Optional: highlight a specific domain */
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
        <h3 className="font-semibold text-foreground">Atividades Rápidas</h3>
        <Badge variant="outline" className="text-[10px]">3 min</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {activities.map((activity) => (
          <Link key={activity.id} to={activity.path}>
            <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full">
              <CardContent className="p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <span className="text-2xl" role="img" aria-label={activity.name}>
                    {activity.icon}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px]">{Math.round(activity.durationSeconds / 60)} min</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {activity.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {activity.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[9px] w-fit mt-auto">
                  {EDUCATIONAL_LABELS[activity.domain as keyof typeof EDUCATIONAL_LABELS] || activity.domain}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
