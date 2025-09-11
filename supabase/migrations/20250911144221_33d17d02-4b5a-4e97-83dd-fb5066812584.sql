-- Create social scenarios table
CREATE TABLE public.social_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL, -- school, work, family, friends, public
  difficulty_level TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced
  age_range TEXT NOT NULL DEFAULT '12-18',
  skills_focus TEXT[] NOT NULL DEFAULT '{}', -- communication, assertiveness, empathy, conflict_resolution
  scenario_data JSONB NOT NULL DEFAULT '{}',
  choices JSONB NOT NULL DEFAULT '[]',
  educational_notes TEXT,
  unlock_requirements JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social sessions table for user progress
CREATE TABLE public.social_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_id UUID NOT NULL REFERENCES public.social_scenarios(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  choices_made JSONB NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  empathy_score INTEGER NOT NULL DEFAULT 0,
  assertiveness_score INTEGER NOT NULL DEFAULT 0,
  communication_score INTEGER NOT NULL DEFAULT 0,
  completion_time_seconds INTEGER DEFAULT NULL,
  feedback_received JSONB DEFAULT NULL,
  achievements_unlocked TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Enable Row Level Security
ALTER TABLE public.social_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for social_scenarios
CREATE POLICY "Anyone can view social scenarios" 
ON public.social_scenarios 
FOR SELECT 
USING (true);

-- Create policies for social_sessions  
CREATE POLICY "Users can manage their own social sessions" 
ON public.social_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create social progress tracking table
CREATE TABLE public.social_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_type TEXT NOT NULL, -- communication, assertiveness, empathy, conflict_resolution
  current_level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  scenarios_completed INTEGER NOT NULL DEFAULT 0,
  best_scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_type)
);

-- Enable RLS for social_progress
ALTER TABLE public.social_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own social progress" 
ON public.social_progress 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create social achievements table
CREATE TABLE public.social_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🗣️',
  requirement_type TEXT NOT NULL, -- scenarios_completed, empathy_score, etc.
  requirement_value JSONB NOT NULL,
  stars_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user social achievements table
CREATE TABLE public.user_social_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_name TEXT NOT NULL REFERENCES public.social_achievements(name),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_stats JSONB DEFAULT NULL,
  UNIQUE(user_id, achievement_name)
);

-- Enable RLS
ALTER TABLE public.social_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view social achievements" 
ON public.social_achievements 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own social achievements" 
ON public.user_social_achievements 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert predefined social scenarios
INSERT INTO public.social_scenarios (title, description, context, difficulty_level, age_range, skills_focus, scenario_data, choices, educational_notes) VALUES
('Apresentação em Grupo', 'Você precisa se apresentar para um grupo de pessoas que não conhece em uma festa.', 'social', 'beginner', '12-25', ARRAY['communication', 'confidence'], 
'{"setting": "festa", "characters": ["grupo de jovens"], "situation": "chegou sozinho na festa"}',
'[
  {"id": 1, "text": "Esperar alguém me cumprimentar primeiro", "empathy": 2, "assertiveness": 1, "communication": 2, "consequence": "Você fica isolado e perde oportunidades de conexão."},
  {"id": 2, "text": "Me aproximar com um sorriso e me apresentar", "empathy": 4, "assertiveness": 5, "communication": 5, "consequence": "O grupo te recebe bem e você se sente integrado."},
  {"id": 3, "text": "Interromper a conversa com um comentário alto", "empathy": 1, "assertiveness": 3, "communication": 2, "consequence": "As pessoas ficam desconfortáveis e você não é bem recebido."}
]',
'A comunicação assertiva começa com um sorriso genuíno e interesse real pelas outras pessoas.'
),
('Conflito com Colega', 'Um colega de trabalho sempre interrompe suas falas nas reuniões.', 'work', 'intermediate', '18-35', ARRAY['assertiveness', 'conflict_resolution'], 
'{"setting": "escritório", "characters": ["colega interruptor"], "situation": "reunião de equipe"}',
'[
  {"id": 1, "text": "Ignorar e continuar sendo interrompido", "empathy": 2, "assertiveness": 1, "communication": 2, "consequence": "O problema persiste e sua frustração aumenta."},
  {"id": 2, "text": "Conversar privately após a reunião de forma respeitosa", "empathy": 5, "assertiveness": 5, "communication": 5, "consequence": "O colega entende e melhora seu comportamento."},
  {"id": 3, "text": "Confrontar agressivamente na frente de todos", "empathy": 1, "assertiveness": 3, "communication": 2, "consequence": "O ambiente fica tenso e você é visto como problemático."}
]',
'Conflitos são melhor resolvidos em conversas privadas, com foco no comportamento, não na pessoa.'
),
('Pedido de Ajuda', 'Você está com dificuldades em um projeto e precisa pedir ajuda ao seu supervisor.', 'work', 'beginner', '18-35', ARRAY['communication', 'vulnerability'], 
'{"setting": "escritório", "characters": ["supervisor"], "situation": "projeto atrasado"}',
'[
  {"id": 1, "text": "Esconder as dificuldades até o último momento", "empathy": 2, "assertiveness": 1, "communication": 1, "consequence": "O projeto falha e você perde credibilidade."},
  {"id": 2, "text": "Pedir ajuda explicando claramente onde está a dificuldade", "empathy": 4, "assertiveness": 4, "communication": 5, "consequence": "Você recebe suporte e o projeto é concluído com sucesso."},
  {"id": 3, "text": "Culpar outros fatores pelas dificuldades", "empathy": 1, "assertiveness": 2, "communication": 2, "consequence": "O supervisor questiona sua responsabilidade."}
]',
'Pedir ajuda é um sinal de maturidade profissional, não de fraqueza.'
);

