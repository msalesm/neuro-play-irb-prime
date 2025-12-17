import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export interface AnalyticsData {
  totalSessions: number;
  totalUsers: number;
  avgAccuracy: number;
  avgSessionDuration: number;
  completionRate: number;
  activeUsersToday: number;
  sessionsThisWeek: number;
  topGames: { name: string; sessions: number; avgScore: number }[];
  dailyActivity: { date: string; sessions: number; users: number }[];
  performanceByCondition: { condition: string; avgAccuracy: number; avgProgress: number }[];
  alertsCount: number;
  pendingReports: number;
}

export interface FilterOptions {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  childId?: string;
  gameId?: string;
  condition?: string;
}

export function useProfessionalAnalytics() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({ dateRange: 'month' });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, filters]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (filters.dateRange) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      // Get accessible child IDs for non-admin users
      let childIds: string[] = [];
      const isAdminOrManager = role === 'admin';

      if (!isAdminOrManager) {
        // Get children as parent
        const { data: parentChildren } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', user?.id);
        
        if (parentChildren) {
          childIds = parentChildren.map(c => c.id);
        }
        
        // Get children via child_access (for therapists)
        const { data: accessChildren } = await supabase
          .from('child_access')
          .select('child_id')
          .eq('professional_id', user?.id)
          .eq('is_active', true)
          .eq('approval_status', 'approved');
        
        if (accessChildren) {
          childIds = [...new Set([...childIds, ...accessChildren.map(a => a.child_id)])];
        }

        // Also get child_profiles for parent
        const { data: parentProfiles } = await supabase
          .from('child_profiles')
          .select('id')
          .eq('parent_user_id', user?.id);
        
        if (parentProfiles) {
          childIds = [...new Set([...childIds, ...parentProfiles.map(p => p.id)])];
        }
      }

      // Fetch game sessions - filter by accessible children if not admin
      let sessionsQuery = supabase
        .from('game_sessions')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (!isAdminOrManager && childIds.length > 0) {
        sessionsQuery = sessionsQuery.in('child_profile_id', childIds);
      } else if (!isAdminOrManager && childIds.length === 0) {
        // No accessible children - return empty
        sessionsQuery = sessionsQuery.eq('child_profile_id', 'no-access');
      }

      const { data: sessions } = await sessionsQuery;

      // Fetch learning sessions - filter by accessible children if not admin
      let learningQuery = supabase
        .from('learning_sessions')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (!isAdminOrManager && childIds.length > 0) {
        learningQuery = learningQuery.in('user_id', childIds);
      } else if (!isAdminOrManager && childIds.length === 0) {
        learningQuery = learningQuery.eq('user_id', 'no-access');
      }

      const { data: learningSessions } = await learningQuery;

      // Fetch cognitive games for names
      const { data: games } = await supabase
        .from('cognitive_games')
        .select('id, name');

      // Fetch child profiles for conditions
      const { data: profiles } = await supabase
        .from('child_profiles')
        .select('id, diagnosed_conditions');

      // Calculate metrics
      const totalSessions = (sessions?.length || 0) + (learningSessions?.length || 0);
      const uniqueUsers = new Set([
        ...(sessions?.map(s => s.child_profile_id) || []),
        ...(learningSessions?.map(s => s.user_id) || [])
      ]).size;

      const completedSessions = sessions?.filter(s => s.completed) || [];
      const avgAccuracy = completedSessions.length > 0
        ? completedSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / completedSessions.length
        : 0;

      const avgDuration = completedSessions.length > 0
        ? completedSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / completedSessions.length
        : 0;

      const completionRate = sessions && sessions.length > 0
        ? (completedSessions.length / sessions.length) * 100
        : 0;

      // Today's active users
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions?.filter(s => s.created_at?.startsWith(today)) || [];
      const activeUsersToday = new Set(todaySessions.map(s => s.child_profile_id)).size;

      // Sessions this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const sessionsThisWeek = sessions?.filter(s => new Date(s.created_at || '') > weekAgo).length || 0;

      // Top games
      const gameMap = new Map<string, { sessions: number; totalScore: number }>();
      sessions?.forEach(s => {
        const current = gameMap.get(s.game_id) || { sessions: 0, totalScore: 0 };
        gameMap.set(s.game_id, {
          sessions: current.sessions + 1,
          totalScore: current.totalScore + (s.score || 0)
        });
      });

      const topGames = Array.from(gameMap.entries())
        .map(([gameId, data]) => ({
          name: games?.find(g => g.id === gameId)?.name || 'Jogo',
          sessions: data.sessions,
          avgScore: data.sessions > 0 ? Math.round(data.totalScore / data.sessions) : 0
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5);

      // Daily activity (last 7 days)
      const dailyActivity: { date: string; sessions: number; users: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const daySessions = sessions?.filter(s => s.created_at?.startsWith(dateStr)) || [];
        dailyActivity.push({
          date: dateStr,
          sessions: daySessions.length,
          users: new Set(daySessions.map(s => s.child_profile_id)).size
        });
      }

      // Performance by condition
      const conditionMap = new Map<string, { count: number; totalAccuracy: number }>();
      sessions?.forEach(s => {
        const profile = profiles?.find(p => p.id === s.child_profile_id);
        const conditions = profile?.diagnosed_conditions || [];
        conditions.forEach((condition: string) => {
          const current = conditionMap.get(condition) || { count: 0, totalAccuracy: 0 };
          conditionMap.set(condition, {
            count: current.count + 1,
            totalAccuracy: current.totalAccuracy + (s.accuracy_percentage || 0)
          });
        });
      });

      const performanceByCondition = Array.from(conditionMap.entries())
        .map(([condition, data]) => ({
          condition,
          avgAccuracy: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0,
          avgProgress: Math.random() * 30 + 50 // Placeholder
        }));

      // Fetch alerts count
      const { count: alertsCount } = await supabase
        .from('behavioral_insights')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .in('severity', ['high', 'critical']);

      // Fetch pending reports
      const { count: pendingReports } = await supabase
        .from('clinical_reports')
        .select('*', { count: 'exact', head: true })
        .eq('reviewed_by_professional', false);

      setAnalytics({
        totalSessions,
        totalUsers: uniqueUsers,
        avgAccuracy: Math.round(avgAccuracy),
        avgSessionDuration: Math.round(avgDuration / 60), // Convert to minutes
        completionRate: Math.round(completionRate),
        activeUsersToday,
        sessionsThisWeek,
        topGames,
        dailyActivity,
        performanceByCondition,
        alertsCount: alertsCount || 0,
        pendingReports: pendingReports || 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportSessionsReport = async () => {
    const { start, end } = getDateRange();
    const { data } = await supabase
      .from('game_sessions')
      .select('*, child_profiles(name), cognitive_games(name)')
      .gte('created_at', start)
      .lte('created_at', end);

    if (data) {
      const exportData = data.map((s: any) => ({
        data: s.created_at,
        crianca: s.child_profiles?.name || 'N/A',
        jogo: s.cognitive_games?.name || 'N/A',
        duracao_segundos: s.duration_seconds,
        precisao: s.accuracy_percentage,
        pontuacao: s.score,
        dificuldade: s.difficulty_level,
        completado: s.completed ? 'Sim' : 'Não'
      }));
      exportToCSV(exportData, 'relatorio_sessoes');
    }
  };

  const exportPerformanceReport = async () => {
    const { data } = await supabase
      .from('adaptive_progress')
      .select('*, child_profiles(name), cognitive_games(name)');

    if (data) {
      const exportData = data.map((p: any) => ({
        crianca: p.child_profiles?.name || 'N/A',
        jogo: p.cognitive_games?.name || 'N/A',
        nivel_atual: p.current_difficulty,
        sessoes_completadas: p.sessions_completed,
        precisao_media: p.avg_accuracy,
        tempo_reacao_medio: p.avg_reaction_time_ms,
        nivel_dominio: p.mastery_level,
        ultima_atividade: p.last_played_at
      }));
      exportToCSV(exportData, 'relatorio_desempenho');
    }
  };

  return {
    analytics,
    loading,
    filters,
    setFilters,
    exportSessionsReport,
    exportPerformanceReport,
    refresh: loadAnalytics
  };
}
