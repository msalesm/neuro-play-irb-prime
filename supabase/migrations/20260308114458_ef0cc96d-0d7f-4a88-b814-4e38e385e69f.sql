
-- ============================================
-- ABA NeuroPlay Module - Core Tables
-- ============================================

-- Skill categories enum
CREATE TYPE public.aba_skill_category AS ENUM (
  'atencao_conjunta',
  'imitacao',
  'comunicacao_funcional',
  'instrucoes_simples',
  'regulacao_emocional',
  'flexibilidade_cognitiva',
  'interacao_social',
  'autonomia'
);

-- Prompt levels enum
CREATE TYPE public.aba_prompt_level AS ENUM (
  'fisico',
  'gestual',
  'verbal',
  'visual',
  'independente'
);

-- Teaching methods enum
CREATE TYPE public.aba_teaching_method AS ENUM (
  'dtt',
  'net',
  'task_analysis',
  'prompting',
  'shaping'
);

-- 1. Skills Library
CREATE TABLE public.aba_np_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  skill_category aba_skill_category NOT NULL,
  description TEXT,
  recommended_activities JSONB DEFAULT '[]'::jsonb,
  related_game_ids TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Programs (one per child per therapist)
CREATE TABLE public.aba_np_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  program_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  reinforcement_strategy JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Interventions (skills within a program)
CREATE TABLE public.aba_np_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.aba_np_programs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.aba_np_skills(id),
  baseline_level INTEGER DEFAULT 0,
  target_level INTEGER DEFAULT 80,
  current_level INTEGER DEFAULT 0,
  teaching_method aba_teaching_method DEFAULT 'dtt',
  prompting_strategy TEXT,
  reinforcement_type TEXT,
  success_criteria TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'mastered', 'paused', 'discontinued')),
  started_at TIMESTAMPTZ DEFAULT now(),
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Trials (data collection per attempt)
CREATE TABLE public.aba_np_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES public.aba_np_interventions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id),
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  prompt_level aba_prompt_level NOT NULL DEFAULT 'independente',
  response TEXT,
  correct BOOLEAN NOT NULL,
  latency_ms INTEGER,
  reinforcement_given BOOLEAN DEFAULT false,
  reinforcement_type TEXT,
  session_number INTEGER DEFAULT 1,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Reinforcement library
CREATE TABLE public.aba_np_reinforcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'tangible' CHECK (category IN ('social', 'tangible', 'activity', 'token', 'sensory')),
  icon TEXT,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ABA Reports (auto-generated summaries)
CREATE TABLE public.aba_np_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id),
  program_id UUID REFERENCES public.aba_np_programs(id),
  generated_by UUID REFERENCES public.profiles(id),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  skills_trained JSONB DEFAULT '[]'::jsonb,
  progress_summary JSONB DEFAULT '{}'::jsonb,
  behavioral_observations TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_aba_np_programs_child ON public.aba_np_programs(child_id);
CREATE INDEX idx_aba_np_programs_created_by ON public.aba_np_programs(created_by);
CREATE INDEX idx_aba_np_interventions_program ON public.aba_np_interventions(program_id);
CREATE INDEX idx_aba_np_trials_intervention ON public.aba_np_trials(intervention_id);
CREATE INDEX idx_aba_np_trials_child ON public.aba_np_trials(child_id);
CREATE INDEX idx_aba_np_trials_recorded_at ON public.aba_np_trials(recorded_at);
CREATE INDEX idx_aba_np_reports_child ON public.aba_np_reports(child_id);

-- Updated_at triggers
CREATE TRIGGER update_aba_np_skills_updated_at
  BEFORE UPDATE ON public.aba_np_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aba_np_programs_updated_at
  BEFORE UPDATE ON public.aba_np_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aba_np_interventions_updated_at
  BEFORE UPDATE ON public.aba_np_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.aba_np_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aba_np_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aba_np_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aba_np_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aba_np_reinforcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aba_np_reports ENABLE ROW LEVEL SECURITY;

-- Skills: readable by all authenticated
CREATE POLICY "Skills readable by authenticated" ON public.aba_np_skills
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Skills manageable by therapists/admins" ON public.aba_np_skills
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'therapist')
  );

-- Programs: only by those with child access
CREATE POLICY "Programs viewable by child access" ON public.aba_np_programs
  FOR SELECT TO authenticated USING (
    public.has_child_access(auth.uid(), child_id)
  );

CREATE POLICY "Programs created by therapists" ON public.aba_np_programs
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'therapist') OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Programs updated by creator" ON public.aba_np_programs
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')
  );

-- Interventions: via program access
CREATE POLICY "Interventions viewable via program" ON public.aba_np_interventions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.aba_np_programs p WHERE p.id = program_id AND public.has_child_access(auth.uid(), p.child_id))
  );

CREATE POLICY "Interventions managed by therapists" ON public.aba_np_interventions
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'therapist') OR public.has_role(auth.uid(), 'admin')
  );

-- Trials: child access
CREATE POLICY "Trials viewable by child access" ON public.aba_np_trials
  FOR SELECT TO authenticated USING (
    public.has_child_access(auth.uid(), child_id)
  );

CREATE POLICY "Trials recorded by therapists" ON public.aba_np_trials
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'therapist') OR public.has_role(auth.uid(), 'admin')
  );

-- Reinforcements: all authenticated
CREATE POLICY "Reinforcements readable" ON public.aba_np_reinforcements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Reinforcements managed by therapists" ON public.aba_np_reinforcements
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'therapist') OR public.has_role(auth.uid(), 'admin')
  );

-- Reports: child access
CREATE POLICY "Reports viewable by child access" ON public.aba_np_reports
  FOR SELECT TO authenticated USING (
    public.has_child_access(auth.uid(), child_id)
  );

CREATE POLICY "Reports created by therapists" ON public.aba_np_reports
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'therapist') OR public.has_role(auth.uid(), 'admin')
  );
