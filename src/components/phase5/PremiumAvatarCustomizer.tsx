import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, Crown, Lock, Check, Moon, Zap, 
  Palette, PawPrint, ImageIcon, Stars
} from 'lucide-react';
import { useAvatarPremium, AvatarItem } from '@/hooks/useAvatarPremium';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PremiumAvatarCustomizerProps {
  childId?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  accessory: <Sparkles className="h-4 w-4" />,
  clothing: <Palette className="h-4 w-4" />,
  pet: <PawPrint className="h-4 w-4" />,
  background: <ImageIcon className="h-4 w-4" />,
  effect: <Stars className="h-4 w-4" />
};

const rarityColors: Record<string, string> = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-amber-400 bg-amber-50'
};

const modeIcons: Record<string, React.ReactNode> = {
  normal: <Sparkles className="h-5 w-5" />,
  calm: <Moon className="h-5 w-5" />,
  focus: <Zap className="h-5 w-5" />
};

export function PremiumAvatarCustomizer({ childId }: PremiumAvatarCustomizerProps) {
  const { t } = useLanguage();
  const {
    allItems,
    unlockedItems,
    emotionalState,
    worlds,
    loading,
    equipItem,
    unequipItem,
    isItemUnlocked,
    getEquippedItems,
    setMode
  } = useAvatarPremium(childId);

  const [selectedCategory, setSelectedCategory] = useState('accessory');
  const equippedItems = getEquippedItems();

  const categoryLabels: Record<string, string> = {
    accessory: t('phase5.premiumAvatar.categories.accessories'),
    clothing: t('phase5.premiumAvatar.categories.clothes'),
    pet: t('phase5.premiumAvatar.pets'),
    background: t('phase5.premiumAvatar.categories.background'),
    effect: t('phase5.premiumAvatar.categories.effects')
  };

  const modeLabels: Record<string, string> = {
    normal: t('phase5.premiumAvatar.normalMode'),
    calm: t('phase5.premiumAvatar.calmMode'),
    focus: t('phase5.premiumAvatar.focusMode')
  };

  const categoryItems = allItems.filter(item => item.item_type === selectedCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!childId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {t('phase5.premiumAvatar.selectChild')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square max-w-sm mx-auto bg-gradient-to-b from-primary/10 to-primary/5">
          {/* Avatar placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          {/* Equipped items overlay */}
          {equippedItems.map(item => (
            <div 
              key={item.id}
              className="absolute"
              style={{
                top: item.item?.item_type === 'accessory' ? '10%' : 
                     item.item?.item_type === 'pet' ? '70%' : '0',
                left: item.item?.item_type === 'pet' ? '70%' : '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <Badge variant="outline" className="bg-background/80">
                {item.item?.name}
              </Badge>
            </div>
          ))}
          
          {/* Mood indicator */}
          {emotionalState && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-background/80">
                {emotionalState.current_mood}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Mode Selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('phase5.premiumAvatar.avatarMode')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['normal', 'calm', 'focus'] as const).map(mode => (
              <Button
                key={mode}
                variant={emotionalState?.mode === mode ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMode(mode)}
              >
                {modeIcons[mode]}
                <span className="ml-2">
                  {modeLabels[mode]}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Customization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            {t('phase5.premiumAvatar.customize')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  {categoryIcons[key]}
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categoryItems.map(item => {
                  const isUnlocked = isItemUnlocked(item.id);
                  const isEquipped = equippedItems.some(e => e.item_id === item.id);
                  
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isUnlocked={isUnlocked}
                      isEquipped={isEquipped}
                      onEquip={() => equipItem(item.id)}
                      onUnequip={() => unequipItem(item.id)}
                      categoryIcons={categoryIcons}
                    />
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Unlockable Worlds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stars className="h-5 w-5 text-primary" />
            {t('phase5.premiumAvatar.unlockableWorlds')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {worlds.map(world => (
              <div 
                key={world.id}
                className={cn(
                  "p-4 rounded-lg border text-center",
                  world.is_premium ? "border-amber-300 bg-amber-50" : "border-muted"
                )}
              >
                <div className="text-3xl mb-2">
                  {world.theme === 'ocean' ? '🌊' :
                   world.theme === 'space' ? '🚀' :
                   world.theme === 'forest' ? '🌲' :
                   world.theme === 'city' ? '🏙️' : '🏰'}
                </div>
                <p className="font-medium text-sm">{world.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t('phase5.premiumAvatar.level')} {world.unlock_value}
                </p>
                {world.is_premium && (
                  <Badge className="mt-2 text-xs" variant="outline">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ItemCardProps {
  item: AvatarItem;
  isUnlocked: boolean;
  isEquipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  categoryIcons: Record<string, React.ReactNode>;
}

function ItemCard({ item, isUnlocked, isEquipped, onEquip, onUnequip, categoryIcons }: ItemCardProps) {
  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border-2 transition-all cursor-pointer",
        rarityColors[item.rarity],
        isEquipped && "ring-2 ring-primary",
        !isUnlocked && "opacity-60"
      )}
      onClick={isUnlocked ? (isEquipped ? onUnequip : onEquip) : undefined}
    >
      {/* Rarity badge */}
      <Badge 
        variant="outline" 
        className={cn(
          "absolute top-1 right-1 text-xs",
          item.rarity === 'legendary' && "bg-amber-100 border-amber-400",
          item.rarity === 'epic' && "bg-purple-100 border-purple-400",
          item.rarity === 'rare' && "bg-blue-100 border-blue-400"
        )}
      >
        {item.rarity === 'legendary' ? '★★★' :
         item.rarity === 'epic' ? '★★' :
         item.rarity === 'rare' ? '★' : ''}
      </Badge>

      {/* Item image */}
      <div className="aspect-square rounded bg-background/50 mb-2 flex items-center justify-center">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          categoryIcons[item.item_type]
        )}
      </div>

      {/* Item name */}
      <p className="text-xs font-medium text-center truncate">{item.name}</p>

      {/* Lock/Equipped indicator */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      
      {isEquipped && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Premium indicator */}
      {item.is_premium && (
        <Crown className="absolute top-1 left-1 h-3 w-3 text-amber-500" />
      )}
    </div>
  );
}
