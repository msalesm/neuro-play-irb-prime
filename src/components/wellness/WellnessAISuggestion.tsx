import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  description: string;
  duration: string;
  route: string;
}

export function WellnessAISuggestion({ title, description, duration, route }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.65 }}
      className="mx-5"
    >
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 rounded-3xl p-5 border border-primary/15 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-0.5">Sugestão IA</p>
            <p className="text-sm font-bold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
              <Button
                size="sm"
                onClick={() => navigate(route)}
                className="rounded-full h-8 px-4 text-xs font-semibold"
              >
                Iniciar <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
