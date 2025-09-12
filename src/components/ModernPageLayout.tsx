import { cn } from '@/lib/utils';

interface ModernPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'minimal';
}

export function ModernPageLayout({ 
  children, 
  className,
  background = 'default'
}: ModernPageLayoutProps) {
  const backgroundClass = {
    default: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    gradient: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900', 
    minimal: 'bg-gradient-to-br from-slate-900 to-slate-800'
  };

  return (
    <div className={cn(
      'min-h-screen text-white pb-24',
      backgroundClass[background],
      className
    )}>
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}