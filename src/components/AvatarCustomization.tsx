import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { EvolutionaryAvatar } from './EvolutionaryAvatar';
import { AvatarEvolution, AVATAR_LEVELS, AVATAR_ACCESSORIES } from '@/types/avatar';
import { cn } from '@/lib/utils';

interface AvatarCustomizationProps {
  evolution: AvatarEvolution;
  onEquipAccessory: (accessoryId: string) => void;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-amber-500'
};

export const AvatarCustomization = ({ evolution, onEquipAccessory }: AvatarCustomizationProps) => {
  const currentLevelData = AVATAR_LEVELS.find(l => l.level === evolution.currentLevel);
  const nextLevelData = AVATAR_LEVELS.find(l => l.level === evolution.currentLevel + 1);
  
  const progressToNextLevel = nextLevelData
    ? (evolution.totalPlanetsCompleted / nextLevelData.planetsRequired) * 100
    : 100;

  const groupedAccessories = {
    hat: AVATAR_ACCESSORIES.filter(acc => acc.type === 'hat'),
    glasses: AVATAR_ACCESSORIES.filter(acc => acc.type === 'glasses'),
    badge: AVATAR_ACCESSORIES.filter(acc => acc.type === 'badge'),
    wings: AVATAR_ACCESSORIES.filter(acc => acc.type === 'wings'),
    aura: AVATAR_ACCESSORIES.filter(acc => acc.type === 'aura'),
    crown: AVATAR_ACCESSORIES.filter(acc => acc.type === 'crown'),
  };

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <EvolutionaryAvatar
              avatar={evolution.baseAvatar}
              level={evolution.currentLevel}
              equippedAccessories={evolution.equippedAccessories}
              size="2xl"
              showEffects={true}
            />
            
            <div className="text-center">
              <h3 className="text-2xl font-bold">{evolution.baseAvatar.name}</h3>
              <p className="text-muted-foreground">{currentLevelData?.name}</p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {evolution.equippedAccessories.map(accId => {
                const accessory = AVATAR_ACCESSORIES.find(a => a.id === accId);
                return accessory ? (
                  <Badge
                    key={accId}
                    variant="secondary"
                    className={cn('text-white border-0', rarityColors[accessory.rarity])}
                  >
                    {accessory.emoji} {accessory.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      {nextLevelData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Progresso para Nível {nextLevelData.level}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Planetas completados</span>
              <span className="font-semibold">
                {evolution.totalPlanetsCompleted} / {nextLevelData.planetsRequired}
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Complete mais {nextLevelData.planetsRequired - evolution.totalPlanetsCompleted} planeta(s) 
              para desbloquear <strong>{nextLevelData.name}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Accessories Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Acessórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="crown">👑</TabsTrigger>
              <TabsTrigger value="hat">🎩</TabsTrigger>
              <TabsTrigger value="glasses">🕶️</TabsTrigger>
              <TabsTrigger value="wings">🦅</TabsTrigger>
              <TabsTrigger value="badge">🥉</TabsTrigger>
              <TabsTrigger value="aura">✨</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {AVATAR_ACCESSORIES.map(accessory => {
                const isUnlocked = evolution.unlockedAccessories.includes(accessory.id);
                const isEquipped = evolution.equippedAccessories.includes(accessory.id);

                return (
                  <motion.div
                    key={accessory.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                      isEquipped ? 'border-primary bg-primary/5' : 'border-border',
                      isUnlocked ? 'hover:border-primary/50 cursor-pointer' : 'opacity-50'
                    )}
                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                    onClick={() => isUnlocked && onEquipAccessory(accessory.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{accessory.emoji}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{accessory.name}</span>
                          <Badge
                            variant="secondary"
                            className={cn('text-white text-xs border-0', rarityColors[accessory.rarity])}
                          >
                            {accessory.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isUnlocked
                            ? `Desbloqueado: ${accessory.unlockCondition.value} planetas`
                            : `Requer ${accessory.unlockCondition.value} planetas`}
                        </p>
                      </div>
                    </div>

                    {isUnlocked ? (
                      isEquipped ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Button size="sm" variant="outline">Equipar</Button>
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </motion.div>
                );
              })}
            </TabsContent>

            {Object.entries(groupedAccessories).map(([type, accessories]) => (
              <TabsContent key={type} value={type} className="space-y-3">
                {accessories.map(accessory => {
                  const isUnlocked = evolution.unlockedAccessories.includes(accessory.id);
                  const isEquipped = evolution.equippedAccessories.includes(accessory.id);

                  return (
                    <motion.div
                      key={accessory.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                        isEquipped ? 'border-primary bg-primary/5' : 'border-border',
                        isUnlocked ? 'hover:border-primary/50 cursor-pointer' : 'opacity-50'
                      )}
                      whileHover={isUnlocked ? { scale: 1.02 } : {}}
                      onClick={() => isUnlocked && onEquipAccessory(accessory.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{accessory.emoji}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{accessory.name}</span>
                            <Badge
                              variant="secondary"
                              className={cn('text-white text-xs border-0', rarityColors[accessory.rarity])}
                            >
                              {accessory.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isUnlocked
                              ? `Desbloqueado: ${accessory.unlockCondition.value} planetas`
                              : `Requer ${accessory.unlockCondition.value} planetas`}
                          </p>
                        </div>
                      </div>

                      {isUnlocked ? (
                        isEquipped ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Button size="sm" variant="outline">Equipar</Button>
                        )
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </motion.div>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
