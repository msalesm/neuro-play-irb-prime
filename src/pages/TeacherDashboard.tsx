import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Download,
  BarChart3,
  GraduationCap,
  Activity,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TeacherStudentSection } from '@/components/TeacherStudentSection';

interface StudentScreening {
  id: string;
  user_id: string;
  type: 'dislexia' | 'tdah' | 'tea';
  score: number;
  percentile: number;
  duration: number;
  recommended_action: string;
  created_at: string;
  has_pei: boolean;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [screenings, setScreenings] = useState<StudentScreening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('progress');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchScreenings();
  }, [user]);

  const fetchScreenings = async () => {
    try {
      setLoading(true);

      // Fetch all screenings (in a real app, this would be filtered by teacher's students)
      const { data: screeningsData, error: screeningsError } = await supabase
        .from('screenings')
        .select('*')
        .order('created_at', { ascending: false });

      if (screeningsError) throw screeningsError;

      // Check which screenings have PEI
      const screeningIds = screeningsData?.map((s) => s.id) || [];
      const { data: peiData, error: peiError } = await supabase
        .from('pei_plans')
        .select('screening_id')
        .in('screening_id', screeningIds);

      if (peiError) throw peiError;

      const peiScreeningIds = new Set(peiData?.map((p) => p.screening_id) || []);

      const enrichedScreenings: StudentScreening[] = (screeningsData || []).map((s) => ({
        id: s.id,
        user_id: s.user_id,
        type: s.type as 'dislexia' | 'tdah' | 'tea',
        score: s.score,
        percentile: s.percentile || 0,
        duration: s.duration || 0,
        recommended_action: s.recommended_action || '',
        created_at: s.created_at,
        has_pei: peiScreeningIds.has(s.id),
      }));

      setScreenings(enrichedScreenings);
    } catch (error) {
      console.error('Error fetching screenings:', error);
      toast.error('Erro ao carregar triagens');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (percentile: number) => {
    if (percentile >= 60) {
      return (
        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Normal
        </Badge>
      );
    }
    if (percentile >= 40) {
      return (
        <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Média</Badge>
      );
    }
    if (percentile >= 20) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Atenção
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-700 border-red-500/20">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Crítico
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      dislexia: 'Dislexia',
      tdah: 'TDAH',
      tea: 'TEA',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredScreenings = screenings.filter((screening) => {
    const matchesSearch = screening.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || screening.type === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'critical' && screening.percentile < 20) ||
      (filterStatus === 'attention' && screening.percentile >= 20 && screening.percentile < 40) ||
      (filterStatus === 'normal' && screening.percentile >= 40);

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: screenings.length,
    critical: screenings.filter((s) => s.percentile < 20).length,
    withPEI: screenings.filter((s) => s.has_pei).length,
    recent: screenings.filter(
      (s) => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-32">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary/60 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Painel do Professor</h1>
                <p className="text-muted-foreground">
                  Acompanhamento de triagens e planos educacionais
                </p>
              </div>
          </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/teacher/classes">
                  <Users className="h-4 w-4 mr-2" />
                  Minhas Turmas
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/parent-training">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Capacitação
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total de Triagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Necessita Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.critical}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                Com PEI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.withPEI}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Última Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.recent}</div>
            </CardContent>
          </Card>
        </div>

        {stats.critical > 0 && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              <strong>{stats.critical}</strong> aluno(s) necessitam de atenção imediata. Revise os
              casos marcados como "Crítico" e considere encaminhamento para equipe multidisciplinar.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Progresso dos Alunos
            </TabsTrigger>
            <TabsTrigger value="screenings" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Triagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-4">
            <TeacherStudentSection 
              onViewDetails={(studentId) => navigate(`/teacher/student/${studentId}`)}
            />
          </TabsContent>

          <TabsContent value="screenings" className="mt-4">
            <Card className="mb-6">
              <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <CardTitle>Triagens Realizadas</CardTitle>
                <CardDescription>
                  Visualize e gerencie as triagens dos estudantes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID do estudante..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="dislexia">Dislexia</SelectItem>
                  <SelectItem value="tdah">TDAH</SelectItem>
                  <SelectItem value="tea">TEA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="attention">Atenção</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PEI</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScreenings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma triagem encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredScreenings.map((screening) => (
                      <TableRow key={screening.id}>
                        <TableCell className="font-mono text-xs">
                          {screening.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(screening.type)}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{Math.round(screening.score)}</TableCell>
                        <TableCell>{Math.round(screening.percentile)}º</TableCell>
                        <TableCell>{getStatusBadge(screening.percentile)}</TableCell>
                        <TableCell>
                          {screening.has_pei ? (
                            <Badge className="bg-green-500/10 text-green-700">Sim</Badge>
                          ) : (
                            <Badge variant="outline">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(screening.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {screening.has_pei && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link to={`/pei?screening=${screening.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
