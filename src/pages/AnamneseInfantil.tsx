import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { ChildDevelopmentAnamnesis } from '@/components/anamnesis/ChildDevelopmentAnamnesis';
import { supabase } from '@/integrations/supabase/client';

interface ChildData {
  id: string;
  name: string;
  birth_date: string;
}

export default function AnamneseInfantil() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChild();
    }
  }, [childId]);

  const loadChild = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, birth_date')
        .eq('id', childId)
        .single();

      if (error) throw error;
      setChild(data);
    } catch (error) {
      console.error('Error loading child:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!childId) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>ID do paciente não fornecido</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
        </div>
      </ModernPageLayout>
    );
  }

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  if (!child) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Paciente não encontrado</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <ChildDevelopmentAnamnesis 
          childId={child.id}
          childName={child.name}
          childBirthDate={child.birth_date}
          onComplete={() => navigate(-1)}
        />
      </div>
    </ModernPageLayout>
  );
}
