
-- RLS + Indexes for all new tables

-- Enable RLS
ALTER TABLE public.game_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshot ENABLE ROW LEVEL SECURITY;

-- game_trials policies
CREATE POLICY "select_game_trials" ON public.game_trials FOR SELECT TO authenticated
  USING (public.has_child_access(auth.uid(), child_id));
CREATE POLICY "insert_game_trials" ON public.game_trials FOR INSERT TO authenticated
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

-- cognitive_metrics policies
CREATE POLICY "select_cognitive_metrics" ON public.cognitive_metrics FOR SELECT TO authenticated
  USING (public.has_child_access(auth.uid(), child_id));
CREATE POLICY "all_cognitive_metrics" ON public.cognitive_metrics FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

-- routine_tasks policies
CREATE POLICY "all_routine_tasks" ON public.routine_tasks FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

-- routine_metrics policies
CREATE POLICY "all_routine_metrics" ON public.routine_metrics FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

-- story_sessions policies
CREATE POLICY "all_story_sessions" ON public.story_sessions FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

-- behavior_profile policies
CREATE POLICY "select_behavior_profile" ON public.behavior_profile FOR SELECT TO authenticated
  USING (public.has_child_access(auth.uid(), child_id));
CREATE POLICY "upsert_behavior_profile" ON public.behavior_profile FOR ALL TO authenticated
  USING (public.has_child_access(auth.uid(), child_id))
  WITH CHECK (public.has_child_access(auth.uid(), child_id));

-- analytics_snapshot policies
CREATE POLICY "select_analytics_snapshot" ON public.analytics_snapshot FOR SELECT TO authenticated
  USING (public.is_institution_admin(auth.uid(), institution_id));
CREATE POLICY "upsert_analytics_snapshot" ON public.analytics_snapshot FOR ALL TO authenticated
  USING (public.is_institution_admin(auth.uid(), institution_id))
  WITH CHECK (public.is_institution_admin(auth.uid(), institution_id));

-- Performance indexes
CREATE INDEX idx_game_trials_session ON public.game_trials(session_id);
CREATE INDEX idx_game_trials_child ON public.game_trials(child_id);
CREATE INDEX idx_game_trials_recorded ON public.game_trials(recorded_at);
CREATE INDEX idx_cognitive_metrics_child ON public.cognitive_metrics(child_id);
CREATE INDEX idx_routine_tasks_child_date ON public.routine_tasks(child_id, scheduled_date);
CREATE INDEX idx_routine_metrics_child_date ON public.routine_metrics(child_id, metric_date);
CREATE INDEX idx_story_sessions_child ON public.story_sessions(child_id);
CREATE INDEX idx_behavior_profile_child ON public.behavior_profile(child_id);
CREATE INDEX idx_analytics_snapshot_inst ON public.analytics_snapshot(institution_id, snapshot_date);

-- Auto-update triggers
CREATE TRIGGER update_cognitive_metrics_ts BEFORE UPDATE ON public.cognitive_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_behavior_profile_ts BEFORE UPDATE ON public.behavior_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
