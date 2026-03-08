import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AvatarSelection } from './AvatarSelection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AvatarData {
  id: string;
  name: string;
  emoji: string;
  category: 'animals' | 'robots' | 'heroes';
}

interface AvatarSelectionModalProps {
  open: boolean;
  onComplete: () => void;
  childId?: string;
}

export const AvatarSelectionModal = ({ open, onComplete, childId }: AvatarSelectionModalProps) => {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedAvatar) {
      toast.error('Selecione um avatar primeiro');
      return;
    }

    if (!childId) {
      toast.error('ID da criança não encontrado');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('children')
        .update({ 
          avatar_url: JSON.stringify(selectedAvatar)
        })
        .eq('id', childId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Avatar selecionado com sucesso! 🎉');
      onComplete();
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast.error('Erro ao salvar avatar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bem-vindo ao NeuroPlay! 🌟</DialogTitle>
          <DialogDescription>
            Antes de começar sua jornada, escolha um avatar que represente você
          </DialogDescription>
        </DialogHeader>

        <AvatarSelection
          onSelect={setSelectedAvatar}
          selectedAvatar={selectedAvatar || undefined}
        />

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleSave}
            disabled={!selectedAvatar || saving}
            className="flex-1"
          >
            {saving ? 'Salvando...' : 'Começar Aventura'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};