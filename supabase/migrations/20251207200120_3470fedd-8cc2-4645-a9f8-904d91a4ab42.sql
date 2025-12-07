
-- Add age range fields to social_stories table
ALTER TABLE public.social_stories 
ADD COLUMN IF NOT EXISTS age_min integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS age_max integer DEFAULT 18;

-- Update existing stories with appropriate age ranges
UPDATE public.social_stories SET age_min = 3, age_max = 10 WHERE title LIKE '%banho%';
UPDATE public.social_stories SET age_min = 3, age_max = 10 WHERE title LIKE '%escovar%';
UPDATE public.social_stories SET age_min = 3, age_max = 12 WHERE title LIKE '%ajuda%';
UPDATE public.social_stories SET age_min = 4, age_max = 12 WHERE title LIKE '%mochila%';
UPDATE public.social_stories SET age_min = 3, age_max = 8 WHERE title LIKE '%lavar%';

-- Add index for age filtering
CREATE INDEX IF NOT EXISTS idx_social_stories_age ON public.social_stories(age_min, age_max);
