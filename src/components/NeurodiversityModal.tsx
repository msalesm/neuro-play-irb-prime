import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Focus, 
  BookOpen, 
  Sparkles, 
  Heart,
  Users,
  Target,
  Lightbulb,
  Play,
  Info,
  Star,
  Award
} from "lucide-react";

interface NeurodiversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
}

const neurodiversityInfo = {
  tea: {
    name: "TEA - Transtorno do Espectro Autista",
    icon: Brain,
    color: "hsl(213 85% 65%)",
    description: "O TEA é uma condição neurológica que afeta a comunicação, interação social e comportamento.",
    characteristics: [
      "Dificuldades na comunicação social",
      "Padrões repetitivos de comportamento",
      "Sensibilidades sensoriais específicas",
      "Preferência por rotinas e previsibilidade",
      "Interesses intensos em tópicos específicos"
    ],
    benefits: [
      "Desenvolve habilidades sociais através de cenários práticos",
      "Melhora regulação emocional com técnicas de mindfulness",
      "Reduz ansiedade através de exercícios de respiração",
      "Promove flexibilidade cognitiva gradualmente"
    ],
    tips: [
      "Estabeleça rotinas claras durante o jogo",
      "Use reforços positivos constantes",
      "Respeite o ritmo individual da criança",
      "Celebre pequenos progressos",
      "Mantenha ambiente calmo e previsível"
    ],
    games: ["Social Scenarios", "MindfulBreath", "SensoryFlow"]
  },
  tdah: {
    name: "TDAH - Transtorno do Déficit de Atenção",
    icon: Focus,
    color: "hsl(150 40% 65%)",
    description: "O TDAH é uma condição que afeta a atenção, hiperatividade e controle de impulsos.",
    characteristics: [
      "Dificuldade de concentração e atenção",
      "Hiperatividade e impulsividade",
      "Desorganização e esquecimento",
      "Dificuldade para seguir instruções",
      "Inquietação motora"
    ],
    benefits: [
      "Fortalece capacidade de foco através de exercícios direcionados",
      "Desenvolve autorregulação emocional",
      "Melhora controle de impulsos gradualmente",
      "Aumenta persistência em tarefas desafiadoras"
    ],
    tips: [
      "Divida atividades em etapas menores",
      "Use lembretes visuais e sonoros",
      "Permita pausas regulares durante o jogo",
      "Celebre marcos de progresso",
      "Mantenha sessões curtas e dinâmicas"
    ],
    games: ["BalanceQuest", "VisualSync", "Tower Defense"]
  },
  dislexia: {
    name: "Dislexia - Dificuldades de Processamento",
    icon: BookOpen,
    color: "hsl(142 71% 45%)",
    description: "A dislexia é uma condição que afeta o processamento de informações, especialmente leitura e escrita.",
    characteristics: [
      "Dificuldades na decodificação de palavras",
      "Problemas com consciência fonológica",
      "Lentidão na leitura e compreensão",
      "Dificuldades de organização sequencial",
      "Confusão com orientação espacial"
    ],
    benefits: [
      "Melhora processamento sensorial através do toque",
      "Desenvolve coordenação motora fina",
      "Fortalece memória de trabalho",
      "Aumenta consciência espacial e sequencial"
    ],
    tips: [
      "Favoreça aprendizado multissensorial",
      "Use pistas visuais e táteis",
      "Permita tempo extra para processamento",
      "Reforce conquistas positivamente",
      "Pratique em ambiente sem distrações"
    ],
    games: ["SensoryFlow", "TouchMapper", "VisualSync"]
  },
  altas_habilidades: {
    name: "Altas Habilidades/Superdotação",
    icon: Sparkles,
    color: "hsl(262 83% 58%)",
    description: "Altas habilidades referem-se a capacidades excepcionais em áreas específicas do desenvolvimento.",
    characteristics: [
      "Aprendizado acelerado e profundo",
      "Grande curiosidade e questionamento",
      "Criatividade e originalidade elevadas",
      "Intensidade emocional",
      "Perfeccionismo e autocobrança"
    ],
    benefits: [
      "Oferece desafios cognitivos apropriados",
      "Desenvolve habilidades sociais complexas",
      "Promove autorregulação emocional",
      "Estimula pensamento crítico avançado"
    ],
    tips: [
      "Apresente desafios progressivamente complexos",
      "Estimule criatividade e inovação",
      "Trabalhe aspectos emocionais e sociais",
      "Celebre o processo, não apenas resultados",
      "Conecte aprendizados a interesses especiais"
    ],
    games: ["Social Scenarios Plus", "BalanceQuest Elite", "Tower Defense Pro"]
  }
};

export default function NeurodiversityModal({ isOpen, onClose, trackId }: NeurodiversityModalProps) {
  const info = neurodiversityInfo[trackId as keyof typeof neurodiversityInfo];
  
  if (!info) return null;

  const IconComponent = info.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-4 text-2xl">
            <div 
              className="p-3 rounded-xl text-white shadow-lg"
              style={{ backgroundColor: info.color }}
            >
              <IconComponent className="w-8 h-8" />
            </div>
            {info.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-8">
            {/* Description */}
            <div className="bg-gradient-to-r from-muted/50 to-muted/20 p-6 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">O que é?</h3>
                  <p className="text-muted-foreground leading-relaxed">{info.description}</p>
                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-lg">Características Principais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {info.characteristics.map((characteristic, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{characteristic}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Game Benefits */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h3 className="font-semibold text-lg">Como os Jogos Ajudam</h3>
              </div>
              <div className="space-y-3">
                {info.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <Star className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tips for Families */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="font-semibold text-lg">Dicas para Familiares</h3>
              </div>
              <div className="space-y-3">
                {info.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Games */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-lg">Jogos Disponíveis</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {info.games.map((game, index) => (
                  <Badge 
                    key={index} 
                    className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  >
                    {game}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} size="lg">
            Começar Jornada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}