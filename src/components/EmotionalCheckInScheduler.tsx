import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CheckIn {
  id: string;
  scheduled_for: string;
  completed_at: string | null;
  mood_rating: number | null;
  emotions_detected: string[] | null;
  conversation_id: string | null;
}

interface EmotionalCheckInSchedulerProps {
  childProfileId?: string;
  onStartCheckIn?: () => void;
}

export default function EmotionalCheckInScheduler({ 
  childProfileId,
  onStartCheckIn 
}: EmotionalCheckInSchedulerProps) {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user, childProfileId]);

  const fetchCheckIns = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let query = supabase
        .from('emotional_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_for', today.toISOString())
        .order('scheduled_for', { ascending: true });

      if (childProfileId) {
        query = query.eq('child_profile_id', childProfileId);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleCheckIn = async (date: Date) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('emotional_checkins')
        .insert({
          user_id: user.id,
          child_profile_id: childProfileId || null,
          scheduled_for: date.toISOString(),
        });

      if (error) throw error;

      toast.success('Check-in agendado com sucesso!');
      fetchCheckIns();
    } catch (error) {
      console.error('Error scheduling check-in:', error);
      toast.error('Erro ao agendar check-in');
    }
  };

  const scheduleDailyCheckIns = async () => {
    const times = [9, 15, 21]; // 9h, 15h, 21h
    const today = new Date();
    
    for (const hour of times) {
      const scheduleDate = new Date(today);
      scheduleDate.setHours(hour, 0, 0, 0);
      
      if (scheduleDate > new Date()) {
        await scheduleCheckIn(scheduleDate);
      }
    }
  };

  const getCheckInStatus = (checkIn: CheckIn) => {
    if (checkIn.completed_at) {
      return { label: 'Completo', color: 'bg-green-500', icon: Check };
    }
    if (isPast(new Date(checkIn.scheduled_for)) && !isToday(new Date(checkIn.scheduled_for))) {
      return { label: 'Perdido', color: 'bg-red-500', icon: Clock };
    }
    if (isToday(new Date(checkIn.scheduled_for))) {
      return { label: 'Hoje', color: 'bg-blue-500', icon: Heart };
    }
    return { label: 'Agendado', color: 'bg-gray-500', icon: Calendar };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-ins Emocionais</CardTitle>
          <CardDescription>Carregando agendamentos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCheckIns = checkIns.filter(c => !c.completed_at && isToday(new Date(c.scheduled_for)));
  const upcomingCheckIns = checkIns.filter(c => !c.completed_at && !isToday(new Date(c.scheduled_for)));
  const completedCheckIns = checkIns.filter(c => c.completed_at);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Check-ins Emocionais
            </CardTitle>
            <CardDescription>
              Acompanhamento diário do estado emocional
            </CardDescription>
          </div>
          <Button onClick={scheduleDailyCheckIns} size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Diários
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingCheckIns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">Pendentes para hoje</h4>
            {pendingCheckIns.map((checkIn) => {
              const status = getCheckInStatus(checkIn);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.color} text-white`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(checkIn.scheduled_for), "HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check-in emocional
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={onStartCheckIn}>
                    Iniciar
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {upcomingCheckIns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Próximos</h4>
            <div className="space-y-2">
              {upcomingCheckIns.slice(0, 3).map((checkIn) => {
                const status = getCheckInStatus(checkIn);
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={checkIn.id}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <div className={`p-1.5 rounded ${status.color} text-white`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {format(new Date(checkIn.scheduled_for), "dd MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedCheckIns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-600">Completados</h4>
            <div className="space-y-2">
              {completedCheckIns.slice(0, 2).map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-green-50"
                >
                  <div className="p-1.5 rounded bg-green-500 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {format(new Date(checkIn.scheduled_for), "dd MMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {checkIn.mood_rating && (
                      <p className="text-xs text-muted-foreground">
                        Humor: {checkIn.mood_rating}/5
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {checkIns.length === 0 && (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum check-in agendado
            </p>
            <Button onClick={scheduleDailyCheckIns}>
              Agendar Check-ins Diários
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
