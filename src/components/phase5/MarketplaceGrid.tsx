import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, ShoppingCart, Star, Download, Coins, 
  BookOpen, Gamepad2, Route, Calendar, Filter,
  CheckCircle, Crown
} from 'lucide-react';
import { useMarketplace, MarketplaceItem } from '@/hooks/useMarketplace';
import { useLanguage } from '@/contexts/LanguageContext';

const typeIcons: Record<string, React.ReactNode> = {
  social_story: <BookOpen className="h-4 w-4" />,
  learning_trail: <Route className="h-4 w-4" />,
  mini_game: <Gamepad2 className="h-4 w-4" />,
  routine_template: <Calendar className="h-4 w-4" />
};

export function MarketplaceGrid() {
  const { t } = useLanguage();
  const { 
    items, 
    coins, 
    loading, 
    purchaseItem, 
    hasPurchased,
    loadItems 
  } = useMarketplace();
  
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const typeLabels: Record<string, string> = {
    social_story: t('phase5.marketplace.socialStories'),
    learning_trail: t('phase5.marketplace.educationalTrails'),
    mini_game: t('phase5.marketplace.therapeuticGames'),
    routine_template: t('phase5.marketplace.routines')
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || item.item_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with coins */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('phase5.marketplace.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="font-bold text-yellow-700 dark:text-yellow-300">{coins.balance}</span>
          <span className="text-sm text-yellow-600 dark:text-yellow-400">{t('phase5.marketplace.coins')}</span>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">{t('phase5.marketplace.all')}</TabsTrigger>
          <TabsTrigger value="social_story" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {t('phase5.marketplace.stories')}
          </TabsTrigger>
          <TabsTrigger value="learning_trail" className="flex items-center gap-1">
            <Route className="h-3 w-3" />
            {t('phase5.marketplace.trails')}
          </TabsTrigger>
          <TabsTrigger value="mini_game" className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3" />
            {t('phase5.marketplace.games')}
          </TabsTrigger>
          <TabsTrigger value="routine_template" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {t('phase5.marketplace.routines')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('phase5.marketplace.noItems')}</p>
              <p className="text-sm">{t('phase5.marketplace.adjustFilters')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <MarketplaceItemCard
                  key={item.id}
                  item={item}
                  isPurchased={hasPurchased(item.id)}
                  onPurchase={() => purchaseItem(item.id)}
                  canAfford={coins.balance >= item.price_coins}
                  typeLabels={typeLabels}
                  t={t}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  isPurchased: boolean;
  onPurchase: () => void;
  canAfford: boolean;
  typeLabels: Record<string, string>;
  t: (key: string) => string;
}

function MarketplaceItemCard({ item, isPurchased, onPurchase, canAfford, typeLabels, t }: MarketplaceItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Preview Image */}
      {item.preview_url && (
        <div className="aspect-video bg-muted">
          <img 
            src={item.preview_url} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeIcons[item.item_type]}
            <Badge variant="secondary" className="text-xs">
              {typeLabels[item.item_type]}
            </Badge>
          </div>
          {item.is_premium_only && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500">
              <Crown className="h-3 w-3 mr-1" />
              {t('phase5.marketplace.premium')}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        
        {/* Creator */}
        {item.creator && (
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="text-muted-foreground">{t('phase5.marketplace.by')}:</span>
            <span className="font-medium">{item.creator.display_name}</span>
            {item.creator.credentials?.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {item.creator.credentials[0]}
              </Badge>
            )}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {item.rating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {item.download_count}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {isPurchased ? (
          <Button className="w-full" variant="secondary" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('phase5.marketplace.purchased')}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onPurchase}
            disabled={!canAfford}
          >
            <Coins className="h-4 w-4 mr-2" />
            {item.price_coins > 0 ? `${item.price_coins} ${t('phase5.marketplace.coins')}` : t('phase5.marketplace.free')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
