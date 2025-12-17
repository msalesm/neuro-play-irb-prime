import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, Brain, Heart, Activity, Trophy,
  AlertTriangle, CheckCircle, Filter,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEvent {
  id: string;
  type: 'cognitive' | 'emotional' | 'routine' | 'intervention' | 'achievement' | 'screening';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    mood?: string;
    severity?: string;
  };
}

interface IntegratedTimelineProps {
  childId: string;
}

const eventTypeConfig = {
  cognitive: {
    icon: Brain,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Cognitivo'
  },
  emotional: {
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Emocional'
  },
  routine: {
    icon: Activity,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Rotina'
  },
  intervention: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Intervenção'
  },
  achievement: {
    icon: Trophy,
    color: 'text-[#c7923e]',
    bgColor: 'bg-[#c7923e]/10',
    label: 'Conquista'
  },
  screening: {
    icon: CheckCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Triagem'
  }
};

export const IntegratedTimeline = ({ childId }: IntegratedTimelineProps) => {
  const [filter, setFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['integrated-timeline', childId],
    queryFn: async (): Promise<TimelineEvent[]> => {
      const allEvents: TimelineEvent[] = [];

      // Fetch game sessions (cognitive events) for this child
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (sessions) {
        sessions.forEach(s => {
          allEvents.push({
            id: `session-${s.id}`,
            type: 'cognitive',
            title: 'Sessão de Jogo',
            description: `Precisão: ${s.accuracy_percentage?.toFixed(0) || 0}% | Dificuldade: ${s.difficulty_level || 1}`,
            timestamp: new Date(s.created_at || Date.now()),
            metadata: { score: s.accuracy_percentage || 0 }
          });
        });
      }

      // Fetch emotional check-ins for this child
      const { data: checkIns } = await supabase
        .from('emotional_checkins')
        .select('*')
        .eq('child_profile_id', childId)
        .order('scheduled_for', { ascending: false })
        .limit(20);

      if (checkIns) {
        checkIns.forEach(c => {
          const emotions = c.emotions_detected as string[] | null;
          allEvents.push({
            id: `checkin-${c.id}`,
            type: 'emotional',
            title: 'Check-in Emocional',
            description: `Humor: ${c.mood_rating}/5 | ${emotions?.join(', ') || 'Sem emoções detectadas'}`,
            timestamp: new Date(c.scheduled_for),
            metadata: { mood: emotions?.[0] }
          });
        });
      }

      // Fetch behavioral insights (interventions) for this child
      const { data: insights } = await supabase
        .from('behavioral_insights')
        .select('*')
        .eq('child_profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(15);

      if (insights) {
        insights.forEach(i => {
          allEvents.push({
            id: `insight-${i.id}`,
            type: 'intervention',
            title: i.title,
            description: i.description,
            timestamp: new Date(i.created_at || Date.now()),
            metadata: { severity: i.severity }
          });
        });
      }

      // Fetch achievements - get child's parent first
      const { data: childData } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', childId)
        .maybeSingle();

      if (childData?.parent_id) {
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', childData.parent_id)
          .order('unlocked_at', { ascending: false })
          .limit(10);

        if (achievements) {
          achievements.forEach(a => {
            const achievement = a.achievements as any;
            if (achievement) {
              allEvents.push({
                id: `achievement-${a.id}`,
                type: 'achievement',
                title: `Conquista: ${achievement.name}`,
                description: achievement.description,
                timestamp: new Date(a.unlocked_at || Date.now())
              });
            }
          });
        }
      }

      // Fetch screenings (diagnostic tests) for this child
      const { data: screenings } = await supabase
        .from('screenings')
        .select('*')
        .or(`child_id.eq.${childId},user_id.eq.${childId}`)
        .order('created_at', { ascending: false })
        .limit(15);

      if (screenings) {
        const screeningLabels: Record<string, string> = {
          'tea': 'TEA (Autismo)',
          'tdah': 'TDAH',
          'dislexia': 'Dislexia'
        };
        screenings.forEach(s => {
          allEvents.push({
            id: `screening-${s.id}`,
            type: 'screening',
            title: `Triagem: ${screeningLabels[s.type] || s.type}`,
            description: `Score: ${Number(s.score).toFixed(0)}%${s.recommended_action ? ` | ${s.recommended_action}` : ''}`,
            timestamp: new Date(s.created_at || Date.now()),
            metadata: { score: Number(s.score) }
          });
        });
      }

      // Sort by timestamp descending
      return allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    enabled: !!childId
  });

  const filteredEvents = filter 
    ? events?.filter(e => e.type === filter) 
    : events;

  const displayEvents = expanded 
    ? filteredEvents 
    : filteredEvents?.slice(0, 10);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Linha do Tempo Integrada
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filter === null ? 'default' : 'outline'}
                onClick={() => setFilter(null)}
                className="h-7 px-2 text-xs"
              >
                Todos
              </Button>
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  size="sm"
                  variant={filter === type ? 'default' : 'outline'}
                  onClick={() => setFilter(type)}
                  className="h-7 px-2 text-xs"
                >
                  <config.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={expanded ? 'h-[500px]' : 'h-auto'}>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            {/* Events */}
            <div className="space-y-4">
              {displayEvents && displayEvents.length > 0 ? (
                displayEvents.map((event, idx) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;

                  return (
                    <div key={event.id} className="relative flex gap-4 pl-2">
                      {/* Icon */}
                      <div className={`z-10 p-2 rounded-full ${config.bgColor}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{event.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          {event.metadata?.severity === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              Urgente
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.description}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {format(event.timestamp, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum evento registrado ainda</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {filteredEvents && filteredEvents.length > 10 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Ver mais ({filteredEvents.length - 10} eventos)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
