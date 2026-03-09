import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  resetError?: () => void;
}

export function ErrorFallback({ resetError }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">Algo deu errado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Nossa equipe foi notificada e está investigando o problema.
          </p>
          <Button
            onClick={() => {
              if (resetError) resetError();
              else window.location.reload();
            }}
            className="w-full"
          >
            Recarregar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
