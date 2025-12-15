import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionSettings {
  id?: string;
  institution_id?: string;
  auto_assign_enabled: boolean;
  max_queue_size: number;
  default_sla_hours: number;
  escalation_enabled: boolean;
  escalation_threshold_hours: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  notification_channels: string[];
}

interface Props {
  settings: InstitutionSettings | null;
  onUpdate: (updates: Partial<InstitutionSettings>) => Promise<void>;
}

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

export function InstitutionalSettings({ settings, onUpdate }: Props) {
  const [localSettings, setLocalSettings] = useState<InstitutionSettings>(settings || {
    auto_assign_enabled: false,
    max_queue_size: 100,
    default_sla_hours: 24,
    escalation_enabled: true,
    escalation_threshold_hours: 4,
    working_hours_start: '08:00',
    working_hours_end: '18:00',
    working_days: [1, 2, 3, 4, 5],
    notification_channels: ['email', 'in_app']
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(localSettings);
    setSaving(false);
  };

  const toggleDay = (day: number) => {
    const days = localSettings.working_days.includes(day)
      ? localSettings.working_days.filter(d => d !== day)
      : [...localSettings.working_days, day].sort();
    setLocalSettings({ ...localSettings, working_days: days });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="w-5 h-5" />
          Configurações Operacionais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Assignment */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Atribuição Automática</Label>
            <p className="text-sm text-muted-foreground">
              Distribuir casos automaticamente para profissionais disponíveis
            </p>
          </div>
          <Switch
            checked={localSettings.auto_assign_enabled}
            onCheckedChange={(checked) => 
              setLocalSettings({ ...localSettings, auto_assign_enabled: checked })
            }
          />
        </div>

        {/* SLA Settings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>SLA Padrão (horas)</Label>
            <Input
              type="number"
              min={1}
              max={168}
              value={localSettings.default_sla_hours}
              onChange={(e) => 
                setLocalSettings({ ...localSettings, default_sla_hours: parseInt(e.target.value) || 24 })
              }
            />
          </div>
          <div>
            <Label>Tamanho Máximo da Fila</Label>
            <Input
              type="number"
              min={10}
              max={1000}
              value={localSettings.max_queue_size}
              onChange={(e) => 
                setLocalSettings({ ...localSettings, max_queue_size: parseInt(e.target.value) || 100 })
              }
            />
          </div>
        </div>

        {/* Escalation Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Escalação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Escalar casos automaticamente após tempo limite
              </p>
            </div>
            <Switch
              checked={localSettings.escalation_enabled}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, escalation_enabled: checked })
              }
            />
          </div>
          {localSettings.escalation_enabled && (
            <div className="max-w-xs">
              <Label>Limite para Escalação (horas)</Label>
              <Input
                type="number"
                min={1}
                max={48}
                value={localSettings.escalation_threshold_hours}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, escalation_threshold_hours: parseInt(e.target.value) || 4 })
                }
              />
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div className="space-y-4">
          <Label className="font-medium">Horário de Funcionamento</Label>
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Início</Label>
              <Input
                type="time"
                value={localSettings.working_hours_start.slice(0, 5)}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, working_hours_start: e.target.value })
                }
                className="w-32"
              />
            </div>
            <span className="mt-6">até</span>
            <div>
              <Label className="text-sm text-muted-foreground">Fim</Label>
              <Input
                type="time"
                value={localSettings.working_hours_end.slice(0, 5)}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, working_hours_end: e.target.value })
                }
                className="w-32"
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="space-y-2">
          <Label className="font-medium">Dias de Funcionamento</Label>
          <div className="flex gap-2">
            {DAYS.map(day => (
              <Button
                key={day.value}
                variant={localSettings.working_days.includes(day.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day.value)}
                className="w-12"
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
}
