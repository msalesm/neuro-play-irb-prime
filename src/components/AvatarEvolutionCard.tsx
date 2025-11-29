import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { AvatarStage } from '@/hooks/useAchievementSystem';

interface AvatarEvolutionCardProps {
  stage: AvatarStage;
  xp: number;
  nextStageXp: number;
  unlockedAccessories: string[];
}

const stageNames: Record<AvatarStage, string> = {
  1: 'Iniciante',
  2: 'Aprendiz',
  3: 'Explorador',
  4: 'Mestre',
  5: 'Lenda'
};

const stageColors: Record<AvatarStage, string> = {
  1: 'from-green-400 to-green-600',
  2: 'from-blue-400 to-blue-600',
  3: 'from-purple-400 to-purple-600',
  4: 'from-orange-400 to-orange-600',
  5: 'from-pink-500 to-purple-600'
};

export function AvatarEvolutionCard({
  stage,
  xp,
  nextStageXp,
  unlockedAccessories
}: AvatarEvolutionCardProps) {
  const progress = stage < 5 ? (xp / nextStageXp) * 100 : 100;
  const xpNeeded = stage < 5 ? nextStageXp - xp : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-br ${stageColors[stage]} text-white`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Avatar: {stageNames[stage]}
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Estágio {stage}/5
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Avatar Display */}
        <div className="flex justify-center">
          <motion.div
            className="relative"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${stageColors[stage]} flex items-center justify-center text-6xl shadow-2xl`}>
              👤
            </div>
            {/* Accessories */}
            <div className="absolute inset-0 flex items-center justify-center">
              {unlockedAccessories.slice(0, 3).map((accessory, index) => (
                <motion.div
                  key={accessory}
                  className="absolute text-2xl"
                  style={{
                    top: index === 0 ? '-10px' : index === 1 ? '50%' : 'auto',
                    bottom: index === 2 ? '-10px' : 'auto',
                    right: index === 1 ? '-10px' : '50%',
                    transform: index === 0 || index === 2 ? 'translateX(-50%)' : 'translateY(-50%)'
                  }}
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                >
                  {accessory}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* XP Progress */}
        {stage < 5 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                XP de Experiência
              </span>
              <span className="font-semibold">{xp} / {nextStageXp}</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-center text-muted-foreground">
              {xpNeeded} XP para {stageNames[Math.min(stage + 1, 5) as AvatarStage]}
            </p>
          </div>
        )}

        {stage === 5 && (
          <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-semibold text-purple-900">
              Avatar Lendário!
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Você alcançou o nível máximo de evolução
            </p>
          </div>
        )}

        {/* Unlocked Accessories */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Acessórios Desbloqueados ({unlockedAccessories.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unlockedAccessories.map((accessory, index) => (
              <motion.div
                key={index}
                className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
                whileHover={{ scale: 1.2, rotate: 10 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {accessory}
              </motion.div>
            ))}
            {unlockedAccessories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Desbloqueie conquistas para ganhar acessórios
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
