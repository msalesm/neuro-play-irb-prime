import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Lock, Star, Sparkles } from 'lucide-react';

interface World {
  id: string;
  name: string;
  emoji: string;
  color: string;
  route: string;
  unlockLevel: number;
  description: string;
}

const WORLDS: World[] = [
  {
    id: 'forest',
    name: 'Floresta da Atenção',
    emoji: '🌲',
    color: 'from-green-400/20 to-green-600/20',
    route: '/sistema-planeta-azul?domain=attention',
    unlockLevel: 1,
    description: 'Treine seu foco!',
  },
  {
    id: 'planet',
    name: 'Planeta da Memória',
    emoji: '🪐',
    color: 'from-purple-400/20 to-purple-600/20',
    route: '/sistema-planeta-azul?domain=memory',
    unlockLevel: 2,
    description: 'Expanda sua mente!',
  },
  {
    id: 'city',
    name: 'Cidade da Lógica',
    emoji: '🏙️',
    color: 'from-blue-400/20 to-blue-600/20',
    route: '/sistema-planeta-azul?domain=flexibility',
    unlockLevel: 3,
    description: 'Resolva desafios!',
  },
  {
    id: 'ocean',
    name: 'Oceano das Emoções',
    emoji: '🌊',
    color: 'from-cyan-400/20 to-cyan-600/20',
    route: '/stories',
    unlockLevel: 4,
    description: 'Explore sentimentos!',
  },
  {
    id: 'volcano',
    name: 'Vulcão da Coragem',
    emoji: '🌋',
    color: 'from-orange-400/20 to-orange-600/20',
    route: '/sistema-planeta-azul?domain=persistence',
    unlockLevel: 5,
    description: 'Nunca desista!',
  },
];

interface Props {
  currentLevel: number;
}

export function StudentHubWorlds({ currentLevel }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Mundos para Explorar
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {WORLDS.map((world, index) => {
          const isUnlocked = currentLevel >= world.unlockLevel;
          return (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              {isUnlocked ? (
                <Link to={world.route}>
                  <Card className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-primary/20`}>
                    <CardContent className={`p-4 bg-gradient-to-br ${world.color}`}>
                      <div className="text-3xl mb-2">{world.emoji}</div>
                      <p className="text-sm font-bold leading-tight">{world.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{world.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-3 w-3 text-primary fill-primary" />
                        <span className="text-xs text-muted-foreground">Nível {world.unlockLevel}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="overflow-hidden opacity-50">
                  <CardContent className="p-4 bg-muted/30 relative">
                    <div className="text-3xl mb-2 grayscale">{world.emoji}</div>
                    <p className="text-sm font-bold leading-tight">{world.name}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Nível {world.unlockLevel}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
