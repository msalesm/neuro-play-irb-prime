import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserCircle, TrendingUp, Calendar, Plus, LayoutGrid, List, ClipboardList, FileText, Pencil } from 'lucide-react';
import { PatientAvatar } from '@/components/clinical/PatientAvatar';
import { AddPatientModal } from '@/components/therapist/AddPatientModal';
import { EditPatientModal } from '@/components/therapist/EditPatientModal';
import { TherapistPatientSection } from '@/components/therapist/TherapistPatientSection';
import { SectionHeader } from '@/components/mobile/SectionHeader';

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
  const isMobile = useIsMobile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'progress'>('cards');

  useEffect(() => {
    if (user) loadPatients();
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredPatients(patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data: accessData, error: accessError } = await supabase
        .from('child_access')
        .select(`child_id, children (id, name, birth_date, avatar_url, neurodevelopmental_conditions)`)
        .eq('professional_id', user?.id);

      if (accessError) throw accessError;

      const patientsList: Patient[] = await Promise.all(
        (accessData || []).map(async (access: any) => {
          const child = access.children;
          const birthDate = new Date(child.birth_date);
          const age = new Date().getFullYear() - birthDate.getFullYear();

          const { data: sessions } = await supabase
            .from('game_sessions')
            .select('completed_at')
            .eq('child_profile_id', child.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: child.id,
            name: child.name,
            age,
            avatar_url: child.avatar_url,
            conditions: child.neurodevelopmental_conditions || [],
            lastSession: sessions?.completed_at,
            riskLevel: 'medium' as const,
            progressTrend: 'up' as const,
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

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title — compact on mobile */}
      <div>
        <h1 className="text-2xl-mobile font-bold text-foreground">Meus Pacientes</h1>
        <p className="text-sm-mobile text-muted-foreground">
          {patients.length} paciente{patients.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>
        {!isMobile && (
          <div className="flex gap-1 border rounded-lg p-1">
            <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'progress' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('progress')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
        {!isMobile && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Patient List */}
      {viewMode === 'progress' && !isMobile ? (
        <TherapistPatientSection
          onViewDetails={(patientId) => navigate(`/therapist/patient/${patientId}`)}
          onAddPatient={() => setShowAddModal(true)}
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className={isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="bg-card rounded-[20px] shadow-card p-4 tap-feedback cursor-pointer slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigate(`/therapist/patient/${patient.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <PatientAvatar photoUrl={patient.avatar_url} name={patient.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base-mobile truncate">{patient.name}</h3>
                  <p className="text-xs-mobile text-muted-foreground">{patient.age} anos</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(patient.progressTrend)}
                  <Badge className={`text-[10px] ${getRiskColor(patient.riskLevel)}`}>
                    {patient.riskLevel === 'high' ? 'Alto' : patient.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
              </div>

              {patient.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {patient.conditions.slice(0, 3).map((c, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] rounded-full">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              {patient.lastSession && (
                <div className="flex items-center gap-1.5 text-xs-mobile text-muted-foreground mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Última sessão: {new Date(patient.lastSession).toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2 pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs h-8"
                  onClick={(e) => { e.stopPropagation(); setEditPatientId(patient.id); }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 rounded-xl text-xs h-8"
                  onClick={(e) => { e.stopPropagation(); navigate(`/anamnese/${patient.id}`); }}
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  Anamnese
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs h-8"
                  onClick={(e) => { e.stopPropagation(); navigate(`/prontuario/${patient.id}`); }}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Prontuário
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-[20px] shadow-card p-8 text-center">
          <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg-mobile font-semibold mb-1">Nenhum paciente encontrado</h3>
          <p className="text-sm-mobile text-muted-foreground">
            {searchQuery ? 'Tente buscar com outros termos' : 'Você ainda não tem pacientes cadastrados'}
          </p>
        </div>
      )}

      <AddPatientModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadPatients} />
      <EditPatientModal open={!!editPatientId} patientId={editPatientId} onClose={() => setEditPatientId(null)} onSuccess={loadPatients} />
    </div>
  );
}
