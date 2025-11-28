import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Clock, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JogoPlaneta } from '@/types/planeta';

interface DailyMissionCardProps {
  jogo: JogoPlaneta;
  planetaNome: string;
  planetaCor: string;
  planetaIcone: string;
  recomendadoPorIA?: boolean;
  onStart?: () => void;
}

export const DailyMissionCard = ({
  jogo,
  planetaNome,
  planetaCor,
  planetaIcone,
  recomendadoPorIA = false,
  onStart
}: DailyMissionCardProps) => {
  const navigate = useNavigate();

  const handleStart = () => {
    if (onStart) onStart();
    navigate(jogo.rota);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="relative overflow-hidden border-2 transition-all duration-300"
        style={{ 
          borderColor: planetaCor,
          boxShadow: recomendadoPorIA ? `0 0 20px ${planetaCor}40` : undefined
        }}
      >
        {recomendadoPorIA && (
          <div 
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{ background: `radial-gradient(circle, ${planetaCor} 0%, transparent 70%)` }}
          />
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${planetaCor}20` }}
              >
                {jogo.icone}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{jogo.nome}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{planetaIcone}</span>
                  <span>{planetaNome}</span>
                </div>
              </div>
            </div>

            {recomendadoPorIA && (
              <Badge 
                className="flex items-center gap-1"
                style={{ 
                  backgroundColor: `${planetaCor}20`,
                  color: planetaCor,
                  borderColor: planetaCor
                }}
              >
                <Sparkles className="w-3 h-3" />
                IA Recomenda
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            {jogo.descricao}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{jogo.duracao} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4" />
              <span>Nível {jogo.dificuldade}</span>
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full"
            style={{ 
              backgroundColor: planetaCor,
              color: 'white'
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            {jogo.completado ? 'Jogar Novamente' : 'Iniciar Missão'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};