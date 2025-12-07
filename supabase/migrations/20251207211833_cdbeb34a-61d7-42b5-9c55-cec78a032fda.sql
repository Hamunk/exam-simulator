-- Create a public view that exposes course metadata without user_id
CREATE OR REPLACE VIEW public.public_courses AS
SELECT 
  id,
  course_code,
  course_name,
  created_at,
  updated_at
FROM public.user_courses;

-- Grant SELECT access to everyone (including anonymous users)
GRANT SELECT ON public.public_courses TO anon;
GRANT SELECT ON public.public_courses TO authenticated;