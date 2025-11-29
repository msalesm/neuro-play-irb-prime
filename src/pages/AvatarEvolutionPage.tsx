import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { AvatarCustomization } from '@/components/AvatarCustomization';
import { useAuth } from '@/hooks/useAuth';
import { useAvatarEvolution } from '@/hooks/useAvatarEvolution';
import { supabase } from '@/integrations/supabase/client';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';

export default function AvatarEvolutionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [childId, setChildId] = useState<string | null>(null);
  const { evolution, loading, equipAccessory } = useAvatarEvolution(childId);

  useEffect(() => {
    if (user) {
      loadChildId();
    }
  }, [user]);

  const loadChildId = async () => {
    try {
      const { data: children, error } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user?.id)
        .limit(1)
        .single();

      if (error) throw error;
      if (children) {
        setChildId(children.id);
      }
    } catch (error) {
      console.error('Error loading child:', error);
    }
  };

  return (
    <>
      <PlatformOnboarding pageName="avatar-evolution" />
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard-pais')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Evolução do Avatar
            </h1>
            <p className="text-xl text-muted-foreground">
              Personalize e evolua seu avatar completando planetas e conquistando badges
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : evolution ? (
            <div data-tour="avatar-display">
              <AvatarCustomization
                evolution={evolution}
                onEquipAccessory={equipAccessory}
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Nenhum perfil de criança encontrado
              </p>
            </div>
          )}
        </div>
      </ModernPageLayout>
    </>
  );
}
