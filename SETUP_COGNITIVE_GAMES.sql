-- =====================================================
-- NEURO GAME 2.0 - COGNITIVE GAMES SYSTEM
-- Copie e cole este SQL no Supabase SQL Editor
-- =====================================================

-- Tabela de categorias de jogos
CREATE TABLE IF NOT EXISTS public.game_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_condition TEXT[], -- ['TEA', 'TDAH', 'DISLEXIA']
  cognitive_domains TEXT[], -- ['attention', 'memory', 'inhibition', etc]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de jogos disponíveis
CREATE TABLE IF NOT EXISTS public.cognitive_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.game_categories(id),
  description TEXT,
  target_conditions TEXT[],
  cognitive_domains TEXT[],
  age_min INTEGER DEFAULT 5,
  age_max INTEGER DEFAULT 18,
  difficulty_levels INTEGER DEFAULT 10,
  avg_duration_minutes INTEGER DEFAULT 10,
  sensory_settings JSONB DEFAULT '{}'::jsonb,
  game_config JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de perfis de crianças
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  diagnosed_conditions TEXT[],
  sensory_profile JSONB DEFAULT '{}'::jsonb,
  cognitive_baseline JSONB DEFAULT '{}'::jsonb,
  current_level INTEGER DEFAULT 1,
  total_stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sessões de jogo
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.cognitive_games(id) NOT NULL,
  session_number INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  difficulty_level INTEGER DEFAULT 1,
  auto_adjusted_difficulty BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  max_possible_score INTEGER,
  accuracy_percentage DECIMAL(5,2),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  incorrect_attempts INTEGER DEFAULT 0,
  avg_reaction_time_ms INTEGER,
  fastest_reaction_time_ms INTEGER,
  slowest_reaction_time_ms INTEGER,
  attention_span_seconds INTEGER,
  error_pattern JSONB,
  frustration_events INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  help_requests INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  quit_reason TEXT,
  session_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de métricas em tempo real
CREATE TABLE IF NOT EXISTS public.game_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  reaction_time_ms INTEGER,
  difficulty_at_event INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso adaptativo
CREATE TABLE IF NOT EXISTS public.adaptive_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.cognitive_games(id) NOT NULL,
  current_difficulty INTEGER DEFAULT 1,
  sessions_completed INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  avg_accuracy DECIMAL(5,2),
  avg_reaction_time_ms INTEGER,
  mastery_level DECIMAL(3,2) DEFAULT 0.0,
  last_played_at TIMESTAMPTZ,
  recommended_next_difficulty INTEGER,
  ai_insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_profile_id, game_id)
);

-- Tabela de recomendações de IA
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  title TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,
  recommended_games UUID[],
  suggested_actions JSONB,
  status TEXT DEFAULT 'pending',
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ
);

-- RLS POLICIES
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies públicas
CREATE POLICY "Anyone can view game categories"
  ON public.game_categories FOR SELECT USING (true);

CREATE POLICY "Anyone can view active games"
  ON public.cognitive_games FOR SELECT USING (active = true);

-- Policies para child_profiles
CREATE POLICY "Parents can view their children profiles"
  ON public.child_profiles FOR SELECT
  USING (parent_user_id = auth.uid());

CREATE POLICY "Parents can create their children profiles"
  ON public.child_profiles FOR INSERT
  WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Parents can update their children profiles"
  ON public.child_profiles FOR UPDATE
  USING (parent_user_id = auth.uid());

