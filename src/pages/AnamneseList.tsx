import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ClipboardList, Search, CheckCircle, AlertCircle, 
  Calendar, User, ArrowRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChildWithAnamnesis {
  id: string;
  name: string;
  birth_date: string;
  hasAnamnesis: boolean;
  anamnesisStatus?: string;
  lastUpdated?: string;
}

export default function AnamneseList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildWithAnamnesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      
      // Load all children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, name, birth_date')
        .eq('is_active', true)
        .order('name');

      if (childrenError) throw childrenError;

      // Load anamnesis status for each child
      const { data: anamnesisData, error: anamnesisError } = await supabase
        .from('child_development_anamnesis')
        .select('child_id, status, updated_at');

      if (anamnesisError) throw anamnesisError;

      const anamnesisMap = new Map(
        anamnesisData?.map(a => [a.child_id, { status: a.status, updated_at: a.updated_at }])
      );

      const enrichedChildren = childrenData?.map(child => ({
        ...child,
        hasAnamnesis: anamnesisMap.has(child.id),
        anamnesisStatus: anamnesisMap.get(child.id)?.status,
        lastUpdated: anamnesisMap.get(child.id)?.updated_at,
      })) || [];

      setChildren(enrichedChildren);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = children.filter(c => !c.hasAnamnesis).length;
  const completedCount = children.filter(c => c.hasAnamnesis && c.anamnesisStatus === 'completed').length;

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Anamnese do Desenvolvimento Infantil
          </h1>
          <p className="text-muted-foreground">
            Gerencie as anamneses de desenvolvimento dos seus pacientes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{children.length}</p>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Anamneses Completas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredChildren.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredChildren.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {child.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Nascimento: {format(new Date(child.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {child.hasAnamnesis ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {child.anamnesisStatus === 'completed' ? 'Concluída' : 'Em andamento'}
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      <Button
                        onClick={() => navigate(`/anamnese/${child.id}`)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {child.hasAnamnesis ? 'Ver/Editar' : 'Preencher'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernPageLayout>
  );
}
