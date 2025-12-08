import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartInsightsPanel } from '@/components/ai/SmartInsightsPanel';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Child {
  id: string;
  name: string;
  birth_date: string;
}

export default function ContextualAIDashboard() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    appliedRecommendations: 0,
    insightsGenerated: 0,
    avgAccuracy: 0,
  });

  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchStats();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      // Try children table first (parents)
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, name, birth_date')
        .eq('parent_id', user?.id)
        .eq('is_active', true);

      if (!childrenError && childrenData && childrenData.length > 0) {
        setChildren(childrenData);
        if (!selectedChildId) setSelectedChildId(childrenData[0].id);
        return;
      }

      // Try child_profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('child_profiles')
        .select('id, name, date_of_birth')
        .eq('parent_user_id', user?.id);

      if (!profilesError && profilesData && profilesData.length > 0) {
        const mapped = profilesData.map(p => ({
          id: p.id,
          name: p.name,
          birth_date: p.date_of_birth,
        }));
        setChildren(mapped);
        if (!selectedChildId) setSelectedChildId(mapped[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get AI recommendations stats
      const { data: recs, error: recsError } = await supabase
        .from('ai_recommendations')
        .select('status')
        .eq('status', 'pending');

      const { data: appliedRecs, error: appliedError } = await supabase
        .from('ai_recommendations')
        .select('status')
        .eq('status', 'applied');

      // Get insights count
      const { data: insights, error: insightsError } = await supabase
        .from('behavioral_insights')
        .select('id')
        .eq('user_id', user?.id);

      // Get average accuracy from recent sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('accuracy_percentage')
        .order('created_at', { ascending: false })
        .limit(20);

      const avgAccuracy = sessions?.length 
        ? sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / sessions.length
        : 0;

      setStats({
        totalRecommendations: (recs?.length || 0) + (appliedRecs?.length || 0),
        appliedRecommendations: appliedRecs?.length || 0,
        insightsGenerated: insights?.length || 0,
        avgAccuracy,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Gerar Recomendações',
      description: 'Jogos personalizados baseados no progresso',
      icon: Target,
      color: 'text-primary',
      href: '/games',
    },
    {
      title: 'Análise Preditiva',
      description: 'Detectar padrões e tendências comportamentais',
      icon: TrendingUp,
      color: 'text-emerald-500',
      href: '#insights',
    },
    {
      title: 'Chat Terapêutico',
      description: 'Conversar com o assistente IA',
      icon: Brain,
      color: 'text-purple-500',
      href: '/therapeutic-chat',
    },
    {
      title: 'Relatórios Clínicos',
      description: 'Gerar relatórios inteligentes',
      icon: BarChart3,
      color: 'text-amber-500',
      href: '/reports',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">IA Contextual</h1>
            <p className="text-muted-foreground">Recomendações e análises personalizadas</p>
          </div>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar criança" />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalRecommendations}</p>
              <p className="text-xs text-muted-foreground">Recomendações</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold">{stats.appliedRecommendations}</p>
              <p className="text-xs text-muted-foreground">Aplicadas</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Lightbulb className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{stats.insightsGenerated}</p>
              <p className="text-xs text-muted-foreground">Insights</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats.avgAccuracy.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Acurácia Média</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={action.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <action.icon className={`h-6 w-6 mb-2 ${action.color}`} />
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights & Recomendações
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <SmartInsightsPanel childId={selectedChildId} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentAnalysesHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecentAnalysesHistory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('behavioral_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma análise registrada ainda</p>
        <p className="text-sm">Execute análises na aba "Insights" para ver o histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis, index) => (
        <motion.div
          key={analysis.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className={`p-2 rounded-lg ${
            analysis.severity === 'high' ? 'bg-destructive/10' :
            analysis.severity === 'medium' ? 'bg-amber-500/10' :
            'bg-emerald-500/10'
          }`}>
            {analysis.insight_type?.includes('crisis') ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{analysis.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{analysis.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(analysis.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}
