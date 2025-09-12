import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { useNeuroplasticity } from '@/hooks/useNeuroplasticity';
import { NeuroplasticityModal } from './NeuroplasticityModal';

export function NeuroplasticityButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { neuroplasticityData, loading } = useNeuroplasticity();

  if (loading) {
    return (
      <Button variant="outline" className="relative" disabled>
        <Brain className="w-4 h-4 mr-2 animate-pulse" />
        Carregando...
      </Button>
    );
  }

  const overallScore = Math.round(neuroplasticityData.overall_score);
  const getScoreColor = () => {
    if (overallScore >= 80) return 'text-green-600';
    if (overallScore >= 60) return 'text-blue-600';
    if (overallScore >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBadgeVariant = () => {
    if (overallScore >= 80) return 'default';
    if (overallScore >= 60) return 'secondary';
    return 'outline';
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="relative shadow-card hover:shadow-glow transition-smooth"
      >
        <Brain className={`w-4 h-4 mr-2 ${getScoreColor()}`} />
        Neuroplasticidade
        <Badge 
          variant={getScoreBadgeVariant()}
          className={`ml-2 ${getScoreColor()}`}
        >
          {overallScore}%
        </Badge>
      </Button>

      <NeuroplasticityModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}