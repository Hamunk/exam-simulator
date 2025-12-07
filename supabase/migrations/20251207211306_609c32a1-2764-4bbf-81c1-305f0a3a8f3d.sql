-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view deleted exams" ON public.deleted_exams;

-- Create a new policy that only allows users to view their own deleted exams
CREATE POLICY "Users can view own deleted exams" 
ON public.deleted_exams 
FOR SELECT 
USING (auth.uid() = user_id);