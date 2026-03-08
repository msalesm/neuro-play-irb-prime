import { cn } from '@/lib/utils';

interface ModernPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'minimal' | 'brand';
}

export function ModernPageLayout({ 
  children, 
  className,
  background = 'brand'
}: ModernPageLayoutProps) {
  const backgroundClass = {
    default: 'bg-gradient-to-br from-primary via-secondary to-primary',
    gradient: 'bg-gradient-to-br from-primary via-secondary/80 to-primary', 
    minimal: 'bg-gradient-to-br from-primary to-primary/90',
    brand: 'bg-gradient-to-b from-primary via-secondary to-primary'
  };

  return (
    <div className={cn(
      'min-h-screen text-white pb-28',
      backgroundClass[background],
      className
    )}>
      {/* Decorative elements - NeuroPlay style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}