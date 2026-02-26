import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, UserCircle, TrendingUp, AlertCircle, Calendar, Plus, LayoutGrid, List, ClipboardList, FileText, Pencil } from 'lucide-react';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { AddPatientModal } from '@/components/AddPatientModal';
import { EditPatientModal } from '@/components/EditPatientModal';
import { TherapistPatientSection } from '@/components/TherapistPatientSection';

interface Patient {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
  lastSession?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  progressTrend?: 'up' | 'stable' | 'down';
}

export default function TherapistPatients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);

      // Get children with access granted to this therapist
      const { data: accessData, error: accessError } = await supabase
        .from('child_access')
        .select(`
          child_id,
          children (
            id,
            name,
            birth_date,
            avatar_url,
            neurodevelopmental_conditions
          )
        `)
        .eq('professional_id', user?.id);

      if (accessError) throw accessError;

      const patientsList: Patient[] = await Promise.all(
        (accessData || []).map(async (access: any) => {
          const child = access.children;
          const birthDate = new Date(child.birth_date);
          const age = new Date().getFullYear() - birthDate.getFullYear();

           // Get last session
           const { data: sessions } = await supabase
             .from('game_sessions')
             .select('completed_at')
             .eq('child_profile_id', child.id)
             .order('completed_at', { ascending: false })
             .limit(1)
             .maybeSingle();

          // Calculate risk level and trend (simplified)
          const riskLevel: 'low' | 'medium' | 'high' = 'medium';
          const progressTrend: 'up' | 'stable' | 'down' = 'up';

          return {
            id: child.id,
            name: child.name,
            age,
            avatar_url: child.avatar_url,
            conditions: child.neurodevelopmental_conditions || [],
            lastSession: sessions?.completed_at,
            riskLevel,
            progressTrend
          };
        })
      );

      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'stable' | 'down') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'stable': return <div className="w-4 h-4 border-t-2 border-yellow-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  const [viewMode, setViewMode] = useState<'cards' | 'progress'>('cards');

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Meus Pacientes</h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso terapêutico de cada criança
          </p>
        </div>

        {/* Search & Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-1 border rounded-lg p-1">
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'progress' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('progress')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Paciente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress View */}
        {viewMode === 'progress' ? (
          <TherapistPatientSection 
            onViewDetails={(patientId) => navigate(`/therapist/patient/${patientId}`)}
            onAddPatient={() => setShowAddModal(true)}
          />
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-lg transition-all cursor-pointer border-l-4"
                style={{ borderLeftColor: patient.riskLevel === 'high' ? '#ef4444' : patient.riskLevel === 'medium' ? '#f59e0b' : '#22c55e' }}
                onClick={() => navigate(`/therapist/patient/${patient.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ChildAvatarDisplay
                        avatar={patient.avatar_url}
                        name={patient.name}
                        size="md"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">{patient.age} anos</p>
                      </div>
                    </div>
                    {getTrendIcon(patient.progressTrend)}
                  </div>

                  {/* Conditions */}
                  {patient.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {patient.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Risk Level */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Nível de Risco:</span>
                    <Badge className={getRiskColor(patient.riskLevel)}>
                      {patient.riskLevel === 'high' && 'Alto'}
                      {patient.riskLevel === 'medium' && 'Médio'}
                      {patient.riskLevel === 'low' && 'Baixo'}
                    </Badge>
                  </div>

                  {/* Last Session */}
                  {patient.lastSession && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Última sessão: {new Date(patient.lastSession).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPatientId(patient.id);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/anamnese/${patient.id}`);
                      }}
                    >
                      <ClipboardList className="w-4 h-4 mr-1" />
                      Anamnese
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/prontuario/${patient.id}`);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Prontuário
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <UserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum paciente encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente buscar com outros termos' : 'Você ainda não tem pacientes cadastrados'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadPatients}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        open={!!editPatientId}
        patientId={editPatientId}
        onClose={() => setEditPatientId(null)}
        onSuccess={loadPatients}
      />
    </ModernPageLayout>
  );
}
