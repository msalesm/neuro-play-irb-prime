import { motion } from 'framer-motion';
import { Brain, Heart, Users, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DomainProgress {
  attention: number;
  emotion: number;
  social: number;
  creativity: number;
}

interface Props {
  progress: DomainProgress;
}

const domains = [
  {
    key: 'attention' as const,
    label: 'Atenção',
    icon: Brain,
    gradient: 'from-[hsl(var(--neuroplay-blue)/0.15)] to-[hsl(var(--neuroplay-blue)/0.05)]',
    iconColor: 'text-[hsl(var(--neuroplay-blue))]',
    ringColor: 'hsl(var(--neuroplay-blue))',
    route: '/games',
  },
  {
    key: 'emotion' as const,
    label: 'Emoção',
    icon: Heart,
    gradient: 'from-[hsl(var(--neuroplay-purple)/0.15)] to-[hsl(var(--neuroplay-purple)/0.05)]',
    iconColor: 'text-[hsl(var(--neuroplay-purple))]',
    ringColor: 'hsl(var(--neuroplay-purple))',
    route: '/emotion-check',
  },
  {
    key: 'social' as const,
    label: 'Social',
    icon: Users,
    gradient: 'from-[hsl(var(--neuroplay-green)/0.15)] to-[hsl(var(--neuroplay-green)/0.05)]',
    iconColor: 'text-[hsl(var(--neuroplay-green))]',
    ringColor: 'hsl(var(--neuroplay-green))',
    route: '/stories',
  },
  {
    key: 'creativity' as const,
    label: 'Criatividade',
    icon: Palette,
    gradient: 'from-[hsl(var(--neuroplay-orange)/0.15)] to-[hsl(var(--neuroplay-orange)/0.05)]',
    iconColor: 'text-[hsl(var(--neuroplay-orange))]',
    ringColor: 'hsl(var(--neuroplay-orange))',
    route: '/games',
  },
];

function CircularProgress({ value, color, size = 48 }: { value: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export function WellnessDomainCards({ progress }: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {domains.map((domain, i) => {
        const Icon = domain.icon;
        const value = progress[domain.key];

        return (
          <motion.button
            key={domain.key}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            onClick={() => navigate(domain.route)}
            className={`relative bg-gradient-to-br ${domain.gradient} rounded-3xl p-4 border border-border/50 shadow-soft text-left transition-transform active:scale-[0.97]`}
          >
            <Icon className={`h-7 w-7 ${domain.iconColor} mb-3`} />
            <p className="text-sm font-semibold text-foreground">{domain.label}</p>
            
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <CircularProgress value={value} color={domain.ringColor} size={42} />
              <span className="absolute text-[10px] font-bold text-foreground">{value}%</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
