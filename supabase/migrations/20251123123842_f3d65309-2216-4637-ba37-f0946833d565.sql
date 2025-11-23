-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_exams table to store user-created exams
CREATE TABLE public.user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  exam_year TEXT NOT NULL,
  exam_semester TEXT NOT NULL,
  blocks JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on user_exams
ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;

-- Public exams are viewable by everyone
CREATE POLICY "Public exams are viewable by everyone"
  ON public.user_exams
  FOR SELECT
  USING (is_public = true);

-- Users can view their own exams (public or private)
CREATE POLICY "Users can view own exams"
  ON public.user_exams
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own exams
CREATE POLICY "Users can create own exams"
  ON public.user_exams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own exams
CREATE POLICY "Users can update own exams"
  ON public.user_exams
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own exams
CREATE POLICY "Users can delete own exams"
  ON public.user_exams
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for user_exams updated_at
CREATE TRIGGER update_user_exams_updated_at
  BEFORE UPDATE ON public.user_exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();