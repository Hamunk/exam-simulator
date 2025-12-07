-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all courses" ON public.user_courses;

-- Create a new policy that only allows users to view their own courses
CREATE POLICY "Users can view own courses" 
ON public.user_courses 
FOR SELECT 
USING (auth.uid() = user_id);