/**
 * useProfessionalAnalytics — Thin Hook
 * 
 * Data fetching + delegates computation to professional-analytics-engine.
 * NO business logic here.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { computeAnalytics, type ComputedAnalytics } from '@/modules/reports/professional-analytics-engine';

export interface AnalyticsData extends ComputedAnalytics {
  alertsCount: number;
  pendingReports: number;
}

export interface FilterOptions {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  childId?: string;
  gameId?: string;
  condition?: string;
}

function getDateRange(dateRange: FilterOptions['dateRange']) {
  const end = new Date();
  const start = new Date();
  switch (dateRange) {
    case 'week': start.setDate(start.getDate() - 7); break;
    case 'month': start.setMonth(start.getMonth() - 1); break;
    case 'quarter': start.setMonth(start.getMonth() - 3); break;
    case 'year': start.setFullYear(start.getFullYear() - 1); break;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

export function useProfessionalAnalytics() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [filters, setFilters] = useState<FilterOptions>({ dateRange: 'month' });

  const { data: analytics, isLoading: loading, refetch } = useQuery<AnalyticsData | null>({
    queryKey: ['professional-analytics', user?.id, role, filters],
    queryFn: async () => {
      if (!user) return null;
      const { start, end } = getDateRange(filters.dateRange);
      const isAdmin = role === 'admin';

      // ── Resolve accessible child IDs ──────────────────
      let childIds: string[] = [];
      if (!isAdmin) {
        const [parentChildren, accessChildren, parentProfiles] = await Promise.all([
          supabase.from('children').select('id').eq('parent_id', user.id),
          supabase.from('child_access').select('child_id')
            .eq('professional_id', user.id).eq('is_active', true).eq('approval_status', 'approved'),
          supabase.from('child_profiles').select('id').eq('parent_user_id', user.id),
        ]);
        childIds = [...new Set([
          ...(parentChildren.data?.map(c => c.id) ?? []),
          ...(accessChildren.data?.map(a => a.child_id) ?? []),
          ...(parentProfiles.data?.map(p => p.id) ?? []),
        ])];
      }

      // ── Fetch raw data ────────────────────────────────
      let sessionsQuery = supabase.from('game_sessions').select('*')
        .gte('created_at', start).lte('created_at', end);
      let learningQuery = supabase.from('learning_sessions').select('user_id, created_at')
        .gte('created_at', start).lte('created_at', end);

      if (!isAdmin && childIds.length > 0) {
        sessionsQuery = sessionsQuery.in('child_profile_id', childIds);
        learningQuery = learningQuery.in('user_id', childIds);
      } else if (!isAdmin && childIds.length === 0) {
        sessionsQuery = sessionsQuery.eq('child_profile_id', 'no-access');
        learningQuery = learningQuery.eq('user_id', 'no-access');
      }

      const [sessions, learningSessions, games, profiles, alertsRes, reportsRes] = await Promise.all([
        sessionsQuery,
        learningQuery,
        supabase.from('cognitive_games').select('id, name'),
        supabase.from('child_profiles').select('id, diagnosed_conditions'),
        supabase.from('behavioral_insights')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active').in('severity', ['high', 'critical']),
        supabase.from('clinical_reports')
          .select('*', { count: 'exact', head: true })
          .eq('reviewed_by_professional', false),
      ]);

      // ── Delegate to pure engine ───────────────────────
      const computed = computeAnalytics(
        sessions.data ?? [],
        learningSessions.data ?? [],
        games.data ?? [],
        profiles.data ?? [],
      );

      return {
        ...computed,
        alertsCount: alertsRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // ── CSV Export (kept as utility) ───────────────────────

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportSessionsReport = async () => {
    const { start, end } = getDateRange(filters.dateRange);
    const { data } = await supabase
      .from('game_sessions')
      .select('*, child_profiles(name), cognitive_games(name)')
      .gte('created_at', start).lte('created_at', end);
    if (data) {
      exportToCSV(data.map((s: any) => ({
        data: s.created_at, crianca: s.child_profiles?.name || 'N/A',
        jogo: s.cognitive_games?.name || 'N/A', duracao_segundos: s.duration_seconds,
        precisao: s.accuracy_percentage, pontuacao: s.score,
        dificuldade: s.difficulty_level, completado: s.completed ? 'Sim' : 'Não',
      })), 'relatorio_sessoes');
    }
  };

  const exportPerformanceReport = async () => {
    const { data } = await supabase
      .from('adaptive_progress')
      .select('*, child_profiles(name), cognitive_games(name)');
    if (data) {
      exportToCSV(data.map((p: any) => ({
        crianca: p.child_profiles?.name || 'N/A', jogo: p.cognitive_games?.name || 'N/A',
        nivel_atual: p.current_difficulty, sessoes_completadas: p.sessions_completed,
        precisao_media: p.avg_accuracy, tempo_reacao_medio: p.avg_reaction_time_ms,
        nivel_dominio: p.mastery_level, ultima_atividade: p.last_played_at,
      })), 'relatorio_desempenho');
    }
  };

  return {
    analytics: analytics ?? null,
    loading,
    filters,
    setFilters,
    exportSessionsReport,
    exportPerformanceReport,
    refresh: refetch,
  };
}
