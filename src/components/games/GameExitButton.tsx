import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GameExitButtonProps {
  onExit?: () => void;
  returnTo?: string;
  showProgress?: boolean;
  currentProgress?: number;
  totalProgress?: number;
  variant?: 'back' | 'quit' | 'home';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  confirmMessage?: string;
}

export const GameExitButton: React.FC<GameExitButtonProps> = ({
  onExit,
  returnTo = '/games',
  showProgress = false,
  currentProgress = 0,
  totalProgress = 0,
  variant = 'back',
  size = 'default',
  className,
  confirmMessage
}) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
    navigate(returnTo);
  };

  const handleClick = () => {
    // Se tem progresso ou mensagem customizada, mostrar diálogo de confirmação
    if (showProgress && currentProgress > 0 || confirmMessage) {
      setShowDialog(true);
    } else {
      handleExit();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'quit':
        return <X className="w-4 h-4" />;
      default:
        return <ArrowLeft className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (variant) {
      case 'home':
        return 'Início';
      case 'quit':
        return 'Sair';
      default:
        return 'Voltar';
    }
  };

  return (
    <>
      <Button
        variant={variant === 'quit' ? 'destructive' : 'outline'}
        size={size}
        onClick={handleClick}
        className={cn("gap-2", className)}
      >
        {getIcon()}
        {getLabel()}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {variant === 'quit' ? 'Tem certeza que deseja sair?' : 'Deseja voltar?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {confirmMessage ? (
                <p>{confirmMessage}</p>
              ) : (
                <>
                  {showProgress && currentProgress > 0 && (
                    <>
                      <p>Você está no meio de uma sessão.</p>
                      <p className="font-semibold">
                        Progresso atual: {currentProgress}/{totalProgress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ⚠️ Se sair agora, seu progresso não será salvo.
                      </p>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Jogando</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {variant === 'quit' ? 'Sair Mesmo Assim' : 'Voltar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
