/**
 * Progress Ring (SVG)
 * 
 * Circular progress indicator for cognitive domain scores.
 * Uses cognitive domain colors from the design system.
 */

import { cn } from '@/lib/utils';

type CognitiveDomain = 'attention' | 'memory' | 'language' | 'reasoning' | 'motor';

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  /** Size in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
  /** Cognitive domain for color */
  domain?: CognitiveDomain;
  /** Custom color (overrides domain) */
  color?: string;
  /** Show value text in center */
  showValue?: boolean;
  /** Label below value */
  label?: string;
  className?: string;
}

const domainColorMap: Record<CognitiveDomain, string> = {
  attention: 'hsl(0 68% 71%)',      // coral
  memory: 'hsl(244 98% 69%)',       // roxo
  language: 'hsl(174 58% 55%)',     // mint
  reasoning: 'hsl(48 100% 62%)',    // amarelo
  motor: 'hsl(160 52% 73%)',        // verde água
};

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 5,
  domain = 'attention',
  color,
  showValue = true,
  label,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const strokeColor = color || domainColorMap[domain];

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-animate"
        />
      </svg>

      {showValue && (
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-sm-mobile font-bold text-foreground">
            {Math.round(value)}
          </span>
        </div>
      )}

      {label && (
        <span className="text-xs-mobile text-muted-foreground text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Progress Ring Group — displays multiple rings side by side
 */
interface ProgressRingGroupProps {
  items: Array<{
    value: number;
    domain: CognitiveDomain;
    label: string;
  }>;
  size?: number;
  className?: string;
}

export function ProgressRingGroup({ items, size = 56, className }: ProgressRingGroupProps) {
  return (
    <div className={cn('flex items-start justify-around gap-2', className)}>
      {items.map((item) => (
        <div key={item.domain} className="relative flex flex-col items-center">
          <ProgressRing
            value={item.value}
            domain={item.domain}
            size={size}
            showValue={true}
            label={item.label}
          />
        </div>
      ))}
    </div>
  );
}
