-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-assign admin to specific email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'halvor.munkeby@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign roles on user creation
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Function to get all users for admin panel (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  role app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.email,
    p.display_name,
    p.created_at,
    COALESCE(ur.role, 'user'::app_role) as role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE public.has_role(auth.uid(), 'admin')
$$;

-- Function to get all exam attempts for admin
CREATE OR REPLACE FUNCTION public.get_all_exam_attempts_for_admin()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  exam_title text,
  course_code text,
  course_name text,
  status text,
  total_score integer,
  max_score integer,
  percentage numeric,
  started_at timestamptz,
  completed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ea.id,
    ea.user_id,
    p.email as user_email,
    ea.exam_title,
    ea.course_code,
    ea.course_name,
    ea.status,
    ea.total_score,
    ea.max_score,
    ea.percentage,
    ea.started_at,
    ea.completed_at
  FROM public.exam_attempts ea
  JOIN public.profiles p ON ea.user_id = p.id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY ea.started_at DESC
$$;

-- Function to get all user exams for admin
CREATE OR REPLACE FUNCTION public.get_all_user_exams_for_admin()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  exam_title text,
  course_code text,
  course_name text,
  is_public boolean,
  is_draft boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ue.id,
    ue.user_id,
    p.email as user_email,
    ue.exam_title,
    ue.course_code,
    ue.course_name,
    ue.is_public,
    ue.is_draft,
    ue.created_at
  FROM public.user_exams ue
  JOIN public.profiles p ON ue.user_id = p.id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY ue.created_at DESC
$$;