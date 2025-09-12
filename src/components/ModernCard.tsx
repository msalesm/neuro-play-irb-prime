import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  glassy?: boolean;
  hover?: boolean;
}

export function ModernCard({ 
  children, 
  className,
  gradient = 'from-purple-500/10 to-blue-500/10',
  glassy = true,
  hover = true
}: ModernCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-white/20',
      glassy && 'backdrop-blur-sm bg-white/10',
      hover && 'hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1',
      className
    )}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
}