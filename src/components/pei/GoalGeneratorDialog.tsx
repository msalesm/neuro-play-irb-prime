import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PEI_BNCC_AREAS,
  getBnccGoalsForArea,
  type BnccGoalTemplate,
  type PeiBnccArea,
} from '@/lib/peiBnccCatalog';
import { BookOpen, Sparkles } from 'lucide-react';

interface GoalGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (templates: BnccGoalTemplate[]) => void;
}

export function GoalGeneratorDialog({ open, onOpenChange, onGenerate }: GoalGeneratorDialogProps) {
  const [area, setArea] = useState<PeiBnccArea>('Linguagem');
  const [selected, setSelected] = useState<Record<string, BnccGoalTemplate>>({});

  const templates = getBnccGoalsForArea(area);

  const toggle = (t: BnccGoalTemplate) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[t.bnccCode]) delete next[t.bnccCode];
      else next[t.bnccCode] = t;
      return next;
    });
  };

  const handleGenerate = () => {
    const list = Object.values(selected);
    if (list.length === 0) return;
    onGenerate(list);
    setSelected({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar metas a partir do catálogo BNCC
          </DialogTitle>
          <DialogDescription>
            Selecione uma área e marque as metas pedagógicas que deseja adicionar ao PEI. Cada
            meta vem com objetivo, estratégias e recomendações já alinhados à BNCC.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Área de desenvolvimento</label>
            <Select value={area} onValueChange={(v) => setArea(v as PeiBnccArea)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PEI_BNCC_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[340px] pr-3">
            <div className="space-y-3">
              {templates.map((t) => {
                const checked = !!selected[t.bnccCode];
                return (
                  <div
                    key={t.bnccCode}
                    className={`border rounded-lg p-3 cursor-pointer transition ${
                      checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggle(t)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={checked} onCheckedChange={() => toggle(t)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs gap-1">
                            <BookOpen className="h-3 w-3" />
                            {t.bnccCode}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {t.suggestedTimeline}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{t.objective}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.strategies.length} estratégias · {t.recommendations.length}{' '}
                          recomendações
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={Object.keys(selected).length === 0}>
            Adicionar {Object.keys(selected).length} meta(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}