-- Policies para game_sessions
CREATE POLICY "Parents can view their children's sessions"
  ON public.game_sessions FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM public.child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create sessions for their children"
  ON public.game_sessions FOR INSERT
  WITH CHECK (
    child_profile_id IN (
      SELECT id FROM public.child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their children's sessions"
  ON public.game_sessions FOR UPDATE
  USING (
    child_profile_id IN (
      SELECT id FROM public.child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Policies para game_metrics
CREATE POLICY "Parents can view their children's metrics"
  ON public.game_metrics FOR SELECT
  USING (
    session_id IN (
      SELECT gs.id FROM public.game_sessions gs
      JOIN public.child_profiles cp ON gs.child_profile_id = cp.id
      WHERE cp.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create metrics"
  ON public.game_metrics FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT gs.id FROM public.game_sessions gs
      JOIN public.child_profiles cp ON gs.child_profile_id = cp.id
      WHERE cp.parent_user_id = auth.uid()
    )
  );

-- Policies para adaptive_progress
CREATE POLICY "Parents can view their children's progress"
  ON public.adaptive_progress FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM public.child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage adaptive progress"
  ON public.adaptive_progress FOR ALL
  USING (true) WITH CHECK (true);

-- Policies para ai_recommendations
CREATE POLICY "Parents can view recommendations"
  ON public.ai_recommendations FOR SELECT
  USING (
    child_profile_id IN (
      SELECT id FROM public.child_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update recommendation status"
  ON public.ai_recommendations FOR UPDATE
  USING (
    child_profile_id IN (
      SELECT id FROM public.child_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- INDEXES
CREATE INDEX idx_child_profiles_parent ON public.child_profiles(parent_user_id);
CREATE INDEX idx_game_sessions_child ON public.game_sessions(child_profile_id);
CREATE INDEX idx_game_sessions_game ON public.game_sessions(game_id);
CREATE INDEX idx_game_metrics_session ON public.game_metrics(session_id);
CREATE INDEX idx_adaptive_progress_child ON public.adaptive_progress(child_profile_id);

-- TRIGGER para atualizar progresso adaptativo
CREATE OR REPLACE FUNCTION public.update_adaptive_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    INSERT INTO public.adaptive_progress (
      child_profile_id, game_id, current_difficulty, sessions_completed,
      total_score, avg_accuracy, avg_reaction_time_ms, last_played_at,
      recommended_next_difficulty
    )
    VALUES (
      NEW.child_profile_id, NEW.game_id, NEW.difficulty_level, 1,
      NEW.score, NEW.accuracy_percentage, NEW.avg_reaction_time_ms, NEW.completed_at,
      CASE 
        WHEN NEW.accuracy_percentage >= 80 THEN LEAST(10, NEW.difficulty_level + 1)
        WHEN NEW.accuracy_percentage < 50 THEN GREATEST(1, NEW.difficulty_level - 1)
        ELSE NEW.difficulty_level
      END
    )
    ON CONFLICT (child_profile_id, game_id) 
    DO UPDATE SET
      sessions_completed = adaptive_progress.sessions_completed + 1,
      current_difficulty = NEW.difficulty_level,
      total_score = adaptive_progress.total_score + NEW.score,
      avg_accuracy = (adaptive_progress.avg_accuracy * adaptive_progress.sessions_completed + NEW.accuracy_percentage) / (adaptive_progress.sessions_completed + 1),
      avg_reaction_time_ms = (adaptive_progress.avg_reaction_time_ms * adaptive_progress.sessions_completed + NEW.avg_reaction_time_ms) / (adaptive_progress.sessions_completed + 1),
      mastery_level = LEAST(1.0, (adaptive_progress.sessions_completed::DECIMAL + 1) / 20),
      last_played_at = NEW.completed_at,
      recommended_next_difficulty = CASE 
        WHEN NEW.accuracy_percentage >= 80 THEN LEAST(10, NEW.difficulty_level + 1)
        WHEN NEW.accuracy_percentage < 50 THEN GREATEST(1, NEW.difficulty_level - 1)
        ELSE NEW.difficulty_level
      END,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_adaptive_progress
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_adaptive_progress();

-- DADOS INICIAIS
INSERT INTO public.game_categories (name, description, target_condition, cognitive_domains) VALUES
('Atenção Sustentada', 'Desenvolve capacidade de manter foco prolongado', ARRAY['TDAH', 'TEA'], ARRAY['sustained_attention']),
('Memória de Trabalho', 'Desenvolve capacidade de reter informações temporariamente', ARRAY['TDAH', 'DISLEXIA'], ARRAY['working_memory'])
ON CONFLICT DO NOTHING;

INSERT INTO public.cognitive_games (game_id, name, category_id, description, target_conditions, cognitive_domains) 
SELECT 
  'attention-sustained-focus',
  'Foco no Alvo',
  id,
  'Mantenha o foco em objetos específicos enquanto distrações aparecem',
  ARRAY['TDAH', 'TEA'],
  ARRAY['sustained_attention', 'selective_attention']
FROM public.game_categories WHERE name = 'Atenção Sustentada'
ON CONFLICT (game_id) DO NOTHING;

INSERT INTO public.cognitive_games (game_id, name, category_id, description, target_conditions, cognitive_domains)
SELECT 
  'memory-sequence-builder',
  'Sequência Mágica',
  id,
  'Memorize e reproduza sequências cada vez maiores',
  ARRAY['TDAH', 'DISLEXIA'],
  ARRAY['working_memory', 'sequential_processing']
FROM public.game_categories WHERE name = 'Memória de Trabalho'
ON CONFLICT (game_id) DO NOTHING;
