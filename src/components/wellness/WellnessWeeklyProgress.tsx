import { motion } from 'framer-motion';

interface Props {
  weekData: { day: string; value: number }[];
}

export function WellnessWeeklyProgress({ weekData }: Props) {
  const maxValue = Math.max(...weekData.map(d => d.value), 1);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mx-5 bg-card rounded-3xl p-5 shadow-card border border-border"
    >
      <p className="text-sm font-semibold text-foreground mb-4">Progresso Semanal</p>
      
      <div className="flex items-end justify-between gap-2 h-24">
        {weekData.map((d, i) => {
          const height = (d.value / maxValue) * 100;
          const isToday = i === weekData.length - 1;

          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 8)}%` }}
                transition={{ delay: 0.6 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                className={`w-full max-w-[28px] rounded-xl ${
                  isToday
                    ? 'bg-gradient-to-t from-primary to-primary/70'
                    : d.value > 0
                    ? 'bg-primary/25'
                    : 'bg-muted'
                }`}
              />
              <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
