import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { usePredictiveAnalysis } from '@/hooks/usePredictiveAnalysis';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  profile?: string;
  avatar_url?: string;
}

export interface SessionData {
  id: string;
  game_type: string;
  duration: number;
  score: number;
  created_at: string;
  performance_data: any;
}

export interface CognitiveScores {
  attention: number;
  memory: number;
  language: number;
  logic: number;
  emotion: number;
  coordination: number;
}

export function useParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [cognitiveScores, setCognitiveScores] = useState<CognitiveScores | null>(null);
  const [loading, setLoading] = useState(true);

  const { missions, loading: missionsLoading } = useDailyMissions(selectedChild);
  const { badgeProgress, avatarEvolution, getBadgeIcon, getBadgeColor } = useAchievementSystem(user?.id);
  const { riskIndicator, analyzing, detectCrisisRisk, reload: reloadPredictiveAnalysis } = usePredictiveAnalysis(selectedChild || undefined);

  const loadChildren = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [{ data: profilesData, error: profilesError }, { data: childrenData, error: childrenError }] =
        await Promise.all([
          supabase.from('child_profiles').select('id, name, date_of_birth, diagnosed_conditions').eq('parent_user_id', user.id),
          supabase.from('children').select('id, name, birth_date, neurodevelopmental_conditions, avatar_url, is_active').eq('parent_id', user.id).eq('is_active', true),
        ]);

      if (profilesError || childrenError) {
        toast.error(`Erro ao carregar perfis: ${profilesError?.message || childrenError?.message}`);
        setLoading(false);
        return;
      }

      const calcAge = (dateStr: string | null) => {
        if (!dateStr) return 0;
        return new Date().getFullYear() - new Date(dateStr).getFullYear();
      };

      const merged: ChildProfile[] = [
        ...(profilesData || []).map((c: any) => ({
          id: c.id, name: c.name || 'Sem nome', age: calcAge(c.date_of_birth),
          profile: c.diagnosed_conditions?.[0], avatar_url: undefined,
        })),
        ...(childrenData || []).map((c: any) => ({
          id: c.id, name: c.name || 'Sem nome', age: calcAge(c.birth_date),
          profile: Array.isArray(c.neurodevelopmental_conditions) ? c.neurodevelopmental_conditions[0] : undefined,
          avatar_url: c.avatar_url,
        })),
      ].filter((c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx);

      if (merged.length > 0) {
        setChildren(merged);
        setSelectedChild(merged[0].id);
      } else {
        await loadUserLearningSessions();
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(`Erro ao carregar perfis: ${error?.message}`);
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserLearningSessions = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('learning_sessions').select('*').eq('user_id', user.id)
        .eq('completed', true).order('created_at', { ascending: false }).limit(20);
      if (error || !data?.length) return;

      const transformed: SessionData[] = data.map((s: any) => ({
        id: s.id, game_type: s.game_type || 'Jogo', duration: s.session_duration_seconds || 0,
        score: s.performance_data?.score || 0, created_at: s.created_at, performance_data: s.performance_data || {}
      }));
      setSessions(transformed);
      const avg = transformed.reduce((sum, s) => sum + (s.performance_data?.accuracy || 0), 0) / transformed.length;
      setCognitiveScores({
        attention: Math.round(avg * 0.9), memory: Math.round(avg), language: Math.round(avg * 0.85),
        logic: Math.round(avg * 0.95), emotion: Math.round(avg * 0.8), coordination: Math.round(avg * 0.9)
      });
    } catch (error) { console.error('Error loading sessions:', error); }
  };

  const loadChildData = useCallback(async (childId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`id, game_id, score, accuracy_percentage, avg_reaction_time_ms, duration_seconds, created_at, completed, session_data, cognitive_games (name, game_id)`)
        .eq('child_profile_id', childId).eq('completed', true)
        .order('created_at', { ascending: false }).limit(20);

      if (error) console.error('Error loading game sessions:', error);

      const transformed: SessionData[] = (data || []).map((s: any) => ({
        id: s.id, game_type: s.cognitive_games?.name || s.cognitive_games?.game_id || 'Jogo',
        duration: s.duration_seconds || 0, score: s.score || 0, created_at: s.created_at,
        performance_data: { score: s.score, accuracy: s.accuracy_percentage, reactionTime: s.avg_reaction_time_ms, ...s.session_data }
      }));
      setSessions(transformed);

      if (transformed.length > 0) {
        const domainScores: Record<string, number[]> = { attention: [], memory: [], language: [], logic: [], emotion: [], coordination: [] };
        transformed.forEach(session => {
          const accuracy = session.performance_data?.accuracy || 0;
          const gt = session.game_type.toLowerCase();
          if (gt.includes('atenção') || gt.includes('foco') || gt.includes('attention')) domainScores.attention.push(accuracy);
          if (gt.includes('memória') || gt.includes('memory')) domainScores.memory.push(accuracy);
          if (gt.includes('linguagem') || gt.includes('leitura') || gt.includes('language')) domainScores.language.push(accuracy);
          if (gt.includes('lógica') || gt.includes('raciocínio') || gt.includes('logic')) domainScores.logic.push(accuracy);
          if (gt.includes('emoção') || gt.includes('social') || gt.includes('emotion')) domainScores.emotion.push(accuracy);
          if (gt.includes('coordenação') || gt.includes('motor') || gt.includes('spatial')) domainScores.coordination.push(accuracy);
        });
        const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
        setCognitiveScores({
          attention: avg(domainScores.attention), memory: avg(domainScores.memory),
          language: avg(domainScores.language), logic: avg(domainScores.logic),
          emotion: avg(domainScores.emotion), coordination: avg(domainScores.coordination),
        });
      }
    } catch (error) { console.error('Error:', error); toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, []);

  const generateReport = async () => {
    if (!selectedChild) return;
    try {
      toast.info('Gerando relatório clínico...');
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.functions.invoke('generate-clinical-report', {
        body: { userId: selectedChild, startDate, endDate, reportType: 'comprehensive' }
      });
      if (error) throw error;
      toast.success('Relatório gerado com sucesso!');
    } catch (error) { console.error('Error:', error); toast.error('Erro ao gerar relatório'); }
  };

  // Load children on mount
  useEffect(() => { if (user) { setLoading(true); loadChildren(); } }, [user, loadChildren]);

  // Visibility change handler
  useEffect(() => {
    const handler = () => { if (document.visibilityState === 'visible' && loading) setLoading(false); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [loading]);

  // Crisis detection
  useEffect(() => {
    if (selectedChild) setTimeout(() => detectCrisisRisk(14), 2000);
  }, [selectedChild]);

  // Load child data
  useEffect(() => { if (selectedChild) loadChildData(selectedChild); }, [selectedChild, loadChildData]);

  // Realtime subscriptions
  useEffect(() => {
    if (!selectedChild) return;
    const channel = supabase.channel('game-sessions-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `child_profile_id=eq.${selectedChild}` },
        () => { loadChildData(selectedChild); toast.success('Novo progresso detectado!'); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChild, loadChildData]);

  useEffect(() => {
    if (selectedChild || !user) return;
    const channel = supabase.channel('learning-sessions-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_sessions', filter: `user_id=eq.${user.id}` },
        () => { loadUserLearningSessions(); toast.success('Novo progresso detectado!'); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChild, user]);

  const selectedChildData = children.find(c => c.id === selectedChild);
  const totalSessions = sessions.length;
  const avgScore = sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length) : 0;

  return {
    user, children, selectedChild, setSelectedChild, sessions, cognitiveScores, loading,
    selectedChildData, totalSessions, avgScore, missions, missionsLoading,
    badgeProgress, avatarEvolution, getBadgeIcon, getBadgeColor,
    riskIndicator, analyzing, detectCrisisRisk, reloadPredictiveAnalysis,
    loadChildren, generateReport,
  };
}
