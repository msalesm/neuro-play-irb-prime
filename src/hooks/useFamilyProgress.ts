import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  status: string;
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
}

export function useFamilyProgress() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFamilyMembers();
    }
  }, [user]);

  const loadFamilyMembers = async () => {
    if (!user) {
      console.log('[FamilyProgress] No user, skipping load');
      return;
    }

    try {
      setLoading(true);
      console.log('[FamilyProgress] Loading family links for user:', user.id);

      // Get family links where current user is the parent
      const { data: links, error: linksError } = await supabase
        .from('family_links')
        .select('*')
        .eq('parent_user_id', user.id)
        .eq('status', 'accepted');

      console.log('[FamilyProgress] Family links result:', { links, linksError });

      if (linksError) {
        console.error('Error loading family links:', linksError);
        setLoading(false);
        return;
      }

      if (!links || links.length === 0) {
        console.log('[FamilyProgress] No family links found');
        setFamilyMembers([]);
        setLoading(false);
        return;
      }

      // Get profiles for each family member
      const memberIds = links.map(l => l.family_member_id);
      console.log('[FamilyProgress] Looking up member IDs:', memberIds);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', memberIds);

      console.log('[FamilyProgress] Profiles result:', { profiles, profilesError });

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Get progress data for each family member
      const membersWithProgress: FamilyMember[] = await Promise.all(
        links.map(async (link) => {
          const profile = profiles?.find(p => p.id === link.family_member_id);
          
          // Get learning sessions for this family member
          const { data: sessions } = await supabase
            .from('learning_sessions')
            .select('*')
            .eq('user_id', link.family_member_id)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get game sessions if they have child profiles
          const { data: childProfiles } = await supabase
            .from('child_profiles')
            .select('id')
            .eq('parent_user_id', link.family_member_id);

          let gameSessions: any[] = [];
          if (childProfiles && childProfiles.length > 0) {
            const childIds = childProfiles.map(c => c.id);
            const { data: gSessions } = await supabase
              .from('game_sessions')
              .select(`
                id,
                score,
                accuracy_percentage,
                duration_seconds,
                created_at,
                completed,
                cognitive_games (name)
              `)
              .in('child_profile_id', childIds)
              .eq('completed', true)
              .order('created_at', { ascending: false })
              .limit(10);
            
            gameSessions = gSessions || [];
          }

          // Calculate metrics
          const allSessions = [...(sessions || []), ...gameSessions];
          const totalSessions = allSessions.length;
          // Calculate play time - use duration or calculate from timestamps
          const totalPlayTime = allSessions.reduce((acc, s: any) => {
            // Try session_duration_seconds first
            if (s.session_duration_seconds > 0) return acc + s.session_duration_seconds;
            if (s.duration_seconds > 0) return acc + s.duration_seconds;
            
            // Calculate from timestamps if available in performance_data
            if (s.performance_data?.completed_at && s.created_at) {
              const start = new Date(s.created_at).getTime();
              const end = new Date(s.performance_data.completed_at).getTime();
              const durationSec = Math.floor((end - start) / 1000);
              if (durationSec > 0) return acc + durationSec;
            }
            return acc;
          }, 0);
          
          // Calculate accuracy from both learning_sessions and game_sessions
          let avgAccuracy = 0;
          if (gameSessions.length > 0) {
            avgAccuracy = Math.round(gameSessions.reduce((acc, s) => acc + (s.accuracy_percentage || 0), 0) / gameSessions.length);
          } else if (sessions && sessions.length > 0) {
            // Use learning_sessions accuracy from performance_data, filter completed sessions
            const completedSessions = sessions.filter((s: any) => 
              s.performance_data?.accuracy > 0 && !s.performance_data?.quitReason
            );
            if (completedSessions.length > 0) {
              const accuracies = completedSessions.map((s: any) => s.performance_data.accuracy);
              avgAccuracy = Math.round(accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length);
            }
          }
          
          const lastActivity = allSessions.length > 0
            ? allSessions[0].created_at
            : null;

          // Include learning_sessions in recent games if no game_sessions
          const recentGames = gameSessions.length > 0 
            ? gameSessions.slice(0, 5).map(s => ({
                game_name: s.cognitive_games?.name || 'Jogo',
                score: s.score || 0,
                accuracy: s.accuracy_percentage || 0,
                date: s.created_at
              }))
            : (sessions || []).slice(0, 5).map((s: any) => ({
                game_name: s.game_type || 'Jogo',
                score: s.performance_data?.score || 0,
                accuracy: s.performance_data?.accuracy || 0,
                date: s.created_at
              }));

          // Extract display name - use full_name or first part of email
          let displayName = profile?.full_name || 'Familiar';
          if (!profile?.full_name && profile?.email) {
            const emailName = profile.email.split('@')[0];
            // Capitalize first letter
            displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          }

          return {
            id: link.family_member_id,
            name: displayName,
            email: '', // Hide email for privacy
            relationship: link.relationship,
            status: link.status,
            totalSessions,
            avgAccuracy,
            totalPlayTime,
            lastActivity,
            recentGames
          };
        })
      );

      console.log('[FamilyProgress] Final members with progress:', membersWithProgress);
      setFamilyMembers(membersWithProgress);
    } catch (error) {
      console.error('Error loading family progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFamilyLink = async (familyMemberEmail: string, relationship: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      // Find user by email
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', familyMemberEmail)
        .maybeSingle();

      if (userError || !targetUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Create family link
      const { error: linkError } = await supabase
        .from('family_links')
        .insert({
          parent_user_id: user.id,
          family_member_id: targetUser.id,
          relationship,
          status: 'pending'
        });

      if (linkError) {
        if (linkError.code === '23505') {
          return { success: false, error: 'Vínculo já existe' };
        }
        return { success: false, error: linkError.message };
      }

      await loadFamilyMembers();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    familyMembers,
    loading,
    reload: loadFamilyMembers,
    addFamilyLink
  };
}
