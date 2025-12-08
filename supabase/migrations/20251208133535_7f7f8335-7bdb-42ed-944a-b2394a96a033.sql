-- Create community tables for Phase 3 Social Community

-- Activity feed posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('achievement', 'milestone', 'story_complete', 'game_complete', 'routine_complete', 'badge_earned', 'level_up', 'streak', 'custom')),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post likes
CREATE TABLE public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social missions (weekly/daily community challenges)
CREATE TABLE public.social_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'special')),
  category TEXT NOT NULL CHECK (category IN ('games', 'stories', 'routines', 'social', 'learning')),
  points_reward INTEGER DEFAULT 10,
  badge_reward TEXT,
  requirements JSONB NOT NULL DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User mission progress
CREATE TABLE public.user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES public.social_missions(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Community points/gamification
CREATE TABLE public.community_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'Iniciante',
  badges_earned TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Community leaderboard cache
CREATE TABLE public.community_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  points INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Users can view public posts" ON public.community_posts
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create own posts" ON public.community_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for community_likes
CREATE POLICY "Users can view all likes" ON public.community_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.community_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own likes" ON public.community_likes
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for community_comments
CREATE POLICY "Users can view all comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON public.community_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.community_comments
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for social_missions
CREATE POLICY "Everyone can view active missions" ON public.social_missions
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_mission_progress
CREATE POLICY "Users can view own progress" ON public.user_mission_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress" ON public.user_mission_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.user_mission_progress
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for community_points
CREATE POLICY "Users can view all points" ON public.community_points
  FOR SELECT USING (true);

CREATE POLICY "Users can create own points" ON public.community_points
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own points" ON public.community_points
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for community_leaderboard
CREATE POLICY "Everyone can view leaderboard" ON public.community_leaderboard
  FOR SELECT USING (true);

-- Enable realtime for community features
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;

-- Insert default social missions
INSERT INTO public.social_missions (title, description, mission_type, category, points_reward, requirements) VALUES
('Explorador do Dia', 'Complete 3 jogos terapêuticos hoje', 'daily', 'games', 15, '{"games_count": 3}'),
('Contador de Histórias', 'Leia 2 histórias sociais', 'daily', 'stories', 10, '{"stories_count": 2}'),
('Mestre da Rotina', 'Complete sua rotina matinal', 'daily', 'routines', 10, '{"routine_type": "morning"}'),
('Campeão da Semana', 'Complete 20 atividades esta semana', 'weekly', 'learning', 50, '{"activities_count": 20}'),
('Amigo da Comunidade', 'Deixe 5 curtidas em posts da comunidade', 'weekly', 'social', 20, '{"likes_count": 5}'),
('Explorador de Planetas', 'Visite todos os 5 planetas do Sistema Azul', 'weekly', 'games', 30, '{"planets_visited": 5}'),
('Super Streak', 'Mantenha uma sequência de 7 dias', 'special', 'learning', 100, '{"streak_days": 7}');