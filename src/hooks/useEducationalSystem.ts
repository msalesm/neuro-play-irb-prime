import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LearningTrail {
  id: string;
  cognitive_category: string;
  current_level: number;
  max_level_unlocked: number;
  total_xp: number;
  completed_exercises: number;
  learning_path: any[];
  adaptive_settings: any;
}

export interface NeurodiversityProfile {
  id: string;
  detected_conditions: string[];
  confidence_scores: any;
  adaptive_strategies: any;
  assessment_data: any;
  last_assessment: string | null;
  needs_educator_review: boolean;
}

export interface LearningSession {
  id: string;
  trail_id: string;
  game_type: string;
  level: number;
  performance_data: any;
  learning_indicators: any;
  struggles_detected: string[];
  improvements_noted: string[];
  session_duration_seconds: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useEducationalSystem() {
  const { user } = useAuth();
  const [learningTrails, setLearningTrails] = useState<LearningTrail[]>([]);
  const [neurodiversityProfile, setNeurodiversityProfile] = useState<NeurodiversityProfile | null>(null);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEducationalData();
    }
  }, [user]);

  const fetchEducationalData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch learning trails
      const { data: trails, error: trailsError } = await supabase
        .from('learning_trails')
        .select('*')
        .eq('user_id', user.id);

      if (trailsError) throw trailsError;

      // If no trails exist, initialize them
      if (!trails || trails.length === 0) {
        await initializeLearningTrails();
        return fetchEducationalData();
      }

      setLearningTrails(trails.map(trail => ({
        ...trail,
        learning_path: Array.isArray(trail.learning_path) ? trail.learning_path : [],
        adaptive_settings: trail.adaptive_settings || {}
      })));

      // Fetch neurodiversity profile
      const { data: profile, error: profileError } = await supabase
        .from('neurodiversity_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      if (!profile) {
        // Create initial profile
        const { data: newProfile, error: createError } = await supabase
          .from('neurodiversity_profiles')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setNeurodiversityProfile({
          ...newProfile,
          detected_conditions: Array.isArray(newProfile.detected_conditions) 
            ? newProfile.detected_conditions.map(c => String(c)) 
            : [],
          confidence_scores: newProfile.confidence_scores || {},
          adaptive_strategies: newProfile.adaptive_strategies || {},
          assessment_data: newProfile.assessment_data || {}
        });
      } else {
        setNeurodiversityProfile({
          ...profile,
          detected_conditions: Array.isArray(profile.detected_conditions) 
            ? profile.detected_conditions.map(c => String(c)) 
            : [],
          confidence_scores: profile.confidence_scores || {},
          adaptive_strategies: profile.adaptive_strategies || {},
          assessment_data: profile.assessment_data || {}
        });
      }

      // Fetch recent learning sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;
      setRecentSessions((sessions || []).map(session => ({
        ...session,
        struggles_detected: Array.isArray(session.struggles_detected) 
          ? session.struggles_detected.map(s => String(s)) 
          : [],
        improvements_noted: Array.isArray(session.improvements_noted) 
          ? session.improvements_noted.map(i => String(i)) 
          : [],
        performance_data: session.performance_data || {},
        learning_indicators: session.learning_indicators || {}
      })));

    } catch (error) {
      console.error('Error fetching educational data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeLearningTrails = async () => {
    if (!user) return;

    const categories = ['memory', 'attention', 'logic', 'math', 'language', 'executive'];
    
    try {
      const trailsToCreate = categories.map(category => ({
        user_id: user.id,
        cognitive_category: category
      }));

      const { error } = await supabase
        .from('learning_trails')
        .insert(trailsToCreate);

      if (error) throw error;
    } catch (error) {
      console.error('Error initializing learning trails:', error);
    }
  };

  const recordLearningSession = async (sessionData: {
    trail_id: string;
    game_type: string;
    level: number;
    performance_data: any;
    learning_indicators?: any;
    struggles_detected?: string[];
    improvements_noted?: string[];
    session_duration_seconds?: number;
    completed: boolean;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          ...sessionData,
          completed_at: sessionData.completed ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      // Update learning trail progress
      await updateLearningProgress(sessionData.trail_id, sessionData.performance_data);

      // Analyze for neurodiversity indicators
      await analyzeNeurodiversityIndicators(sessionData);

      return data;
    } catch (error) {
      console.error('Error recording learning session:', error);
      throw error;
    }
  };

  const updateLearningProgress = async (trailId: string, performanceData: any) => {
    try {
      const trail = learningTrails.find(t => t.id === trailId);
      if (!trail) return;

      const xpGained = calculateXPGained(performanceData);
      const shouldLevelUp = shouldAdvanceLevel(trail, performanceData);

      const updates: any = {
        total_xp: trail.total_xp + xpGained,
        completed_exercises: trail.completed_exercises + 1
      };

      if (shouldLevelUp) {
        updates.current_level = trail.current_level + 1;
        updates.max_level_unlocked = Math.max(trail.max_level_unlocked, trail.current_level + 1);
      }

      const { error } = await supabase
        .from('learning_trails')
        .update(updates)
        .eq('id', trailId);

      if (error) throw error;

      // Refresh trails
      fetchEducationalData();
    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  };

  const analyzeNeurodiversityIndicators = async (sessionData: any) => {
    if (!neurodiversityProfile) return;

    // Simple pattern detection logic
    const indicators = detectLearningPatterns(sessionData);
    
    if (indicators.length > 0) {
      const updatedProfile = {
        ...neurodiversityProfile,
        assessment_data: {
          ...neurodiversityProfile.assessment_data,
          latest_indicators: indicators,
          last_analysis: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('neurodiversity_profiles')
        .update(updatedProfile)
        .eq('id', neurodiversityProfile.id);

      if (error) {
        console.error('Error updating neurodiversity profile:', error);
      } else {
        setNeurodiversityProfile(updatedProfile);
      }
    }
  };

  const calculateXPGained = (performanceData: any): number => {
    const baseXP = 10;
    const accuracyBonus = (performanceData.accuracy || 0) * 0.5;
    const speedBonus = performanceData.completion_time < 60 ? 5 : 0;
    return Math.round(baseXP + accuracyBonus + speedBonus);
  };

  const shouldAdvanceLevel = (trail: LearningTrail, performanceData: any): boolean => {
    // Criteria for level advancement
    const accuracy = performanceData.accuracy || 0;
    const minAccuracy = 80; // 80% accuracy required
    const minExercises = 3; // Complete at least 3 exercises at current level
    
    return accuracy >= minAccuracy && trail.completed_exercises >= minExercises;
  };

  const detectLearningPatterns = (sessionData: any): string[] => {
    const indicators: string[] = [];
    
    // Example pattern detection
    if (sessionData.performance_data?.reaction_time > 2000) {
      indicators.push('slow_processing_speed');
    }
    
    if (sessionData.performance_data?.accuracy < 60) {
      indicators.push('difficulty_with_task');
    }
    
    if (sessionData.struggles_detected?.length > 3) {
      indicators.push('multiple_struggles_detected');
    }
    
    return indicators;
  };

  const getTrailByCategory = (category: string): LearningTrail | undefined => {
    return learningTrails.find(trail => trail.cognitive_category === category);
  };

  const getOverallProgress = () => {
    if (learningTrails.length === 0) return 0;
    
    const totalLevels = learningTrails.reduce((sum, trail) => sum + trail.current_level, 0);
    const maxPossibleLevels = learningTrails.length * 10; // Assuming 10 max levels per trail
    
    return Math.round((totalLevels / maxPossibleLevels) * 100);
  };

  return {
    learningTrails,
    neurodiversityProfile,
    recentSessions,
    loading,
    recordLearningSession,
    getTrailByCategory,
    getOverallProgress,
    fetchEducationalData
  };
}