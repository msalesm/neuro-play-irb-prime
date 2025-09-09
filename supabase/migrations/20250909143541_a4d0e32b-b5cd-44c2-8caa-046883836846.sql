-- Remove duplicate entries using row_number
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.user_gamification
)
DELETE FROM public.user_gamification
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.user_gamification 
ADD CONSTRAINT user_gamification_user_id_unique UNIQUE (user_id);