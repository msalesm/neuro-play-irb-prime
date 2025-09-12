import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ModernMetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  gradient?: string;
  progress?: {
    value: number;
    max?: number;
    label?: string;
  };
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export function ModernMetricCard({
  title,
  value,
  description,
  icon: Icon,
  gradient = 'from-purple-500/20 to-blue-500/20',
  progress,
  badge,
  trend,
  className
}: ModernMetricCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-blue-400'
  };

  return (
    <Card className={cn(
      'relative overflow-hidden backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20',
      className
    )}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge 
              variant={badge.variant || 'secondary'}
              className={cn('text-xs', badge.color)}
            >
              {badge.label}
            </Badge>
          )}
          {Icon && <Icon className="h-4 w-4 text-white/60" />}
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            'text-2xl font-bold text-white',
            trend && trendColors[trend]
          )}>
            {value}
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-white/60 mb-3">
            {description}
          </p>
        )}
        
        {progress && (
          <div className="space-y-2">
            <Progress 
              value={progress.value} 
              max={progress.max} 
              className="h-2 bg-white/20" 
            />
            {progress.label && (
              <p className="text-xs text-white/60">
                {progress.label}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}