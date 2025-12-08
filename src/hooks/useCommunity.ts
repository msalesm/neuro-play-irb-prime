import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CommunityPost {
  id: string;
  user_id: string;
  child_id?: string;
  post_type: string;
  title: string;
  content?: string;
  image_url?: string;
  metadata: Record<string, any>;
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    name: string;
  };
  user_liked?: boolean;
}

interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
  };
}

interface SocialMission {
  id: string;
  title: string;
  description: string;
  mission_type: 'daily' | 'weekly' | 'special';
  category: string;
  points_reward: number;
  badge_reward?: string;
  requirements: Record<string, any>;
  progress?: number;
  target?: number;
  completed?: boolean;
}

interface CommunityPoints {
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  level: number;
  rank: string;
  badges_earned: string[];
}

interface LeaderboardEntry {
  user_id: string;
  points: number;
  rank: number;
  name?: string;
}

export function useCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [missions, setMissions] = useState<SocialMission[]>([]);
  const [myPoints, setMyPoints] = useState<CommunityPoints | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch community posts
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, { name: p.full_name || 'Usuário' }])
      );

      // Check which posts the user has liked
      let likedPostIds = new Set<string>();
      if (user && data) {
        const { data: userLikes } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', user.id);
        likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
      }

      const transformedPosts: CommunityPost[] = (data || []).map(post => ({
        ...post,
        metadata: (typeof post.metadata === 'object' && post.metadata !== null) 
          ? post.metadata as Record<string, any> 
          : {},
        profiles: profilesMap.get(post.user_id),
        user_liked: likedPostIds.has(post.id)
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [user]);

  // Fetch social missions with user progress
  const fetchMissions = useCallback(async () => {
    try {
      const { data: missionsData, error: missionsError } = await supabase
        .from('social_missions')
        .select('*')
        .eq('is_active', true);

      if (missionsError) throw missionsError;

      if (user && missionsData) {
        const { data: progressData } = await supabase
          .from('user_mission_progress')
          .select('*')
          .eq('user_id', user.id);

        const progressMap = new Map(
          progressData?.map(p => [p.mission_id, p]) || []
        );

        const transformedMissions: SocialMission[] = missionsData.map(mission => {
          const progress = progressMap.get(mission.id);
          const requirements = (typeof mission.requirements === 'object' && mission.requirements !== null)
            ? mission.requirements as Record<string, any>
            : {};
          return {
            id: mission.id,
            title: mission.title,
            description: mission.description,
            mission_type: mission.mission_type as 'daily' | 'weekly' | 'special',
            category: mission.category,
            points_reward: mission.points_reward || 10,
            badge_reward: mission.badge_reward || undefined,
            requirements,
            progress: progress?.progress || 0,
            target: progress?.target || getTargetFromRequirements(requirements),
            completed: progress?.completed || false
          };
        });
        setMissions(transformedMissions);
      } else {
        const transformedMissions: SocialMission[] = (missionsData || []).map(mission => {
          const requirements = (typeof mission.requirements === 'object' && mission.requirements !== null)
            ? mission.requirements as Record<string, any>
            : {};
          return {
            id: mission.id,
            title: mission.title,
            description: mission.description,
            mission_type: mission.mission_type as 'daily' | 'weekly' | 'special',
            category: mission.category,
            points_reward: mission.points_reward || 10,
            badge_reward: mission.badge_reward || undefined,
            requirements,
          };
        });
        setMissions(transformedMissions);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  }, [user]);

  // Fetch user's community points
  const fetchMyPoints = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('community_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMyPoints({
          total_points: data.total_points || 0,
          weekly_points: data.weekly_points || 0,
          monthly_points: data.monthly_points || 0,
          level: data.level || 1,
          rank: data.rank || 'Iniciante',
          badges_earned: data.badges_earned || []
        });
      } else {
        // Initialize points for new user
        const { error: insertError } = await supabase
          .from('community_points')
          .insert({ user_id: user.id });

        if (!insertError) {
          setMyPoints({
            total_points: 0,
            weekly_points: 0,
            monthly_points: 0,
            level: 1,
            rank: 'Iniciante',
            badges_earned: []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  }, [user]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (period: 'weekly' | 'monthly' | 'all_time' = 'weekly') => {
    try {
      const { data, error } = await supabase
        .from('community_leaderboard')
        .select('*')
        .eq('period', period)
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(e => e.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p.full_name])
      );

      setLeaderboard(data?.map((entry, index) => ({
        user_id: entry.user_id,
        points: entry.points || 0,
        rank: index + 1,
        name: profilesMap.get(entry.user_id) || 'Usuário'
      })) || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, []);

  // Create a new post
  const createPost = async (post: Partial<CommunityPost>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          post_type: post.post_type || 'custom',
          title: post.title || '',
          content: post.content,
          image_url: post.image_url,
          metadata: post.metadata || {},
          is_public: post.is_public ?? true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Publicado!',
        description: 'Sua conquista foi compartilhada com a comunidade.'
      });

      await fetchPosts();
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Like/unlike a post
  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count - 1, user_liked: false }
            : p
        ));
      } else {
        await supabase
          .from('community_likes')
          .insert({ post_id: postId, user_id: user.id });

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count + 1, user_liked: true }
            : p
        ));

        await addPoints(2, 'like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Add a comment
  const addComment = async (postId: string, content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch profile for the comment
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));

      await addPoints(5, 'comment');

      return {
        ...data,
        profiles: { name: profileData?.full_name || 'Usuário' }
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string): Promise<CommunityComment[]> => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, { name: p.full_name || 'Usuário' }])
      );

      return (data || []).map(comment => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id)
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  // Add points to user
  const addPoints = async (points: number, _reason: string) => {
    if (!user) return;

    try {
      await supabase
        .from('community_points')
        .upsert({
          user_id: user.id,
          total_points: (myPoints?.total_points || 0) + points,
          weekly_points: (myPoints?.weekly_points || 0) + points,
          monthly_points: (myPoints?.monthly_points || 0) + points,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      await fetchMyPoints();
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  // Update mission progress
  const updateMissionProgress = async (missionId: string, progressIncrement: number = 1) => {
    if (!user) return;

    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    try {
      const newProgress = (mission.progress || 0) + progressIncrement;
      const target = mission.target || 1;
      const completed = newProgress >= target;

      await supabase
        .from('user_mission_progress')
        .upsert({
          user_id: user.id,
          mission_id: missionId,
          progress: newProgress,
          target: target,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          points_earned: completed ? mission.points_reward : 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,mission_id' });

      if (completed) {
        await addPoints(mission.points_reward, `mission_${mission.mission_type}`);
        
        toast({
          title: '🎉 Missão Completa!',
          description: `Você completou "${mission.title}" e ganhou ${mission.points_reward} pontos!`
        });

        await createPost({
          post_type: 'achievement',
          title: `Completou a missão: ${mission.title}`,
          content: mission.description,
          metadata: { mission_id: missionId, points: mission.points_reward }
        });
      }

      await fetchMissions();
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  function getTargetFromRequirements(requirements: Record<string, any>): number {
    const values = Object.values(requirements);
    return typeof values[0] === 'number' ? values[0] : 1;
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPosts(),
        fetchMissions(),
        fetchMyPoints(),
        fetchLeaderboard()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchPosts, fetchMissions, fetchMyPoints, fetchLeaderboard]);

  useEffect(() => {
    const channel = supabase
      .channel('community-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_likes' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return {
    posts,
    missions,
    myPoints,
    leaderboard,
    loading,
    createPost,
    toggleLike,
    addComment,
    fetchComments,
    updateMissionProgress,
    addPoints,
    fetchLeaderboard,
    refetch: () => Promise.all([fetchPosts(), fetchMissions(), fetchMyPoints()])
  };
}
