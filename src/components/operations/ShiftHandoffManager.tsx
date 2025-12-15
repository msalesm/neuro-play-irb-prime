import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRightLeft, CheckCircle, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShiftHandoff {
  id: string;
  from_professional_id: string;
  to_professional_id: string;
  handoff_time: string;
  pending_cases_count: number;
  critical_notes: string | null;
  acknowledged_at: string | null;
}

interface Professional {
  id: string;
  full_name: string;
}

interface Props {
  handoffs: ShiftHandoff[];
  professionals: Professional[];
  currentUserId?: string;
  pendingCases: number;
  onCreate: (toUserId: string, pendingCount: number, notes?: string) => Promise<void>;
  onAcknowledge: (id: string) => Promise<void>;
}

export function ShiftHandoffManager({ 
  handoffs, 
  professionals, 
  currentUserId,
  pendingCases,
  onCreate, 
  onAcknowledge 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [notes, setNotes] = useState('');

  const pendingHandoffs = handoffs.filter(h => 
    h.to_professional_id === currentUserId && !h.acknowledged_at
  );

  const handleCreate = async () => {
    if (!selectedProfessional) return;
    await onCreate(selectedProfessional, pendingCases, notes || undefined);
    setIsOpen(false);
    setSelectedProfessional('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowRightLeft className="w-5 h-5" />
          Passagem de Plantão
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Users className="w-4 h-4 mr-1" />
              Nova Passagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Passagem de Plantão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-muted rounded">
                <p className="text-sm">
                  <strong>Casos pendentes:</strong> {pendingCases}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Passar para:
                </label>
                <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals
                      .filter(p => p.id !== currentUserId)
                      .map(prof => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.full_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Notas críticas para o próximo turno..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={!selectedProfessional}>
                  Confirmar Passagem
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pending handoffs to acknowledge */}
          {pendingHandoffs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-600">
                Aguardando seu reconhecimento
              </h4>
              {pendingHandoffs.map(handoff => (
                <div 
                  key={handoff.id}
                  className="p-4 rounded-lg border border-orange-200 bg-orange-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {handoff.pending_cases_count} casos pendentes
                      </p>
                      {handoff.critical_notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {handoff.critical_notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDistanceToNow(new Date(handoff.handoff_time), { 
                          locale: ptBR, 
                          addSuffix: true 
                        })}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => onAcknowledge(handoff.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Reconhecer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent handoffs */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Histórico Recente
            </h4>
            {handoffs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Nenhuma passagem registrada
              </p>
            ) : (
              <div className="space-y-2">
                {handoffs.slice(0, 5).map(handoff => (
                  <div 
                    key={handoff.id}
                    className="p-3 rounded-lg border text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {handoff.pending_cases_count} casos transferidos
                      </span>
                      {handoff.acknowledged_at ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reconhecido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          Pendente
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(handoff.handoff_time), { 
                        locale: ptBR, 
                        addSuffix: true 
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
