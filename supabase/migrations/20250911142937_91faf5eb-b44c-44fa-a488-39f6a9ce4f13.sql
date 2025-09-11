-- Criar tabela para estatísticas detalhadas do Focus Forest
CREATE TABLE public.focus_forest_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  hits INTEGER NOT NULL DEFAULT 0,
  misses INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  trees_grown INTEGER NOT NULL DEFAULT 0,
  best_accuracy_per_level JSONB DEFAULT '{}',
  targets_hit_sequence JSONB DEFAULT '[]',
  achievements_unlocked TEXT[] DEFAULT '{}',
  difficulty_modifier TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.focus_forest_stats ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can manage their own focus forest stats" 
ON public.focus_forest_stats 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar tabela para achievements específicos do Focus Forest
CREATE TABLE public.focus_forest_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🌲',
  requirement_type TEXT NOT NULL, -- 'precision', 'speed', 'endurance', 'level'
  requirement_value JSONB NOT NULL, -- critério específico
  stars_reward INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir achievements predefinidos
INSERT INTO public.focus_forest_achievements (name, title, description, icon, requirement_type, requirement_value, stars_reward) VALUES
('first_forest', 'Primeira Floresta', 'Complete seu primeiro nível no Focus Forest', '🌱', 'level', '{"level": 1, "min_hits": 5}', 1),
('forest_guardian', 'Guardião da Floresta', 'Alcance 90% de precisão em uma sessão', '🛡️', 'precision', '{"min_accuracy": 90}', 2),
('target_master', 'Mestre dos Alvos', 'Complete todos os 5 níveis', '🎯', 'level', '{"level": 5, "min_hits": 15}', 3),
('speed_demon', 'Velocista da Floresta', 'Acerte 30 alvos em menos de 2 minutos', '⚡', 'speed', '{"min_hits": 30, "max_time_seconds": 120}', 2),
('surgical_precision', 'Precisão Cirúrgica', 'Acerte 20 alvos consecutivos sem errar', '🔬', 'precision', '{"consecutive_hits": 20}', 3),
('forest_endurance', 'Resistência da Floresta', 'Jogue por 5 minutos consecutivos mantendo 70%+ precisão', '💪', 'endurance', '{"min_duration_seconds": 300, "min_accuracy": 70}', 2),
('tree_planter', 'Plantador Mestre', 'Cultive 100 árvores no total', '🌳', 'trees', '{"total_trees": 100}', 2);

-- Ativar RLS na tabela de achievements
ALTER TABLE public.focus_forest_achievements ENABLE ROW LEVEL SECURITY;

-- Criar política para visualizar achievements (todos podem ver)
CREATE POLICY "Anyone can view focus forest achievements" 
ON public.focus_forest_achievements 
FOR SELECT 
USING (true);

-- Criar tabela para achievements desbloqueados pelos usuários
CREATE TABLE public.user_focus_forest_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_name TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_stats JSONB, -- estatísticas da sessão que desbloqueou
  UNIQUE(user_id, achievement_name)
);

-- Ativar RLS
ALTER TABLE public.user_focus_forest_achievements ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can manage their own focus forest achievements" 
ON public.user_focus_forest_achievements 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at na tabela stats
CREATE TRIGGER update_focus_forest_stats_updated_at
BEFORE UPDATE ON public.focus_forest_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();