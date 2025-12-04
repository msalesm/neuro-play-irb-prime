-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_type TEXT NOT NULL CHECK (invite_type IN ('parent', 'child')),
  child_name TEXT,
  child_birth_date DATE,
  child_conditions JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  accepted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create invitations"
ON public.invitations FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can view own invitations"
ON public.invitations FOR SELECT
USING (auth.uid() = inviter_id OR auth.uid() = accepted_by);

CREATE POLICY "Users can update own invitations"
ON public.invitations FOR UPDATE
USING (auth.uid() = inviter_id);

CREATE POLICY "Anyone can view pending invitations by code"
ON public.invitations FOR SELECT
USING (status = 'pending' AND expires_at > now());

CREATE POLICY "Authenticated users can accept invitations"
ON public.invitations FOR UPDATE
USING (status = 'pending' AND expires_at > now() AND auth.uid() IS NOT NULL)
WITH CHECK (accepted_by = auth.uid());