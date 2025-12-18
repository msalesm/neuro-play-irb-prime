-- Add therapeutic_companion column to skills_inventory table
ALTER TABLE public.skills_inventory 
ADD COLUMN IF NOT EXISTS therapeutic_companion TEXT;