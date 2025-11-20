-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'performance', 'consistency', 'milestone', 'streak'
  icon TEXT NOT NULL,
  required_value INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_key)
);

-- Create cooperative_sessions table for parent-child multiplayer
CREATE TABLE IF NOT EXISTS public.cooperative_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL,
  game_id UUID NOT NULL REFERENCES cognitive_games(id),
  host_profile_id UUID NOT NULL REFERENCES child_profiles(id),
  guest_profile_id UUID REFERENCES child_profiles(id),
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'completed'
  session_data JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_sessions ENABLE ROW LEVEL SECURITY;

-- Achievements are viewable by everyone
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Cooperative sessions policies
CREATE POLICY "Parents can view their children's cooperative sessions"
  ON public.cooperative_sessions FOR SELECT
  USING (
    host_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
    OR guest_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "Parents can create cooperative sessions"
  ON public.cooperative_sessions FOR INSERT
  WITH CHECK (
    host_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "Parents can update their children's cooperative sessions"
  ON public.cooperative_sessions FOR UPDATE
  USING (
    host_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
    OR guest_profile_id IN (SELECT id FROM child_profiles WHERE parent_user_id = auth.uid())
  );

-- Insert default achievements
INSERT INTO public.achievements (key, name, description, category, icon, required_value, rarity) VALUES
  ('first_game', 'Primeira Jornada', 'Complete seu primeiro jogo', 'milestone', '🎮', 1, 'common'),
  ('games_10', 'Explorador', 'Complete 10 jogos', 'milestone', '🗺️', 10, 'common'),
  ('games_50', 'Veterano', 'Complete 50 jogos', 'milestone', '⭐', 50, 'rare'),
  ('games_100', 'Mestre', 'Complete 100 jogos', 'milestone', '👑', 100, 'epic'),
  ('accuracy_85', 'Precisão Cirúrgica', 'Obtenha 85%+ de precisão', 'performance', '🎯', 85, 'rare'),
  ('accuracy_95', 'Perfeição', 'Obtenha 95%+ de precisão', 'performance', '💎', 95, 'epic'),
  ('speed_demon', 'Relâmpago', 'Tempo de reação <500ms', 'performance', '⚡', 500, 'rare'),
  ('streak_3', 'Persistente', 'Mantenha 3 dias de sequência', 'streak', '🔥', 3, 'common'),
  ('streak_7', 'Dedicado', 'Mantenha 7 dias de sequência', 'streak', '🌟', 7, 'rare'),
  ('streak_30', 'Inabalável', 'Mantenha 30 dias de sequência', 'streak', '🏆', 30, 'legendary'),
  ('consistent', 'Consistência', 'Complete 5 sessões com 80%+ precisão', 'consistency', '📈', 5, 'rare'),
  ('night_owl', 'Coruja Noturna', 'Complete jogo após 20h', 'milestone', '🦉', 1, 'common'),
  ('early_bird', 'Madrugador', 'Complete jogo antes das 8h', 'milestone', '🌅', 1, 'common'),
  ('cooperative', 'Trabalho em Equipe', 'Complete jogo cooperativo', 'milestone', '🤝', 1, 'rare'),
  ('perfect_score', 'Pontuação Perfeita', 'Obtenha 100% de precisão', 'performance', '💯', 100, 'legendary')
ON CONFLICT (key) DO NOTHING;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  total_games INTEGER;
  high_accuracy_count INTEGER;
  current_accuracy NUMERIC;
  current_reaction_time INTEGER;
  current_hour INTEGER;
BEGIN
  -- Only process completed sessions
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    
    -- Get user_id from child_profile
    DECLARE
      target_user_id UUID;
    BEGIN
      SELECT parent_user_id INTO target_user_id 
      FROM child_profiles 
      WHERE id = NEW.child_profile_id;
      
      -- Count total completed games
      SELECT COUNT(*) INTO total_games
      FROM game_sessions
      WHERE child_profile_id = NEW.child_profile_id
        AND completed = true;
      
      current_accuracy := NEW.accuracy_percentage;
      current_reaction_time := NEW.avg_reaction_time_ms;
      current_hour := EXTRACT(HOUR FROM NEW.completed_at);
      
      -- First game achievement
      IF total_games = 1 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'first_game', 1, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      -- Milestone achievements
      IF total_games >= 10 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'games_10', 10, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      IF total_games >= 50 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'games_50', 50, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      IF total_games >= 100 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'games_100', 100, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      -- Performance achievements
      IF current_accuracy >= 85 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'accuracy_85', current_accuracy::INTEGER, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      IF current_accuracy >= 95 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'accuracy_95', current_accuracy::INTEGER, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      IF current_accuracy = 100 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'perfect_score', 100, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      IF current_reaction_time IS NOT NULL AND current_reaction_time < 500 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'speed_demon', current_reaction_time, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      -- Time-based achievements
      IF current_hour >= 20 OR current_hour < 6 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'night_owl', 1, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      IF current_hour >= 6 AND current_hour < 8 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'early_bird', 1, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
      
      -- Consistency achievement
      SELECT COUNT(*) INTO high_accuracy_count
      FROM game_sessions
      WHERE child_profile_id = NEW.child_profile_id
        AND completed = true
        AND accuracy_percentage >= 80
      ORDER BY completed_at DESC
      LIMIT 5;
      
      IF high_accuracy_count >= 5 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'consistent', 5, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic achievement checking
CREATE TRIGGER check_achievements_trigger
  AFTER INSERT OR UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_achievements();

-- Enable realtime for cooperative sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.cooperative_sessions;