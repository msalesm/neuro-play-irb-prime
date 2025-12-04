-- Allow family members to view each other's learning sessions
CREATE POLICY "Family members can view linked members sessions"
ON public.learning_sessions
FOR SELECT
USING (
  user_id IN (
    SELECT family_member_id FROM family_links 
    WHERE parent_user_id = auth.uid() AND status = 'accepted'
  )
  OR
  user_id IN (
    SELECT parent_user_id FROM family_links 
    WHERE family_member_id = auth.uid() AND status = 'accepted'
  )
);