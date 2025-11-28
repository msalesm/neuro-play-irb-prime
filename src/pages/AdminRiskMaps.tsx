import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, MapPin, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface RegionRisk {
  region: string;
  totalChildren: number;
  highRiskCount: number;
  riskPercentage: number;
  primaryDiagnosis: string;
  avgAccuracy: number;
}

export default function AdminRiskMaps() {
  const { user } = useAuth();
  const [regionData, setRegionData] = useState<RegionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('all');

  useEffect(() => {
    loadRiskData();
  }, [selectedDiagnosis]);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      
      // Fetch schools grouped by region
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .eq('active', true);

      if (schoolsError) throw schoolsError;

      // Fetch all classes for these schools
      const schoolIds = schools?.map(s => s.id) || [];
      const { data: classes, error: classesError } = await supabase
        .from('school_classes')
        .select('id, school_id')
        .in('school_id', schoolIds);

      if (classesError) throw classesError;

      // Fetch all students from these classes
      const classIds = classes?.map(c => c.id) || [];
      const { data: students, error: studentsError } = await supabase
        .from('class_students')
        .select('child_id, class_id')
        .in('class_id', classIds);

      if (studentsError) throw studentsError;

      // Fetch children data with conditions
      const childIds = students?.map(s => s.child_id) || [];
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id, neurodevelopmental_conditions')
        .in('id', childIds);

      if (childrenError) throw childrenError;

      // Fetch child profiles for performance data
      const { data: profiles, error: profilesError } = await supabase
        .from('child_profiles')
        .select('id, diagnosed_conditions')
        .in('id', childIds);

      if (profilesError) throw profilesError;

      // Fetch game sessions for risk calculation
      const profileIds = profiles?.map(p => p.id) || [];
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('child_profile_id, accuracy_percentage, completed')
        .in('child_profile_id', profileIds)
        .eq('completed', true);

      if (sessionsError) throw sessionsError;

      // Build region map with real data
      const regionMap = new Map<string, RegionRisk>();

      for (const school of schools || []) {
        const region = school.region || 'Não especificado';
        
        // Get classes for this school
        const schoolClasses = classes?.filter(c => c.school_id === school.id) || [];
        const schoolClassIds = schoolClasses.map(c => c.id);
        
        // Get students in these classes
        const schoolStudents = students?.filter(s => schoolClassIds.includes(s.class_id)) || [];
        const schoolChildIds = schoolStudents.map(s => s.child_id);
        
        // Get children with conditions
        const schoolChildren = children?.filter(c => schoolChildIds.includes(c.id)) || [];
        
        // Calculate performance metrics
        const childProfilesInSchool = profiles?.filter(p => schoolChildIds.includes(p.id)) || [];
        const profileIdsInSchool = childProfilesInSchool.map(p => p.id);
        const schoolSessions = sessions?.filter(s => profileIdsInSchool.includes(s.child_profile_id)) || [];
        
        // Calculate average accuracy
        const avgAccuracy = schoolSessions.length > 0
          ? schoolSessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / schoolSessions.length
          : 0;
        
        // Calculate high risk count (children with accuracy < 60%)
        const childPerformance = new Map<string, number[]>();
        schoolSessions.forEach(s => {
          if (!childPerformance.has(s.child_profile_id)) {
            childPerformance.set(s.child_profile_id, []);
          }
          childPerformance.get(s.child_profile_id)!.push(s.accuracy_percentage || 0);
        });
        
        let highRiskCount = 0;
        childPerformance.forEach(accuracies => {
          const avgChildAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
          if (avgChildAccuracy < 60) highRiskCount++;
        });
        
        // Determine primary diagnosis
        const diagnosisCounts = new Map<string, number>();
        schoolChildren.forEach(child => {
          const conditions = (child.neurodevelopmental_conditions as any)?.conditions || [];
          conditions.forEach((cond: string) => {
            diagnosisCounts.set(cond, (diagnosisCounts.get(cond) || 0) + 1);
          });
        });
        
        let primaryDiagnosis = 'N/A';
        let maxCount = 0;
        diagnosisCounts.forEach((count, diagnosis) => {
          if (count > maxCount) {
            maxCount = count;
            primaryDiagnosis = diagnosis;
          }
        });

        const totalChildren = schoolChildren.length;
        const riskPercentage = totalChildren > 0 ? (highRiskCount / totalChildren) * 100 : 0;

        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            totalChildren,
            highRiskCount,
            riskPercentage,
            primaryDiagnosis,
            avgAccuracy: Math.round(avgAccuracy)
          });
        } else {
          const current = regionMap.get(region)!;
          const combinedTotal = current.totalChildren + totalChildren;
          current.totalChildren = combinedTotal;
          current.highRiskCount += highRiskCount;
          current.riskPercentage = combinedTotal > 0 
            ? (current.highRiskCount / combinedTotal) * 100 
            : 0;
          current.avgAccuracy = Math.round(
            ((current.avgAccuracy * (combinedTotal - totalChildren)) + (avgAccuracy * totalChildren)) / combinedTotal
          );
        }
      }

      setRegionData(Array.from(regionMap.values()).sort((a, b) => b.riskPercentage - a.riskPercentage));
    } catch (error: any) {
      console.error('Error loading risk data:', error);
      toast.error('Erro ao carregar mapas de risco');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 20) return { label: 'Alto', variant: 'destructive' as const };
    if (percentage >= 10) return { label: 'Médio', variant: 'default' as const };
    return { label: 'Baixo', variant: 'secondary' as const };
  };

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mapas de Risco</h1>
          <p className="text-muted-foreground">Análise preditiva de risco por região e diagnóstico</p>
        </div>
        
        <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por diagnóstico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os diagnósticos</SelectItem>
                  <SelectItem value="TEA">TEA</SelectItem>
                  <SelectItem value="TDAH">TDAH</SelectItem>
                  <SelectItem value="Dislexia">Dislexia</SelectItem>
                  <SelectItem value="Emocional">Emocional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Regiões</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regionData.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crianças Monitoradas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {regionData.reduce((sum, r) => sum + r.totalChildren, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {regionData.reduce((sum, r) => sum + r.highRiskCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risco Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {regionData.filter(r => r.riskPercentage >= 10 && r.riskPercentage < 20).length}
              </div>
              <p className="text-xs text-muted-foreground">regiões</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Map Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Risco por Região</CardTitle>
            <CardDescription>
              Índice de risco preditivo baseado em desempenho cognitivo e alertas comportamentais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
            ) : regionData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado disponível para exibição
              </div>
            ) : (
              <div className="space-y-4">
                {regionData.map((region, index) => {
                  const riskLevel = getRiskLevel(region.riskPercentage);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{region.region}</h4>
                          <p className="text-sm text-muted-foreground">
                            {region.totalChildren} crianças monitoradas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {region.highRiskCount} em alto risco
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Diagnóstico principal: {region.primaryDiagnosis}
                          </div>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-2xl font-bold">
                            {region.riskPercentage.toFixed(1)}%
                          </div>
                          <Badge variant={riskLevel.variant} className="mt-1">
                            {riskLevel.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </ModernPageLayout>
  );
}
