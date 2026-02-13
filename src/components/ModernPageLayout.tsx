import { cn } from '@/lib/utils';

interface ModernPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'minimal' | 'irb';
}

export function ModernPageLayout({ 
  children, 
  className,
  background = 'irb'
}: ModernPageLayoutProps) {
  const backgroundClass = {
    default: 'bg-gradient-to-br from-[hsl(199,100%,11%)] via-[hsl(194,100%,22%)] to-[hsl(199,100%,11%)]',
    gradient: 'bg-gradient-to-br from-[hsl(199,100%,11%)] via-[hsl(194,100%,30%)] to-[hsl(199,100%,11%)]', 
    minimal: 'bg-gradient-to-br from-[hsl(199,100%,11%)] to-[hsl(199,100%,8%)]',
    irb: 'bg-gradient-to-b from-[hsl(199,100%,11%)] via-[hsl(194,100%,22%)] to-[hsl(199,100%,11%)]'
  };

  return (
    <div className={cn(
      'min-h-screen text-white pb-28',
      backgroundClass[background],
      className
    )}>
      {/* Decorative elements - IRB Prime style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-[hsl(194,100%,22%)]/20 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-[hsl(40,55%,51%)]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[hsl(194,100%,22%)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}