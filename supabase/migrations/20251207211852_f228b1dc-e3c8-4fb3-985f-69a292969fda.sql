-- Drop the view approach - it won't work with RLS restrictions
DROP VIEW IF EXISTS public.public_courses;

-- Create a security definer function to return public course metadata
CREATE OR REPLACE FUNCTION public.get_public_courses()
RETURNS TABLE (
  id uuid,
  course_code text,
  course_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, course_code, course_name, created_at, updated_at
  FROM public.user_courses;
$$;