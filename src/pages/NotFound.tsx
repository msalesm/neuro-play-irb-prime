import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-heading text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="font-heading text-2xl font-semibold mb-4">Página não encontrada</h2>
          <p className="text-muted-foreground text-lg">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={() => window.location.href = "/"}
            size="lg"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir para Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
