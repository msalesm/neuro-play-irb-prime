import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DailyMission } from '@/pages/StudentHub';

interface Props {
  nextActivity?: DailyMission;
  allCompleted: boolean;
}

export function StudentHubCTA({ nextActivity, allCompleted }: Props) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (nextActivity) {
      navigate(nextActivity.route);
    } else {
      navigate('/sistema-planeta-azul');
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Button
        onClick={handleStart}
        size="lg"
        className="w-full h-16 text-lg font-bold rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        style={{ boxShadow: 'var(--shadow-glow)' }}
      >
        {allCompleted ? (
          <>
            <PartyPopper className="h-6 w-6 mr-3" />
            Parabéns! Jogar Mais
          </>
        ) : (
          <>
            <Play className="h-6 w-6 mr-3 fill-current" />
            Começar Atividade
          </>
        )}
      </Button>
    </motion.div>
  );
}
