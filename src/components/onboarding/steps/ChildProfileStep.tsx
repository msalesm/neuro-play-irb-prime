import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '../OnboardingWizard';
import { Baby, Calendar, Users, Brain, Volume2, Sun, Hand, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { AvatarSelection } from '@/components/gamification/AvatarSelection';

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
};

const CONDITIONS = [
  { id: 'tea', label: 'TEA (Transtorno do Espectro Autista)' },
  { id: 'tdah', label: 'TDAH (Transtorno do Déficit de Atenção)' },
  { id: 'dislexia', label: 'Dislexia' },
  { id: 'discalculia', label: 'Discalculia' },
  { id: 'tpt', label: 'TPT (Transtorno do Processamento Temporal)' },
  { id: 'dld', label: 'DLD (Distúrbio de Linguagem do Desenvolvimento)' },
];

export function ChildProfileStep({ data, updateData }: Props) {
  const toggleCondition = (conditionId: string) => {
    const current = data.diagnosedConditions;
    const updated = current.includes(conditionId)
      ? current.filter(c => c !== conditionId)
      : [...current, conditionId];
    updateData({ diagnosedConditions: updated });
  };

  const updateSensoryProfile = (key: keyof typeof data.sensoryProfile, value: number[]) => {
    updateData({
      sensoryProfile: {
        ...data.sensoryProfile,
        [key]: value[0],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Perfil da Criança</h3>
        <p className="text-sm text-muted-foreground">
          Configure o perfil terapêutico individual para personalização dos jogos e atividades.
        </p>
      </div>

      {/* Avatar Selection */}
      <div className="pb-6 border-b">
        <AvatarSelection
          onSelect={(avatar) => updateData({ childAvatar: avatar })}
          selectedAvatar={data.childAvatar}
        />
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="childName" className="flex items-center gap-2">
            <Baby className="h-4 w-4 text-secondary" />
            Nome da Criança *
          </Label>
          <Input
            id="childName"
            value={data.childName}
            onChange={(e) => updateData({ childName: e.target.value })}
            placeholder="Nome"
            className="border-secondary/30 focus:border-secondary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="childBirthDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              Data de Nascimento *
            </Label>
            <Input
              id="childBirthDate"
              type="date"
              value={data.childBirthDate}
              onChange={(e) => updateData({ childBirthDate: e.target.value })}
              className="border-secondary/30 focus:border-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="childGender" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Gênero (Opcional)
            </Label>
            <Select
              value={data.childGender}
              onValueChange={(value) => updateData({ childGender: value })}
            >
              <SelectTrigger className="border-secondary/30 focus:border-secondary">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Diagnosed Conditions */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-secondary" />
          Condições Diagnósticas (Opcional)
        </Label>
        <p className="text-sm text-muted-foreground">
          Selecione condições já diagnosticadas por profissional qualificado
        </p>
        <div className="grid gap-2">
          {CONDITIONS.map((condition) => (
            <div
              key={condition.id}
              className="flex items-center space-x-3 p-3 rounded-lg border border-secondary/30 hover:border-secondary/50 transition-colors"
            >
              <Checkbox
                id={condition.id}
                checked={data.diagnosedConditions.includes(condition.id)}
                onCheckedChange={() => toggleCondition(condition.id)}
                className="border-secondary data-[state=checked]:bg-secondary"
              />
              <Label htmlFor={condition.id} className="text-sm cursor-pointer flex-1">
                {condition.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sensory Profile */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h4 className="font-semibold text-primary mb-1">Perfil Sensorial</h4>
          <p className="text-sm text-muted-foreground">
            Configure a sensibilidade individual para personalizar estímulos visuais e sonoros
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Volume2 className="h-4 w-4 text-secondary" />
              Sensibilidade a Sons
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-16">Baixa</span>
              <Slider
                value={[data.sensoryProfile.soundSensitivity]}
                onValueChange={(value) => updateSensoryProfile('soundSensitivity', value)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16 text-right">Alta</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível {data.sensoryProfile.soundSensitivity}/10
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Sun className="h-4 w-4 text-secondary" />
              Sensibilidade à Luz
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-16">Baixa</span>
              <Slider
                value={[data.sensoryProfile.lightSensitivity]}
                onValueChange={(value) => updateSensoryProfile('lightSensitivity', value)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16 text-right">Alta</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível {data.sensoryProfile.lightSensitivity}/10
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Hand className="h-4 w-4 text-secondary" />
              Sensibilidade ao Toque
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-16">Baixa</span>
              <Slider
                value={[data.sensoryProfile.touchSensitivity]}
                onValueChange={(value) => updateSensoryProfile('touchSensitivity', value)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16 text-right">Alta</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível {data.sensoryProfile.touchSensitivity}/10
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-secondary" />
              Preferência por Estimulação Visual
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-16">Mínima</span>
              <Slider
                value={[data.sensoryProfile.visualStimulation]}
                onValueChange={(value) => updateSensoryProfile('visualStimulation', value)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16 text-right">Intensa</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível {data.sensoryProfile.visualStimulation}/10
            </p>
          </div>
        </div>
      </div>

      <div className="bg-secondary/20 p-4 rounded-lg border border-secondary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">Personalização Terapêutica:</strong> Este perfil será usado para 
          ajustar automaticamente intensidade de sons, cores, animações e feedback nos jogos, garantindo 
          experiência confortável e terapêutica.
        </p>
      </div>
    </div>
  );
}
