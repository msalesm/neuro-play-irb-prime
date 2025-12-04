-- Create family links table for linking adult family members
CREATE TABLE public.family_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'filho' CHECK (relationship IN ('filho', 'filha', 'neto', 'neta', 'sobrinho', 'sobrinha', 'outro')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(parent_user_id, family_member_id)
);

-- Enable RLS
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create family link requests"
ON public.family_links FOR INSERT
WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Users can view their family links"
ON public.family_links FOR SELECT
USING (auth.uid() = parent_user_id OR auth.uid() = family_member_id);

CREATE POLICY "Family members can accept/reject requests"
ON public.family_links FOR UPDATE
USING (auth.uid() = family_member_id)
WITH CHECK (auth.uid() = family_member_id);

CREATE POLICY "Users can delete own requests"
ON public.family_links FOR DELETE
USING (auth.uid() = parent_user_id);