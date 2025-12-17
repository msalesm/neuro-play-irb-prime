import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Phone, Calendar } from 'lucide-react';
import { WaitingListItem } from '@/hooks/useClinicAgenda';

interface WaitingListPanelProps {
  items: WaitingListItem[];
  onSchedule: (item: WaitingListItem) => void;
}

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Urgente', color: 'bg-red-500' },
  2: { label: 'Alta', color: 'bg-orange-500' },
  3: { label: 'Média', color: 'bg-yellow-500' },
  4: { label: 'Normal', color: 'bg-blue-500' },
  5: { label: 'Baixa', color: 'bg-gray-500' },
};

export function WaitingListPanel({ items, onSchedule }: WaitingListPanelProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lista de Espera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum paciente na lista de espera
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Lista de Espera
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4">
            {items.map((item) => {
              const priority = priorityLabels[item.priority] || priorityLabels[5];
              
              return (
                <Card key={item.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                        <span className="font-medium text-sm truncate">
                          {item.child?.name || 'Paciente'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {priority.label}
                        </Badge>
                      </div>

                      {item.parent && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {item.parent.full_name}
                        </div>
                      )}

                      {item.preferred_days && item.preferred_days.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Preferência: {item.preferred_days.join(', ')}
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSchedule(item)}
                        className="h-7 text-xs"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Agendar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Contato
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
