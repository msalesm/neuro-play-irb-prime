import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Save } from 'lucide-react';

interface Schedule {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_cases_per_slot: number;
}

interface Props {
  schedules: Schedule[];
  onUpdate: (dayOfWeek: number, updates: Partial<Schedule>) => Promise<void>;
}

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' }
];

export function ProfessionalScheduleManager({ schedules, onUpdate }: Props) {
  const [saving, setSaving] = useState<number | null>(null);

  const getScheduleForDay = (day: number): Schedule => {
    return schedules.find(s => s.day_of_week === day) || {
      day_of_week: day,
      start_time: '08:00',
      end_time: '18:00',
      is_available: false,
      max_cases_per_slot: 4
    };
  };

  const handleSave = async (day: number, updates: Partial<Schedule>) => {
    setSaving(day);
    await onUpdate(day, updates);
    setSaving(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-5 h-5" />
          Agenda Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map(day => {
            const schedule = getScheduleForDay(day.value);
            return (
              <div 
                key={day.value} 
                className={`p-4 rounded-lg border ${schedule.is_available ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <Switch
                      checked={schedule.is_available}
                      onCheckedChange={(checked) => handleSave(day.value, { is_available: checked })}
                    />
                    <span className="font-medium">{day.label}</span>
                  </div>

                  {schedule.is_available && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={schedule.start_time.slice(0, 5)}
                          onChange={(e) => handleSave(day.value, { start_time: e.target.value })}
                          className="w-28"
                        />
                        <span>até</span>
                        <Input
                          type="time"
                          value={schedule.end_time.slice(0, 5)}
                          onChange={(e) => handleSave(day.value, { end_time: e.target.value })}
                          className="w-28"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">
                          Máx casos/slot:
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={schedule.max_cases_per_slot}
                          onChange={(e) => handleSave(day.value, { max_cases_per_slot: parseInt(e.target.value) || 4 })}
                          className="w-20"
                        />
                      </div>
                    </>
                  )}

                  {saving === day.value && (
                    <Save className="w-4 h-4 animate-pulse text-primary" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
