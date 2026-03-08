import { motion } from 'framer-motion';
import type { ChildData, TimeOfDay } from '@/pages/StudentHub';

interface Props {
  childData: ChildData;
  timeOfDay: TimeOfDay;
}

export function StudentHubGreeting({ childData, timeOfDay }: Props) {
  const greetings: Record<TimeOfDay, string> = {
    morning: 'Bom dia',
    afternoon: 'Boa tarde',
    night: 'Boa noite',
  };

  const subtitles: Record<TimeOfDay, string> = {
    morning: 'Vamos começar o dia com uma aventura? 🚀',
    afternoon: 'Pronto para mais uma missão? 🎯',
    night: 'Que tal uma última atividade? 🌙',
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="pt-4 text-center"
    >
      <h1 className="text-2xl font-bold text-foreground">
        {greetings[timeOfDay]}, {childData.name}! 👋
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        {subtitles[timeOfDay]}
      </p>
    </motion.div>
  );
}
