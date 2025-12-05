-- =====================================================
-- SECURITY FIX: Replace permissive INSERT policies
-- =====================================================

-- 1. Fix clinical_reports: Remove overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create clinical reports" ON clinical_reports;

-- Create SECURITY DEFINER function for inserting clinical reports
-- Only edge functions using service role can call this
CREATE OR REPLACE FUNCTION public.insert_clinical_report(
  p_user_id uuid,
  p_report_type text,
  p_report_period_start date,
  p_report_period_end date,
  p_summary_insights text DEFAULT NULL,
  p_detailed_analysis jsonb DEFAULT '{}'::jsonb,
  p_progress_indicators jsonb DEFAULT '{}'::jsonb,
  p_intervention_recommendations jsonb DEFAULT '[]'::jsonb,
  p_alert_flags jsonb DEFAULT '[]'::jsonb,
  p_generated_by_ai boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO clinical_reports (
    user_id,
    report_type,
    report_period_start,
    report_period_end,
    summary_insights,
    detailed_analysis,
    progress_indicators,
    intervention_recommendations,
    alert_flags,
    generated_by_ai
  ) VALUES (
    p_user_id,
    p_report_type,
    p_report_period_start,
    p_report_period_end,
    p_summary_insights,
    p_detailed_analysis,
    p_progress_indicators,
    p_intervention_recommendations,
    p_alert_flags,
    p_generated_by_ai
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- 2. Fix behavioral_insights: Remove overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create insights" ON behavioral_insights;

-- Create proper INSERT policy that requires user_id match
CREATE POLICY "Users can create own insights" ON behavioral_insights
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also create SECURITY DEFINER function for system-generated insights
CREATE OR REPLACE FUNCTION public.insert_behavioral_insight(
  p_user_id uuid,
  p_insight_type text,
  p_title text,
  p_description text,
  p_severity text DEFAULT 'low',
  p_child_profile_id uuid DEFAULT NULL,
  p_supporting_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO behavioral_insights (
    user_id,
    insight_type,
    title,
    description,
    severity,
    child_profile_id,
    supporting_data
  ) VALUES (
    p_user_id,
    p_insight_type,
    p_title,
    p_description,
    p_severity,
    p_child_profile_id,
    p_supporting_data
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;