import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EscalationRecord {
  id: string;
  queue_item_id: string;
  escalated_from: string | null;
  escalated_to: string | null;
  escalation_level: number;
  reason: string;
  auto_escalated: boolean;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface Props {
  escalations: EscalationRecord[];
  onResolve: (id: string, notes: string) => Promise<void>;
}

export function EscalationPanel({ escalations, onResolve }: Props) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const pendingEscalations = escalations.filter(e => !e.resolved_at);
  const resolvedEscalations = escalations.filter(e => e.resolved_at);

  const handleResolve = async (id: string) => {
    await onResolve(id, notes);
    setResolvingId(null);
    setNotes('');
  };

  const getLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors[1];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpRight className="w-5 h-5" />
          Escalações
          {pendingEscalations.length > 0 && (
            <Badge variant="destructive">{pendingEscalations.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingEscalations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma escalação pendente
            </p>
          ) : (
            pendingEscalations.map(escalation => (
              <div 
                key={escalation.id}
                className="p-4 rounded-lg border border-orange-200 bg-orange-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <Badge className={getLevelBadge(escalation.escalation_level)}>
                        Nível {escalation.escalation_level}
                      </Badge>
                      {escalation.auto_escalated && (
                        <Badge variant="outline">Auto</Badge>
                      )}
                    </div>
                    <p className="text-sm">{escalation.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDistanceToNow(new Date(escalation.created_at), { 
                        locale: ptBR, 
                        addSuffix: true 
                      })}
                    </p>
                  </div>

                  <Dialog open={resolvingId === escalation.id} onOpenChange={(open) => !open && setResolvingId(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setResolvingId(escalation.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Resolver Escalação</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="p-3 bg-muted rounded">
                          <p className="text-sm font-medium">Motivo da escalação:</p>
                          <p className="text-sm text-muted-foreground">{escalation.reason}</p>
                        </div>
                        <Textarea
                          placeholder="Descreva como o caso foi resolvido..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setResolvingId(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => handleResolve(escalation.id)}>
                            Confirmar Resolução
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}

          {resolvedEscalations.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Resolvidas Recentemente
              </h4>
              <div className="space-y-2">
                {resolvedEscalations.slice(0, 5).map(escalation => (
                  <div 
                    key={escalation.id}
                    className="p-3 rounded-lg border bg-muted/50 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{escalation.reason}</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolvida
                      </Badge>
                    </div>
                    {escalation.resolution_notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {escalation.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
