import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Brain, Target, Music, Calculator, Users, Clock } from 'lucide-react';

const recommended = [
  {
    id: 'memoria-colorida',
    title: 'Missão Memória',
    duration: '3 min',
    icon: Target,
    gradient: 'from-primary to-secondary',
    path: '/games/memoria-colorida',
  },
  {
    id: 'logica-rapida',
    title: 'Desafio da Atenção',
    duration: '2 min',
    icon: Brain,
    gradient: 'from-secondary to-[hsl(var(--neuroplay-orange))]',
    path: '/games/logica-rapida',
  },
  {
    id: 'ritmo-musical',
    title: 'Ritmo Musical',
    duration: '4 min',
    icon: Music,
    gradient: 'from-accent to-primary',
    path: '/games/ritmo-musical',
  },
  {
    id: 'aventura-numeros',
    title: 'Aventura Números',
    duration: '5 min',
    icon: Calculator,
    gradient: 'from-[hsl(var(--neuroplay-orange))] to-[hsl(var(--neuroplay-yellow))]',
    path: '/games/aventura-numeros',
  },
  {
    id: 'social-scenarios',
    title: 'Cenários Sociais',
    duration: '8 min',
    icon: Users,
    gradient: 'from-primary to-accent',
    path: '/games/social-scenarios',
  },
];

export function StudentHubRecommended() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-base font-bold text-foreground mb-3">Atividades recomendadas</h2>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {recommended.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              key={game.id}
              to={game.path}
              className="flex-shrink-0 w-36"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow h-full">
                <div className={`h-20 bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-semibold text-foreground leading-tight">{game.title}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{game.duration}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}
