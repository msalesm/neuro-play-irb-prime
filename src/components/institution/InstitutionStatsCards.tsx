import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, GraduationCap, BookOpen, Gamepad2, Activity } from 'lucide-react';
import { InstitutionStats } from '@/hooks/useInstitution';

interface InstitutionStatsCardsProps {
  stats: InstitutionStats;
}

export function InstitutionStatsCards({ stats }: InstitutionStatsCardsProps) {
  const cards = [
    {
      label: 'Total Membros',
      value: stats.totalMembers,
      icon: Users,
      gradient: 'from-primary/10 to-primary/5',
      border: 'border-primary/20',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    {
      label: 'Terapeutas',
      value: stats.therapists,
      icon: UserPlus,
      gradient: 'from-secondary/10 to-secondary/5',
      border: 'border-secondary/20',
      iconBg: 'bg-secondary/20',
      iconColor: 'text-secondary'
    },
    {
      label: 'Professores',
      value: stats.teachers,
      icon: GraduationCap,
      gradient: 'from-success/10 to-success/5',
      border: 'border-success/20',
      iconBg: 'bg-success/20',
      iconColor: 'text-success'
    },
    {
      label: 'Alunos',
      value: stats.students,
      icon: BookOpen,
      gradient: 'from-warning/10 to-warning/5',
      border: 'border-warning/20',
      iconBg: 'bg-warning/20',
      iconColor: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className={`bg-gradient-to-br ${card.gradient} ${card.border}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${card.iconBg} rounded-lg`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
