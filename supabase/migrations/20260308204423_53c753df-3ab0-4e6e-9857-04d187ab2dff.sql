
-- =============================================
-- ABA NeuroPlay: Extended Relational Schema
-- =============================================

-- 1. ABA Sessions (groups trials into clinical sessions)
CREATE TABLE public.aba_np_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.aba_np_programs(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id),
  session_number INTEGER NOT NULL DEFAULT 1,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INTEGER,
  environment TEXT, -- 'clinic', 'home', 'school', 'telehealth'
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ABA Goals (program objectives/metas)
CREATE TABLE public.aba_np_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.aba_np_programs(id) ON DELETE CASCADE,
  intervention_id UUID REFERENCES public.aba_np_interventions(id) ON DELETE SET NULL,
  goal_description TEXT NOT NULL,
  success_criteria TEXT, -- e.g. '80% accuracy across 3 consecutive sessions'
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'achieved', 'revised', 'discontinued'
  achieved_at TIMESTAMPTZ,
  review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ABA Progress (aggregated progress per program, recalculated)
CREATE TABLE public.aba_np_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.aba_np_programs(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_trials INTEGER NOT NULL DEFAULT 0,
  accuracy_rate NUMERIC(5,2) DEFAULT 0, -- 0-100
  independence_level NUMERIC(5,2) DEFAULT 0, -- 0-100
  avg_prompt_level NUMERIC(3,1) DEFAULT 0, -- 1-7
  prompt_reduction_trend TEXT, -- 'improving', 'stable', 'regressing'
  trend TEXT, -- 'ascending', 'stable', 'descending'
  notes TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, period_start, period_end)
);

-- 4. ABA Clinical Notes (observations per session)
CREATE TABLE public.aba_np_clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.aba_np_sessions(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.aba_np_programs(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id),
  note_type TEXT NOT NULL DEFAULT 'observation', -- 'observation', 'behavioral', 'environmental', 'family_report'
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ABA Game Mapping (links programs/skills to NeuroPlay games)
CREATE TABLE public.aba_np_game_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.aba_np_programs(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.aba_np_skills(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.cognitive_games(id) ON DELETE CASCADE,
  is_recommended BOOLEAN NOT NULL DEFAULT true,
  recommendation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, game_id)
);

-- 6. Add session_id FK to existing aba_np_trials
ALTER TABLE public.aba_np_trials
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.aba_np_sessions(id) ON DELETE SET NULL;

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_aba_np_sessions_program ON public.aba_np_sessions(program_id);
CREATE INDEX idx_aba_np_sessions_child ON public.aba_np_sessions(child_id);
CREATE INDEX idx_aba_np_sessions_therapist ON public.aba_np_sessions(therapist_id);
CREATE INDEX idx_aba_np_sessions_date ON public.aba_np_sessions(session_date);

CREATE INDEX idx_aba_np_goals_program ON public.aba_np_goals(program_id);
CREATE INDEX idx_aba_np_goals_status ON public.aba_np_goals(status);

CREATE INDEX idx_aba_np_progress_program ON public.aba_np_progress(program_id);
CREATE INDEX idx_aba_np_progress_child ON public.aba_np_progress(child_id);

CREATE INDEX idx_aba_np_clinical_notes_session ON public.aba_np_clinical_notes(session_id);
CREATE INDEX idx_aba_np_clinical_notes_child ON public.aba_np_clinical_notes(child_id);

CREATE INDEX idx_aba_np_game_mapping_program ON public.aba_np_game_mapping(program_id);
CREATE INDEX idx_aba_np_game_mapping_skill ON public.aba_np_game_mapping(skill_id);

CREATE INDEX idx_aba_np_trials_session ON public.aba_np_trials(session_id);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE TRIGGER update_aba_np_sessions_updated_at
  BEFORE UPDATE ON public.aba_np_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aba_np_goals_updated_at
  BEFORE UPDATE ON public.aba_np_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Sessions
ALTER TABLE public.aba_np_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists manage own sessions"
  ON public.aba_np_sessions FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Admins full access to sessions"
  ON public.aba_np_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Goals
ALTER TABLE public.aba_np_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access goals via program"
  ON public.aba_np_goals FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.aba_np_programs p
      WHERE p.id = program_id
        AND public.has_child_access(auth.uid(), p.child_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aba_np_programs p
      WHERE p.id = program_id
        AND public.has_child_access(auth.uid(), p.child_id)
    )
  );

CREATE POLICY "Admins full access to goals"
  ON public.aba_np_goals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Progress
ALTER TABLE public.aba_np_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access progress via child"
  ON public.aba_np_progress FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Admins full access to progress"
  ON public.aba_np_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clinical Notes
ALTER TABLE public.aba_np_clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access notes via child"
  ON public.aba_np_clinical_notes FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

CREATE POLICY "Admins full access to notes"
  ON public.aba_np_clinical_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Game Mapping
ALTER TABLE public.aba_np_game_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read game mapping"
  ON public.aba_np_game_mapping FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Therapists and admins manage game mapping"
  ON public.aba_np_game_mapping FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'therapist')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'therapist')
  );

-- =============================================
-- Realtime for sessions (live clinical tracking)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.aba_np_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aba_np_clinical_notes;
