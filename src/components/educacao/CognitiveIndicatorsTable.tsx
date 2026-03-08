import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface Student {
  id: string;
  child_id: string;
  children: { id: string; name: string; birth_date: string; avatar_url: string | null };
}

interface CognitiveIndicatorsTableProps {
  students: Student[];
  observations: any[];
  onStudentClick?: (student: Student) => void;
}

function getLevel(value: number): { label: string; color: string } {
  if (value <= 1) return { label: 'Alto', color: 'bg-success/10 text-success border-success/20' };
  if (value <= 2) return { label: 'Médio', color: 'bg-warning/10 text-warning border-warning/20' };
  return { label: 'Baixo', color: 'bg-destructive/10 text-destructive border-destructive/20' };
}

export function CognitiveIndicatorsTable({ students, observations, onStudentClick }: CognitiveIndicatorsTableProps) {
  const enrichedStudents = students.map(s => {
    const obs = observations.find((o: any) => o.child_id === s.child_id);
    // Invert scale: observation uses 1=good, 3=bad
    // For attention: focus_difficulty (1=adequate, 3=priority)
    // For persistence: participation (1=adequate, 3=priority) - but participation high = good
    const attention = obs ? getLevel(obs.focus_difficulty || 1) : { label: '—', color: 'bg-muted text-muted-foreground' };
    const memory = obs ? getLevel(obs.performance_drop || 1) : { label: '—', color: 'bg-muted text-muted-foreground' };
    const persistence = obs ? getLevel(obs.behavior_change || 1) : { label: '—', color: 'bg-muted text-muted-foreground' };
    
    return { ...s, attention, memory, persistence, hasObs: !!obs };
  }).sort((a, b) => {
    // Sort: students needing attention first
    if (!a.hasObs && !b.hasObs) return 0;
    if (!a.hasObs) return 1;
    if (!b.hasObs) return -1;
    return 0;
  });

  if (students.length === 0) return null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Indicadores Cognitivos da Turma
        </CardTitle>
        <CardDescription>Visão rápida de atenção, memória e persistência por aluno</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aluno</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">🎯 Atenção</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">🧠 Memória</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">💪 Persistência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrichedStudents.map(student => (
                <tr
                  key={student.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onStudentClick?.(student)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {student.children.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium truncate">{student.children.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={student.attention.color}>
                      {student.attention.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={student.memory.color}>
                      {student.memory.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={student.persistence.color}>
                      {student.persistence.label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
