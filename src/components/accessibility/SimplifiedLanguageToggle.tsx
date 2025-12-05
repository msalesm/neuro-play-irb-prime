import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Simplified language mode for cognitive accessibility
export function SimplifiedLanguageToggle() {
  const { profile, updateProfile } = useAccessibility();
  const isSimplified = profile.simplifiedLanguage;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSimplified ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateProfile({ simplifiedLanguage: !isSimplified })}
            aria-pressed={isSimplified}
            aria-label={isSimplified ? 'Desativar linguagem simplificada' : 'Ativar linguagem simplificada'}
          >
            <Languages className="h-4 w-4 mr-2" />
            {isSimplified ? 'Simples' : 'Normal'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Linguagem simplificada para facilitar a compreensão</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook to get simplified text
export function useSimplifiedText() {
  const { profile } = useAccessibility();
  
  const simplify = (normalText: string, simplifiedText: string): string => {
    return profile.simplifiedLanguage ? simplifiedText : normalText;
  };

  return { simplify, isSimplified: profile.simplifiedLanguage };
}

// Dictionary of simplified terms
export const simplifiedDictionary: Record<string, string> = {
  'Configurações de Acessibilidade': 'Opções de Ajuda',
  'Telemetria Cognitiva': 'Como você aprende',
  'Plano Terapêutico': 'Seu plano de ajuda',
  'Relatório Clínico': 'Resumo para o médico',
  'Relatório Pedagógico': 'Resumo para a escola',
  'Desempenho Cognitivo': 'Como você está indo',
  'Intervenção': 'Ajuda extra',
  'Diagnóstico': 'O que descobrimos',
  'Progresso': 'Quanto você avançou',
  'Recomendações': 'O que fazer agora',
  'Neurodivergente': 'Cérebro diferente',
  'Déficit de Atenção': 'Dificuldade de focar',
  'Transtorno do Espectro Autista': 'Autismo',
  'Dislexia': 'Dificuldade com letras',
};
