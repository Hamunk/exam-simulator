-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own deleted exams" ON public.deleted_exams;

-- Allow everyone to view all deleted exams
CREATE POLICY "Anyone can view deleted exams"
  ON public.deleted_exams
  FOR SELECT
  USING (true);