-- Update diagnostic tests duration to max 5 minutes
UPDATE public.cognitive_games 
SET avg_duration_minutes = 5
WHERE game_id IN ('theory-of-mind', 'attention-sustained-phases', 'cognitive-flexibility-phases', 'phonological-processing', 'executive-processing-phases');