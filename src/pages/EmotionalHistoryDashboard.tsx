import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Heart, 
  TrendingUp, 
  Calendar, 
  Smile,
  Frown,
  Meh,
  FileDown,
  AlertCircle,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useBehavioralReport } from '@/hooks/useBehavioralReport';
import { EmotionCaptureCamera } from '@/components/emotional/EmotionCaptureCamera';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
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
} from 'recharts';

interface EmotionalCheckIn {
  id: string;
  scheduled_for: string;
  completed_at: string | null;
  mood_rating: number | null;
  emotions_detected: string[];
  notes: string | null;
}

export default function EmotionalHistoryDashboard() {
  const { user } = useAuth();
  const { generatePDF, generating } = useBehavioralReport();
  const { toast } = useToast();
  const [checkIns, setCheckIns] = useState<EmotionalCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [showCamera, setShowCamera] = useState(false);
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childProfiles, setChildProfiles] = useState<{ id: string; name: string }[]>([]);

  const handleEmotionCaptured = async (result: {
    primaryEmotion: string;
    detectedEmotions: string[];
    moodRating: number;
    confidence: number;
  }) => {
    if (!user || !selectedChildId) return;
    
    try {
      // Create a new emotional check-in for the child
      const { error } = await supabase
        .from('emotional_checkins')
        .insert({
          user_id: user.id,
          child_profile_id: selectedChildId,
          scheduled_for: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          mood_rating: result.moodRating,
          emotions_detected: result.detectedEmotions,
          notes: `Capturado via câmera (${result.confidence}% confiança): ${result.primaryEmotion}`,
        });
      
      if (error) throw error;
      
      const childName = childProfiles.find(c => c.id === selectedChildId)?.name || 'Criança';
      
      toast({
        title: 'Check-in registrado!',
        description: `Emoção de ${childName}: ${result.primaryEmotion}`,
      });
      
      fetchCheckIns();
      setShowCamera(false);
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o check-in.',
        variant: 'destructive',
      });
    }
  };

  // Fetch children/patients for the user
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) return;
      
      try {
        // Fetch from children table (for parents)
        const { data: childrenData } = await supabase
          .from('children')
          .select('id, name')
          .eq('parent_id', user.id);
        
        // Fetch from child_profiles table
        const { data: profilesData } = await supabase
          .from('child_profiles')
          .select('id, name')
          .eq('parent_user_id', user.id);
        
        // Combine both sources
        const allChildren = [
          ...(childrenData || []),
          ...(profilesData || []),
        ];
        
        // Remove duplicates by id
        const uniqueChildren = allChildren.filter(
          (child, index, self) => index === self.findIndex(c => c.id === child.id)
        );
        
        setChildProfiles(uniqueChildren);
        
        // Auto-select first child if only one
        if (uniqueChildren.length === 1) {
          setSelectedChildId(uniqueChildren[0].id);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };
    
    fetchChildren();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user, timeRange]);

  const fetchCheckIns = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('emotional_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: false });

      // Filter by time range
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('scheduled_for', weekAgo.toISOString());
      } else if (timeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('scheduled_for', monthAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for mood chart
  const moodChartData = checkIns
    .filter(c => c.completed_at && c.mood_rating)
    .reverse()
    .map(c => ({
      date: new Date(c.completed_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      humor: c.mood_rating,
      fullDate: c.completed_at,
    }));

  // Prepare emotion frequency data
  const emotionFrequency: { [key: string]: number } = {};
  checkIns.forEach(c => {
    if (c.emotions_detected) {
      c.emotions_detected.forEach(emotion => {
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
      });
    }
  });

  const emotionData = Object.entries(emotionFrequency)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Calculate stats
  const completedCheckIns = checkIns.filter(c => c.completed_at).length;
  const averageMood = checkIns
    .filter(c => c.mood_rating)
    .reduce((sum, c) => sum + (c.mood_rating || 0), 0) / (checkIns.filter(c => c.mood_rating).length || 1);
  
  const recentMoods = checkIns
    .filter(c => c.mood_rating)
    .slice(0, 5)
    .map(c => c.mood_rating || 0);
  
  const moodTrend = recentMoods.length >= 2 
    ? recentMoods[0] > recentMoods[recentMoods.length - 1] ? 'up' : 'down'
    : 'stable';

  // Emotion colors
  const EMOTION_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(10, 70%, 50%)',
    'hsl(200, 70%, 50%)',
    'hsl(280, 70%, 50%)',
  ];

  const getMoodIcon = (rating: number) => {
    if (rating >= 7) return <Smile className="h-5 w-5 text-green-500" />;
    if (rating >= 4) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getMoodLabel = (rating: number) => {
    if (rating >= 8) return 'Excelente';
    if (rating >= 6) return 'Bom';
    if (rating >= 4) return 'Regular';
    return 'Difícil';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você precisa estar logado para acessar o histórico emocional.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-6 pb-32">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-irb-petrol to-irb-blue rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-irb-petrol to-irb-blue bg-clip-text text-transparent">
                  Histórico Emocional
                </h1>
                <p className="text-muted-foreground">
                  Acompanhe a evolução emocional ao longo do tempo
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showCamera} onOpenChange={setShowCamera}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={childProfiles.length === 0}>
                  <Camera className="h-4 w-4" />
                  Capturar Emoção
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                {!selectedChildId ? (
                  <div className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Selecione a Criança</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label>Capturar emoção de:</Label>
                      <Select onValueChange={setSelectedChildId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {childProfiles.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <EmotionCaptureCamera
                    onEmotionCaptured={handleEmotionCaptured}
                    onClose={() => {
                      setShowCamera(false);
                      setSelectedChildId(childProfiles.length === 1 ? childProfiles[0].id : null);
                    }}
                    childId={selectedChildId}
                    childName={childProfiles.find(c => c.id === selectedChildId)?.name}
                  />
                )}
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              onClick={generatePDF}
              disabled={generating}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {generating ? 'Gerando...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            size="sm"
          >
            Última Semana
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            size="sm"
          >
            Último Mês
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeRange('all')}
            size="sm"
          >
            Todo Período
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Check-ins Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCheckIns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                de {checkIns.length} agendados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Humor Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{averageMood.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">/10</div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getMoodIcon(averageMood)}
                <span className="text-xs text-muted-foreground">
                  {getMoodLabel(averageMood)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Tendência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {moodTrend === 'up' ? (
                  <Badge className="bg-green-100 text-green-800 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Melhorando
                  </Badge>
                ) : moodTrend === 'down' ? (
                  <Badge className="bg-red-100 text-red-800 gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Atenção
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Estável
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Baseado nos últimos 5 registros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="emotions">Emoções</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Humor</CardTitle>
                <CardDescription>
                  Acompanhe como seu humor variou ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {moodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        stroke="hsl(var(--foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="humor" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Humor (0-10)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emotions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequência de Emoções</CardTitle>
                  <CardDescription>
                    Emoções mais registradas no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {emotionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={emotionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="emotion" 
                          stroke="hsl(var(--foreground))"
                          fontSize={11}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="Frequência" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Nenhuma emoção registrada
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição Emocional</CardTitle>
                  <CardDescription>
                    Proporção de cada emoção detectada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {emotionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={emotionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ emotion, percent }) => 
                            `${emotion} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="count"
                        >
                          {emotionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Nenhuma emoção registrada
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Detalhado</CardTitle>
                <CardDescription>
                  Todos os check-ins emocionais registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {checkIns.length > 0 ? (
                      checkIns.map((checkIn) => (
                        <Card key={checkIn.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {new Date(checkIn.scheduled_for).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              
                              {checkIn.completed_at && checkIn.mood_rating && (
                                <div className="flex items-center gap-2">
                                  {getMoodIcon(checkIn.mood_rating)}
                                  <span className="text-sm">
                                    Humor: <strong>{checkIn.mood_rating}/10</strong> - {getMoodLabel(checkIn.mood_rating)}
                                  </span>
                                </div>
                              )}
                              
                              {checkIn.emotions_detected && checkIn.emotions_detected.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {checkIn.emotions_detected.map((emotion, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {emotion}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {checkIn.notes && (
                                <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                                  {checkIn.notes}
                                </p>
                              )}
                            </div>
                            
                            <Badge variant={checkIn.completed_at ? 'default' : 'outline'}>
                              {checkIn.completed_at ? 'Completo' : 'Pendente'}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhum check-in emocional registrado ainda
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
