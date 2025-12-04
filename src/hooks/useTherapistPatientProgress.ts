import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PatientProgress {
  id: string;
  childId: string;
  name: string;
  birthDate: string;
  age: number;
  conditions: string[];
  accessLevel: string;
  // Progress data
  totalSessions: number;
  avgAccuracy: number;
  totalPlayTime: number;
  lastActivity: string | null;
  recentGames: {
    game_name: string;
    score: number;
    accuracy: number;
    date: string;
  }[];
  cognitiveScores: {
    attention: number;
    memory: number;
    language: number;
    executive: number;
  };
}

export function useTherapistPatientProgress() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get children the therapist has access to
      const { data: accessData, error: accessError } = await supabase
        .from('child_access')
        .select(`
          id,
          child_id,
          access_level,
          children (
            id,
            name,
            birth_date,
            neurodevelopmental_conditions
          )
        `)
        .eq('professional_id', user.id);

      if (accessError) {
        console.error('Error loading patient access:', accessError);
        setLoading(false);
        return;
      }

      if (!accessData || accessData.length === 0) {
        setPatients([]);
        setLoading(false);
        return;
      }

      // Get progress data for each patient
      const patientsWithProgress: PatientProgress[] = await Promise.all(
        accessData.map(async (access: any) => {
          const child = access.children;
          if (!child) return null;

          // Calculate age
          const birthDate = new Date(child.birth_date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();

          // Get child_profile linked to this child (if exists)
          const { data: childProfile } = await supabase
            .from('child_profiles')
            .select('id')
            .eq('name', child.name)
            .maybeSingle();

          let gameSessions: any[] = [];
          if (childProfile) {
            const { data: sessions } = await supabase
              .from('game_sessions')
              .select(`
                id,
                score,
                accuracy_percentage,
                duration_seconds,
                created_at,
                completed,
                cognitive_games (name, cognitive_domains)
              `)
              .eq('child_profile_id', childProfile.id)
              .eq('completed', true)
              .order('created_at', { ascending: false })
              .limit(20);
            
            gameSessions = sessions || [];
          }

          // Calculate metrics
          const totalSessions = gameSessions.length;
          const totalPlayTime = gameSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
          const avgAccuracy = gameSessions.length > 0
            ? Math.round(gameSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / gameSessions.length)
            : 0;
          
          const lastActivity = gameSessions.length > 0 ? gameSessions[0].created_at : null;

          // Calculate cognitive domain scores
          const domainScores: Record<string, number[]> = {
            attention: [],
            memory: [],
            language: [],
            executive: []
          };

          gameSessions.forEach(session => {
            const domains = session.cognitive_games?.cognitive_domains || [];
            const accuracy = session.accuracy_percentage || 0;
            
            domains.forEach((domain: string) => {
              const d = domain.toLowerCase();
              if (d.includes('attention') || d.includes('atenção')) {
                domainScores.attention.push(accuracy);
              }
              if (d.includes('memory') || d.includes('memória')) {
                domainScores.memory.push(accuracy);
              }
              if (d.includes('language') || d.includes('linguagem') || d.includes('phonological')) {
                domainScores.language.push(accuracy);
              }
              if (d.includes('executive') || d.includes('planning') || d.includes('flexibility')) {
                domainScores.executive.push(accuracy);
              }
            });
          });

          const cognitiveScores = {
            attention: domainScores.attention.length > 0
              ? Math.round(domainScores.attention.reduce((a, b) => a + b, 0) / domainScores.attention.length)
              : 0,
            memory: domainScores.memory.length > 0
              ? Math.round(domainScores.memory.reduce((a, b) => a + b, 0) / domainScores.memory.length)
              : 0,
            language: domainScores.language.length > 0
              ? Math.round(domainScores.language.reduce((a, b) => a + b, 0) / domainScores.language.length)
              : 0,
            executive: domainScores.executive.length > 0
              ? Math.round(domainScores.executive.reduce((a, b) => a + b, 0) / domainScores.executive.length)
              : 0
          };

          const recentGames = gameSessions.slice(0, 5).map(s => ({
            game_name: s.cognitive_games?.name || 'Jogo',
            score: s.score || 0,
            accuracy: s.accuracy_percentage || 0,
            date: s.created_at
          }));

          const conditions = Array.isArray(child.neurodevelopmental_conditions)
            ? child.neurodevelopmental_conditions
            : [];

          return {
            id: access.id,
            childId: child.id,
            name: child.name,
            birthDate: child.birth_date,
            age,
            conditions,
            accessLevel: access.access_level,
            totalSessions,
            avgAccuracy,
            totalPlayTime,
            lastActivity,
            recentGames,
            cognitiveScores
          };
        })
      );

      setPatients(patientsWithProgress.filter(p => p !== null) as PatientProgress[]);
    } catch (error) {
      console.error('Error loading patient progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (childId: string, accessLevel: string = 'full') => {
    if (!user) return { success: false, error: 'Não autenticado' };

    try {
      const { error } = await supabase
        .from('child_access')
        .insert({
          child_id: childId,
          professional_id: user.id,
          granted_by: user.id,
          access_level: accessLevel
        });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Paciente já vinculado' };
        }
        return { success: false, error: error.message };
      }

      await loadPatients();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    patients,
    loading,
    reload: loadPatients,
    addPatient
  };
}
