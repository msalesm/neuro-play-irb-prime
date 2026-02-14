import { OnboardingData } from '../OnboardingWizard';
import { Card } from '@/components/ui/card';
import { Users, Stethoscope, GraduationCap, Building2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
};

const ROLES = [
  {
    id: 'patient' as const,
    title: 'Paciente',
    description: 'Usar os jogos terapêuticos para meu próprio desenvolvimento',
    icon: Heart,
    features: ['Jogos cognitivos', 'Acompanhamento pessoal', 'Relatórios de progresso', 'Chat terapêutico'],
    color: 'irb-blue',
  },
  {
    id: 'parent' as const,
    title: 'Pai/Mãe',
    description: 'Acompanhar o desenvolvimento terapêutico do meu filho',
    icon: Users,
    features: ['Jogos cognitivos', 'Educação parental', 'Relatórios de progresso', 'Atividades cooperativas'],
    color: 'irb-blue',
  },
  {
    id: 'therapist' as const,
    title: 'Terapeuta',
    description: 'Gerenciar pacientes e criar planos terapêuticos',
    icon: Stethoscope,
    features: ['Dashboard clínico', 'PEI Inteligente', 'Relatórios clínicos', 'Gestão de pacientes'],
    color: 'irb-petrol',
  },
  {
    id: 'teacher' as const,
    title: 'Professor',
    description: 'Acompanhar alunos e implementar estratégias educacionais',
    icon: GraduationCap,
    features: ['Painel escolar', 'Turmas e alunos', 'Check-in semanal', 'Sugestões com IA'],
    color: 'irb-gold',
  },
  {
    id: 'admin' as const,
    title: 'Gestor Público',
    description: 'Analisar dados de rede e gerar políticas públicas',
    icon: Building2,
    features: ['Dashboard de rede', 'Mapas de risco', 'Relatórios gerenciais', 'Analytics regionais'],
    color: 'accent',
  },
];

export function RoleSelectionStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-irb-petrol mb-2">Qual é o seu perfil?</h3>
        <p className="text-muted-foreground">
          Selecione como você usará a plataforma Neuro IRB Prime
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = data.selectedRole === role.id;
          
          return (
            <Card
              key={role.id}
              className={cn(
                'p-6 cursor-pointer transition-all hover:shadow-lg border-2',
                isSelected
                  ? 'border-irb-blue bg-secondary/10 shadow-strong'
                  : 'border-border hover:border-irb-blue/50'
              )}
              onClick={() => updateData({ selectedRole: role.id })}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-3 rounded-lg',
                  isSelected ? 'bg-irb-blue text-white' : 'bg-secondary text-irb-blue'
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg text-irb-petrol">{role.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  </div>
                  
                  <div className="space-y-1">
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isSelected ? 'bg-irb-blue' : 'bg-muted-foreground'
                        )} />
                        <span className={isSelected ? 'text-foreground' : 'text-muted-foreground'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-irb-blue/20">
                  <div className="flex items-center gap-2 text-sm text-irb-blue font-semibold">
                    <div className="h-5 w-5 rounded-full bg-irb-blue text-white flex items-center justify-center text-xs">
                      ✓
                    </div>
                    Perfil selecionado
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="bg-secondary/20 p-4 rounded-lg border border-irb-blue/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-irb-petrol">Nota:</strong> Você poderá alterar seu perfil posteriormente nas configurações da conta.
        </p>
      </div>
    </div>
  );
}
