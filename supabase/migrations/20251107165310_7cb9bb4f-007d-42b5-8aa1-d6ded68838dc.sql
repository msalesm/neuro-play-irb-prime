-- Fix authorization bypass in get_educator_students_stats function
-- Add authentication check to ensure only the educator or admins can view student data

CREATE OR REPLACE FUNCTION public.get_educator_students_stats(educator_uuid UUID)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  total_sessions INTEGER,
  avg_accuracy NUMERIC,
  total_xp INTEGER,
  last_session_date TIMESTAMP WITH TIME ZONE,
  needs_attention BOOLEAN,
  progress_trend TEXT
) AS $$
BEGIN
  -- Critical security check: Verify the caller is the educator or an admin
  IF auth.uid() != educator_uuid AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: You can only view your own students data';
  END IF;

  RETURN QUERY
  SELECT 
    es.student_id,
    COALESCE(up.name, 'Sem nome') as student_name,
    COUNT(ls.id)::INTEGER as total_sessions,
    ROUND(AVG((ls.performance_data->>'accuracy')::numeric), 2) as avg_accuracy,
    SUM(lt.total_xp)::INTEGER as total_xp,
    MAX(ls.created_at) as last_session_date,
    (AVG((ls.performance_data->>'accuracy')::numeric) < 60 OR 
     COUNT(CASE WHEN array_length(ls.struggles_detected, 1) > 2 THEN 1 END) > 2
    ) as needs_attention,
    CASE 
      WHEN AVG((ls.performance_data->>'accuracy')::numeric) >= 80 THEN 'excellent'
      WHEN AVG((ls.performance_data->>'accuracy')::numeric) >= 70 THEN 'good'
      WHEN AVG((ls.performance_data->>'accuracy')::numeric) >= 60 THEN 'average'
      ELSE 'needs_improvement'
    END as progress_trend
  FROM educator_students es
  LEFT JOIN user_profiles up ON es.student_id = up.id
  LEFT JOIN learning_sessions ls ON es.student_id = ls.user_id
  LEFT JOIN learning_trails lt ON es.student_id = lt.user_id
  WHERE es.educator_id = educator_uuid
  GROUP BY es.student_id, up.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;