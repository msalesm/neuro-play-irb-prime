import { useState, useEffect } from 'react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Download,
  FileText,
  Shield,
  BarChart3,
  Activity,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface NetworkMetrics {
  totalSchools: number;
  totalClasses: number;
  totalChildren: number;
  totalSessions: number;
  avgAccuracy: number;
  activeUsers: number;
  highRiskChildren: number;
}

interface SchoolData {
  id: string;
  name: string;
  city: string;
  region: string;
  totalStudents: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PlanetUsage {
  name: string;
  sessions: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminNetworkDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalSchools: 0,
    totalClasses: 0,
    totalChildren: 0,
    totalSessions: 0,
    avgAccuracy: 0,
    activeUsers: 0,
    highRiskChildren: 0,
  });
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [planetUsage, setPlanetUsage] = useState<PlanetUsage[]>([]);

  useEffect(() => {
    if (user && isAdmin) {
      loadDashboardData();
    }
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .eq('active', true);

      if (schoolsError) throw schoolsError;

      // Load classes
      const { count: classesCount } = await supabase
        .from('school_classes')
        .select('*', { count: 'exact', head: true });

      // Load children
      const { data: childrenData, count: childrenCount } = await supabase
        .from('children')
        .select('*', { count: 'exact' });

      // Load sessions
      const { data: sessionsData, count: sessionsCount } = await supabase
        .from('game_sessions')
        .select('accuracy_percentage', { count: 'exact' });

      // Calculate metrics
      const avgAccuracy = sessionsData && sessionsData.length > 0
        ? sessionsData.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / sessionsData.length
        : 0;

      // Mock high risk children (would need proper calculation)
      const highRiskCount = Math.floor((childrenCount || 0) * 0.15);

      setMetrics({
        totalSchools: schoolsData?.length || 0,
        totalClasses: classesCount || 0,
        totalChildren: childrenCount || 0,
        totalSessions: sessionsCount || 0,
        avgAccuracy: Math.round(avgAccuracy),
        activeUsers: childrenCount || 0,
        highRiskChildren: highRiskCount,
      });

      // Process schools data
      const processedSchools: SchoolData[] = (schoolsData || []).map(school => ({
        id: school.id,
        name: school.name,
        city: school.city || 'N/A',
        region: school.region || 'N/A',
        totalStudents: school.total_students || 0,
        riskLevel: school.total_students > 100 ? 'low' : school.total_students > 50 ? 'medium' : 'high',
      }));

      setSchools(processedSchools);

      // Mock planet usage data
      setPlanetUsage([
        { name: 'Aurora (TEA)', sessions: 450, color: COLORS[0] },
        { name: 'Vortex (TDAH)', sessions: 380, color: COLORS[1] },
        { name: 'Lumen (Dislexia)', sessions: 320, color: COLORS[2] },
        { name: 'Calm (Regulação)', sessions: 290, color: COLORS[3] },
        { name: 'Order (Executivas)', sessions: 260, color: COLORS[4] },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Esta área é restrita a administradores do sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </ModernPageLayout>
    );
  }

  const regionData = [
    { name: 'Sul', children: 450, risco: 15 },
    { name: 'Sudeste', children: 680, risco: 22 },
    { name: 'Centro-Oeste', children: 320, risco: 12 },
    { name: 'Nordeste', children: 540, risco: 18 },
    { name: 'Norte', children: 280, risco: 10 },
  ];

  const diagnosticEvolution = [
    { month: 'Jan', TEA: 65, TDAH: 78, Dislexia: 72 },
    { month: 'Fev', TEA: 68, TDAH: 80, Dislexia: 75 },
    { month: 'Mar', TEA: 71, TDAH: 82, Dislexia: 77 },
    { month: 'Abr', TEA: 74, TDAH: 85, Dislexia: 80 },
    { month: 'Mai', TEA: 77, TDAH: 87, Dislexia: 82 },
    { month: 'Jun', TEA: 80, TDAH: 90, Dislexia: 85 },
  ];

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Geral da Rede</h1>
          <p className="text-muted-foreground">
            Visão consolidada de todas as escolas, turmas e crianças atendidas
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Escolas</span>
              </div>
              <p className="text-2xl font-bold">{metrics.totalSchools}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Turmas</span>
              </div>
              <p className="text-2xl font-bold">{metrics.totalClasses}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Crianças</span>
              </div>
              <p className="text-2xl font-bold">{metrics.totalChildren}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Sessões</span>
              </div>
              <p className="text-2xl font-bold">{metrics.totalSessions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <span className="text-xs text-muted-foreground">Precisão</span>
              </div>
              <p className="text-2xl font-bold">{metrics.avgAccuracy}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Ativos</span>
              </div>
              <p className="text-2xl font-bold">{metrics.activeUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Alto Risco</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{metrics.highRiskChildren}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schools">Escolas</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="licenses">Licenças</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Planet Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Planetas Mais Utilizados</CardTitle>
                  <CardDescription>Distribuição de sessões por planeta</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={planetUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {planetUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Regional Risk */}
              <Card>
                <CardHeader>
                  <CardTitle>Risco Preditivo por Região</CardTitle>
                  <CardDescription>Distribuição de crianças e casos de risco</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="children" fill="#0088FE" name="Crianças" />
                      <Bar dataKey="risco" fill="#FF8042" name="Alto Risco" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostic Evolution */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução por Diagnóstico</CardTitle>
                <CardDescription>Performance média mensal por condição</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={diagnosticEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="TEA" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="TDAH" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="Dislexia" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Escolas da Rede</CardTitle>
                    <CardDescription>Todas as escolas cadastradas no sistema</CardDescription>
                  </div>
                  <Button>
                    <Building2 className="w-4 h-4 mr-2" />
                    Nova Escola
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schools.length > 0 ? (
                    schools.map((school) => (
                      <Card key={school.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{school.name}</h4>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {school.city} - {school.region}
                                </Badge>
                                <Badge variant="secondary">
                                  {school.totalStudents} alunos
                                </Badge>
                              </div>
                            </div>
                            <Badge
                              className={
                                school.riskLevel === 'high'
                                  ? 'bg-red-500/10 text-red-700'
                                  : school.riskLevel === 'medium'
                                  ? 'bg-yellow-500/10 text-yellow-700'
                                  : 'bg-green-500/10 text-green-700'
                              }
                            >
                              {school.riskLevel === 'high' && 'Alto Risco'}
                              {school.riskLevel === 'medium' && 'Médio Risco'}
                              {school.riskLevel === 'low' && 'Baixo Risco'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhuma escola cadastrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Relatórios Impressos</CardTitle>
                    <CardDescription>Gerar e baixar relatórios consolidados</CardDescription>
                  </div>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Relatório Mensal Consolidado
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Análise de Desempenho por Escola
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Relatório de Risco Preditivo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Indicadores Cognitivos Agregados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Licenças</CardTitle>
                <CardDescription>Controle de licenças ativas por escola</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Sistema de licenças em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Auditoria do Sistema</CardTitle>
                <CardDescription>Logs de ações administrativas e de sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Sistema de auditoria em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}
