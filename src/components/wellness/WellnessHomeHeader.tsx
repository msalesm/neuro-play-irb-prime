import { Link } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Props {
  name: string;
  avatarUrl?: string;
  cognitiveScore: number;
}

export function WellnessHomeHeader({ name, avatarUrl, cognitiveScore }: Props) {
  const initial = name.charAt(0).toUpperCase();
  const scoreColor = cognitiveScore >= 75 ? 'text-accent' : cognitiveScore >= 50 ? 'text-primary' : 'text-warning';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-5 pt-6 pb-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-soft">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground font-bold text-lg">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <p className="text-lg font-bold text-foreground">{name} 👋</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Cognitive Score */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-5 shadow-card border border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Índice Cognitivo</p>
            <p className={`text-4xl font-bold mt-1 ${scoreColor}`}>{cognitiveScore}</p>
            <p className="text-xs text-muted-foreground mt-0.5">de 100 pontos</p>
          </div>
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${cognitiveScore}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
