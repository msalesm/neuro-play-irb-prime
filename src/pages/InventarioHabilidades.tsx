import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SkillsInventory } from '@/components/pei/SkillsInventory';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardList, Users } from 'lucide-react';

interface PatientOption {
  id: string;
  name: string;
  age: number;
}

export default function InventarioHabilidades() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadPatients();
  }, [user]);

  const loadPatients = async () => {
    try {
      const { data: accessData } = await supabase
        .from('child_access')
        .select(`
          child_id,
          children (id, name, birth_date)
        `)
        .eq('professional_id', user?.id);

      if (accessData) {
        const list: PatientOption[] = accessData
          .filter((a: any) => a.children)
          .map((a: any) => {
            const child = a.children;
            const age = Math.floor(
              (Date.now() - new Date(child.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            );
            return { id: child.id, name: child.name, age };
          });
        setPatients(list);
        if (list.length === 1) {
          setSelectedPatientId(list[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <AppLayout>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Inventário de Habilidades
          </h1>
          <p className="text-muted-foreground">Avaliação completa das habilidades do paciente</p>
        </div>

        {/* Patient Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium whitespace-nowrap">Paciente:</Label>
              </div>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
                disabled={loading}
              >
                <SelectTrigger className="w-full sm:w-[320px]">
                  <SelectValue placeholder={loading ? 'Carregando pacientes...' : 'Selecione um paciente'} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.age} anos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatient && (
                <span className="text-sm text-muted-foreground">
                  {selectedPatient.name} • {selectedPatient.age} anos
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedPatientId ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Selecione um paciente</h3>
              <p className="text-muted-foreground">
                Escolha um paciente acima para iniciar ou continuar a avaliação do inventário de habilidades.
              </p>
            </CardContent>
          </Card>
        ) : (
          <SkillsInventory
            childId={selectedPatientId}
            childName={selectedPatient?.name}
          />
        )}
      </div>
    </AppLayout>
  );
}
