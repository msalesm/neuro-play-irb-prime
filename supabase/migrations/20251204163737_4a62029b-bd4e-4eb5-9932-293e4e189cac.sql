-- Allow authenticated users to search for children without a parent assigned (for linking)
CREATE POLICY "Users can search unlinked children" 
ON public.children 
FOR SELECT 
USING (parent_id IS NULL AND auth.uid() IS NOT NULL);