-- Drop and recreate the view with SECURITY INVOKER (default, but explicit is better)
DROP VIEW IF EXISTS public.public_courses;

CREATE VIEW public.public_courses 
WITH (security_invoker = true) AS
SELECT 
  id,
  course_code,
  course_name,
  created_at,
  updated_at
FROM public.user_courses;

-- Grant SELECT access to everyone
GRANT SELECT ON public.public_courses TO anon;
GRANT SELECT ON public.public_courses TO authenticated;