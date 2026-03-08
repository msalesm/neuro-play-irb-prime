import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  message?: string;
  className?: string;
}

export const Loading = ({ message = "Carregando...", className = "" }: LoadingProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[200px]", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};

export const PageLoading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse mx-auto" />
          <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">Preparando sua experiência...</p>
      </div>
    </div>
  );
};

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl border border-border bg-card p-6 animate-pulse", className)}>
    <div className="h-4 bg-muted rounded w-1/3 mb-4" />
    <div className="space-y-3">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <SkeletonCard className="h-28" />
    <div className="grid grid-cols-3 gap-4">
      <SkeletonCard className="h-24" />
      <SkeletonCard className="h-24" />
      <SkeletonCard className="h-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonCard className="lg:col-span-2 h-64" />
      <SkeletonCard className="h-64" />
    </div>
  </div>
);
