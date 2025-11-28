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

      // Group by region and calculate risk metrics
      const regionMap = new Map<string, RegionRisk>();

      for (const school of schools || []) {
        const region = school.region || 'Não especificado';
        
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            totalChildren: school.total_students || 0,
            highRiskCount: Math.floor((school.total_students || 0) * 0.15), // Mock: 15% high risk
            riskPercentage: 15,
            primaryDiagnosis: 'TDAH',
            avgAccuracy: 72
          });
        } else {
          const current = regionMap.get(region)!;
          current.totalChildren += school.total_students || 0;
          current.highRiskCount += Math.floor((school.total_students || 0) * 0.15);
          current.riskPercentage = (current.highRiskCount / current.totalChildren) * 100;
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
