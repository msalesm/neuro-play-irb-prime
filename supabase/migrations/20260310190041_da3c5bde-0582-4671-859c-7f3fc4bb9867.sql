
-- Add child_id column to pei_plans for linking PEIs to children (not just auth users)
ALTER TABLE public.pei_plans ADD COLUMN child_id uuid REFERENCES public.children(id) ON DELETE CASCADE;

-- Make user_id nullable (PEIs created by admin for a child may not have a specific user)
ALTER TABLE public.pei_plans ALTER COLUMN user_id DROP NOT NULL;
