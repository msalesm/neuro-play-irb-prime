/**
 * Hero Banner
 * 
 * Gradient banner with CTA for the top of dashboards.
 * Used on home screens to highlight next action.
 */

import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaRoute?: string;
  onCtaClick?: () => void;
  icon?: LucideIcon;
  gradient?: 'primary' | 'playful' | 'therapeutic' | 'gold';
  className?: string;
  children?: React.ReactNode;
}

const gradientMap = {
  primary: 'bg-gradient-primary',
  playful: 'bg-gradient-playful',
  therapeutic: 'bg-gradient-therapeutic',
  gold: 'bg-gradient-gold',
};

export function HeroBanner({
  title,
  subtitle,
  ctaLabel,
  ctaRoute,
  onCtaClick,
  icon: Icon,
  gradient = 'primary',
  className,
  children,
}: HeroBannerProps) {
  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-5 text-primary-foreground min-h-[120px]',
        gradientMap[gradient],
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -right-10 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h2 className="text-lg-mobile font-bold leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm-mobile opacity-90 leading-snug">{subtitle}</p>
          )}
          {ctaLabel && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm-mobile font-semibold">{ctaLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
          {children}
        </div>

        {Icon && (
          <div className="flex-shrink-0 w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
        )}
      </div>
    </div>
  );

  if (ctaRoute) {
    return (
      <Link to={ctaRoute} className="block tap-feedback">
        {content}
      </Link>
    );
  }

  if (onCtaClick) {
    return (
      <button onClick={onCtaClick} className="block w-full text-left tap-feedback">
        {content}
      </button>
    );
  }

  return content;
}