-- Insert social achievements
INSERT INTO public.social_achievements (name, title, description, icon, requirement_type, requirement_value, stars_reward) VALUES
('first_scenario', 'Primeiro Passo', 'Complete seu primeiro cenário social', '👋', 'scenarios_completed', '{"value": 1}', 10),
('empathy_champion', 'Campeão da Empatia', 'Faça 10 escolhas empáticas', '❤️', 'empathy_choices', '{"value": 10}', 25),
('assertive_communicator', 'Comunicador Assertivo', 'Complete 5 cenários com alta pontuação de assertividade', '💪', 'assertive_scenarios', '{"value": 5, "min_score": 4}', 30),
('conflict_resolver', 'Mediador', 'Resolva 3 cenários de conflito com sucesso', '🤝', 'conflict_scenarios_completed', '{"value": 3, "context": "work"}', 35),
('social_butterfly', 'Borboleta Social', 'Complete 15 cenários sociais', '🦋', 'scenarios_completed', '{"value": 15}', 50),
('perfect_score', 'Pontuação Perfeita', 'Obtenha pontuação máxima em um cenário', '⭐', 'perfect_scenario', '{"value": 1}', 40),
('skill_master', 'Mestre das Habilidades', 'Atinja nível 5 em qualquer habilidade social', '🎓', 'skill_level_reached', '{"value": 5}', 60);

-- Create function to update social progress
CREATE OR REPLACE FUNCTION public.update_social_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update experience and level for each skill
  INSERT INTO public.social_progress (user_id, skill_type, current_level, experience_points, scenarios_completed, best_scores)
  VALUES 
    (NEW.user_id, 'communication', 1, NEW.communication_score * 2, 1, jsonb_build_object('communication', NEW.communication_score)),
    (NEW.user_id, 'empathy', 1, NEW.empathy_score * 2, 1, jsonb_build_object('empathy', NEW.empathy_score)),
    (NEW.user_id, 'assertiveness', 1, NEW.assertiveness_score * 2, 1, jsonb_build_object('assertiveness', NEW.assertiveness_score))
  ON CONFLICT (user_id, skill_type) DO UPDATE SET
    experience_points = social_progress.experience_points + (NEW.communication_score * 2),
    scenarios_completed = social_progress.scenarios_completed + 1,
    current_level = GREATEST(1, (social_progress.experience_points + (NEW.communication_score * 2)) / 50 + 1),
    best_scores = CASE 
      WHEN skill_type = 'communication' THEN 
        jsonb_set(social_progress.best_scores, '{communication}', to_jsonb(GREATEST((social_progress.best_scores->>'communication')::integer, NEW.communication_score)))
      WHEN skill_type = 'empathy' THEN
        jsonb_set(social_progress.best_scores, '{empathy}', to_jsonb(GREATEST((social_progress.best_scores->>'empathy')::integer, NEW.empathy_score)))  
      WHEN skill_type = 'assertiveness' THEN
        jsonb_set(social_progress.best_scores, '{assertiveness}', to_jsonb(GREATEST((social_progress.best_scores->>'assertiveness')::integer, NEW.assertiveness_score)))
      ELSE social_progress.best_scores
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for social progress updates
CREATE TRIGGER update_social_progress_trigger
BEFORE INSERT ON public.social_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_social_progress();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_social_scenarios_updated_at
BEFORE UPDATE ON public.social_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_progress_updated_at
BEFORE UPDATE ON public.social_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();