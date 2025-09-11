import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  className?: string;
}

export const Loading = ({ message = "Carregando...", className = "" }: LoadingProps) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};

export const PageLoading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loading message="Preparando sua experiência..." className="min-h-0" />
    </div>
  );
};