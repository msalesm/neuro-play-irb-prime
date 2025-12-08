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
      color: 'blue',
      gradient: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500'
    },
    {
      label: 'Terapeutas',
      value: stats.therapists,
      icon: UserPlus,
      color: 'purple',
      gradient: 'from-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-500'
    },
    {
      label: 'Professores',
      value: stats.teachers,
      icon: GraduationCap,
      color: 'green',
      gradient: 'from-green-500/10 to-green-600/5',
      border: 'border-green-500/20',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-500'
    },
    {
      label: 'Alunos',
      value: stats.students,
      icon: BookOpen,
      color: 'orange',
      gradient: 'from-orange-500/10 to-orange-600/5',
      border: 'border-orange-500/20',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-500'
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
