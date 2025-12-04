CREATE OR REPLACE FUNCTION public.check_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      
      -- Consistency achievement - fixed query (removed ORDER BY and LIMIT from COUNT)
      SELECT COUNT(*) INTO high_accuracy_count
      FROM (
        SELECT 1 FROM game_sessions
        WHERE child_profile_id = NEW.child_profile_id
          AND completed = true
          AND accuracy_percentage >= 80
        ORDER BY completed_at DESC
        LIMIT 5
      ) AS recent_high_accuracy;
      
      IF high_accuracy_count >= 5 THEN
        INSERT INTO user_achievements (user_id, achievement_key, progress, completed)
        VALUES (target_user_id, 'consistent', 5, true)
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;