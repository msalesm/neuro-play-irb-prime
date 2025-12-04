-- Allow users to view profiles of their linked family members
CREATE POLICY "Users can view family members profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT family_member_id FROM family_links 
    WHERE parent_user_id = auth.uid() AND status = 'accepted'
  )
  OR
  id IN (
    SELECT parent_user_id FROM family_links 
    WHERE family_member_id = auth.uid() AND status = 'accepted'
  )
);