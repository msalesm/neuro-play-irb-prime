
-- Classroom Cognitive Scan Sessions
CREATE TABLE public.classroom_scan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  session_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_students INTEGER DEFAULT 0,
  students_completed INTEGER DEFAULT 0,
  class_results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_code)
);

-- Student participation in scan sessions
CREATE TABLE public.scan_student_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.classroom_scan_sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id),
  student_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'completed')),
  attention_score NUMERIC,
  memory_score NUMERIC,
  language_score NUMERIC,
  executive_function_score NUMERIC,
  overall_score NUMERIC,
  risk_flags JSONB DEFAULT '[]',
  raw_metrics JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detailed cognitive events from mini-games
CREATE TABLE public.cognitive_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.classroom_scan_sessions(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id),
  game_type TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'response',
  reaction_time_ms INTEGER,
  is_correct BOOLEAN,
  accuracy NUMERIC,
  attempts INTEGER DEFAULT 1,
  latency_ms INTEGER,
  persistence_score NUMERIC,
  raw_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_scan_sessions_class ON public.classroom_scan_sessions(class_id);
CREATE INDEX idx_scan_sessions_code ON public.classroom_scan_sessions(session_code);
CREATE INDEX idx_scan_sessions_status ON public.classroom_scan_sessions(status);
CREATE INDEX idx_scan_results_session ON public.scan_student_results(session_id);
CREATE INDEX idx_scan_results_child ON public.scan_student_results(child_id);
CREATE INDEX idx_cognitive_events_session ON public.cognitive_events(session_id);
CREATE INDEX idx_cognitive_events_child ON public.cognitive_events(child_id);
CREATE INDEX idx_cognitive_events_game ON public.cognitive_events(game_type);

-- Enable RLS
ALTER TABLE public.classroom_scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_events ENABLE ROW LEVEL SECURITY;

-- RLS: Teachers see their own sessions, admins see all
CREATE POLICY "Teachers see own scan sessions" ON public.classroom_scan_sessions
  FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers create scan sessions" ON public.classroom_scan_sessions
  FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers update own scan sessions" ON public.classroom_scan_sessions
  FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS for student results: accessible by session teacher + admins
CREATE POLICY "Teachers see scan results" ON public.scan_student_results
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_scan_sessions css
      WHERE css.id = session_id
      AND (css.teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System inserts scan results" ON public.scan_student_results
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "System updates scan results" ON public.scan_student_results
  FOR UPDATE TO authenticated
  USING (true);

-- RLS for cognitive events
CREATE POLICY "Teachers see cognitive events" ON public.cognitive_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_scan_sessions css
      WHERE css.id = session_id
      AND (css.teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System inserts cognitive events" ON public.cognitive_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Enable realtime for live monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_scan_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_student_results;

-- Trigger for updated_at
CREATE TRIGGER update_scan_sessions_updated_at
  BEFORE UPDATE ON public.classroom_scan_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
