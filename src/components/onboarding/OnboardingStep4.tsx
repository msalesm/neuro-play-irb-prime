import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '@/pages/Onboarding';
import { Plus, X, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface OnboardingStep4Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

interface ChildProfile {
  name: string;
  birthDate: string;
  gender?: string;
  conditions: string[];
  sensoryProfile: {
    volume: 'low' | 'medium' | 'high' | 'off';
    contrast: 'normal' | 'high';
    animations: 'smooth' | 'off';
    responseTime: 'unlimited' | '30' | '60';
    feedback: 'visual' | 'audio' | 'both';
  };
}

export function OnboardingStep4({ data, onNext, onBack }: OnboardingStep4Props) {
  const [children, setChildren] = useState<ChildProfile[]>(
    data.children && data.children.length > 0
      ? data.children
      : [{
          name: '',
          birthDate: '',
          gender: '',
          conditions: [],
          sensoryProfile: {
            volume: 'medium',
            contrast: 'normal',
            animations: 'smooth',
            responseTime: 'unlimited',
            feedback: 'both'
          }
        }]
  );

  const conditions = [
    { value: 'TEA', label: 'TEA (Transtorno do Espectro Autista)' },
    { value: 'TDAH', label: 'TDAH (Transtorno de Déficit de Atenção/Hiperatividade)' },
    { value: 'Dislexia', label: 'Dislexia' },
    { value: 'Outro', label: 'Outra condição' },
    { value: 'Nenhum', label: 'Sem diagnóstico / Em investigação' }
  ];

  const handleAddChild = () => {
    setChildren([
      ...children,
      {
        name: '',
        birthDate: '',
        gender: '',
        conditions: [],
        sensoryProfile: {
          volume: 'medium',
          contrast: 'normal',
          animations: 'smooth',
          responseTime: 'unlimited',
          feedback: 'both'
        }
      }
    ]);
  };

  const handleRemoveChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const handleChildChange = (index: number, field: keyof ChildProfile, value: any) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const handleConditionToggle = (childIndex: number, condition: string) => {
    const updated = [...children];
    const currentConditions = updated[childIndex].conditions;
    
    if (currentConditions.includes(condition)) {
      updated[childIndex].conditions = currentConditions.filter(c => c !== condition);
    } else {
      updated[childIndex].conditions = [...currentConditions, condition];
    }
    
    setChildren(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one child with name and birth date
    const hasValidChild = children.some(child => child.name && child.birthDate);
    
    if (hasValidChild) {
      onNext({ children });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Perfil da(s) Criança(s)</h3>
          <p className="text-sm text-muted-foreground">
            Cadastre o perfil da criança que usará a plataforma. Você pode adicionar mais 
            de uma criança se necessário.
          </p>
        </div>

        {children.map((child, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h4 className="font-medium">Criança {index + 1}</h4>
              </div>
              {children.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveChild(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`name-${index}`}
                  value={child.name}
                  onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                  placeholder="Nome da criança"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`birthdate-${index}`}>
                  Data de Nascimento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`birthdate-${index}`}
                  type="date"
                  value={child.birthDate}
                  onChange={(e) => handleChildChange(index, 'birthDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`gender-${index}`}>Gênero (opcional)</Label>
                <Select
                  value={child.gender}
                  onValueChange={(value) => handleChildChange(index, 'gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Condições / Diagnósticos</Label>
              <div className="grid grid-cols-1 gap-2">
                {conditions.map((condition) => (
                  <div key={condition.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`condition-${index}-${condition.value}`}
                      checked={child.conditions.includes(condition.value)}
                      onCheckedChange={() => handleConditionToggle(index, condition.value)}
                    />
                    <label
                      htmlFor={`condition-${index}-${condition.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {condition.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label className="text-base">Perfil Sensorial</Label>
              <p className="text-xs text-muted-foreground">
                Personalize a experiência de acordo com necessidades sensoriais
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Volume do Som</Label>
                  <Select
                    value={child.sensoryProfile.volume}
                    onValueChange={(value) =>
                      handleChildChange(index, 'sensoryProfile', {
                        ...child.sensoryProfile,
                        volume: value
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Desligado</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Contraste Visual</Label>
                  <Select
                    value={child.sensoryProfile.contrast}
                    onValueChange={(value) =>
                      handleChildChange(index, 'sensoryProfile', {
                        ...child.sensoryProfile,
                        contrast: value
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alto Contraste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Animações</Label>
                  <Select
                    value={child.sensoryProfile.animations}
                    onValueChange={(value) =>
                      handleChildChange(index, 'sensoryProfile', {
                        ...child.sensoryProfile,
                        animations: value
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smooth">Suaves</SelectItem>
                      <SelectItem value="off">Desligadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Tempo de Resposta</Label>
                  <Select
                    value={child.sensoryProfile.responseTime}
                    onValueChange={(value) =>
                      handleChildChange(index, 'sensoryProfile', {
                        ...child.sensoryProfile,
                        responseTime: value
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Sem Limite</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="60">60 segundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm">Tipo de Feedback</Label>
                  <Select
                    value={child.sensoryProfile.feedback}
                    onValueChange={(value) =>
                      handleChildChange(index, 'sensoryProfile', {
                        ...child.sensoryProfile,
                        feedback: value
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Visual + Auditivo</SelectItem>
                      <SelectItem value="visual">Apenas Visual</SelectItem>
                      <SelectItem value="audio">Apenas Auditivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddChild}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Outra Criança
        </Button>
      </div>

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" size="lg">
          Concluir Cadastro
        </Button>
      </div>
    </form>
  );
}
