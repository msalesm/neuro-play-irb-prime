import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, Crown, Gem } from 'lucide-react';
import type { BadgeLevel } from '@/hooks/useAchievementSystem';

interface BadgeProgressCardProps {
  level: BadgeLevel;
  current: number;
  required: number;
  percentage: number;
  getBadgeIcon: (level: BadgeLevel) => string;
  getBadgeColor: (level: BadgeLevel) => string;
}

const badgeIcons: Record<BadgeLevel, any> = {
  bronze: Trophy,
  silver: Star,
  gold: Award,
  platinum: Crown,
  diamond: Gem
};

export function BadgeProgressCard({
  level,
  current,
  required,
  percentage,
  getBadgeIcon,
  getBadgeColor
}: BadgeProgressCardProps) {
  const Icon = badgeIcons[level];
  const nextLevel: BadgeLevel | null = 
    level === 'bronze' ? 'silver' :
    level === 'silver' ? 'gold' :
    level === 'gold' ? 'platinum' :
    level === 'platinum' ? 'diamond' : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-br ${getBadgeColor(level)} text-white`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            Badge {level.charAt(0).toUpperCase() + level.slice(1)}
          </CardTitle>
          <motion.div
            className="text-4xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            {getBadgeIcon(level)}
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{current} / {required}</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {nextLevel && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Próximo nível:</span>
              <Badge className={`bg-gradient-to-r ${getBadgeColor(nextLevel)} text-white`}>
                {getBadgeIcon(nextLevel)} {nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}
              </Badge>
            </div>
            <span className="text-sm font-medium">{required - current} restantes</span>
          </div>
        )}

        {level === 'diamond' && (
          <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-semibold text-purple-900">
              Nível Máximo Alcançado!
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Você é um mestre das conquistas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
