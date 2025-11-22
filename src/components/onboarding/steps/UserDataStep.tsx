import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '../OnboardingWizard';
import { User, Mail, Phone } from 'lucide-react';

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
};

export function UserDataStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-irb-petrol mb-2">Dados Pessoais</h3>
        <p className="text-sm text-muted-foreground">
          Precisamos de algumas informações básicas para criar seu perfil.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-irb-blue" />
            Nome Completo *
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Seu nome completo"
            className="border-irb-blue/30 focus:border-irb-blue"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-irb-blue" />
            E-mail *
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="seu@email.com"
            className="border-irb-blue/30 focus:border-irb-blue"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-irb-blue" />
            Telefone *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="(00) 00000-0000"
            className="border-irb-blue/30 focus:border-irb-blue"
          />
        </div>
      </div>

      <div className="bg-secondary/20 p-4 rounded-lg border border-irb-blue/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-irb-petrol">Privacidade:</strong> Seus dados são protegidos de acordo com a LGPD 
          e serão usados exclusivamente para fins terapêuticos e educacionais.
        </p>
      </div>
    </div>
  );
}
