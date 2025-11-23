-- Create user_courses table to store courses independently of exams
CREATE TABLE public.user_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_code)
);

-- Enable Row Level Security
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all courses"
ON public.user_courses
FOR SELECT
USING (true);

CREATE POLICY "Users can create own courses"
ON public.user_courses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses"
ON public.user_courses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses"
ON public.user_courses
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_courses_updated_at
BEFORE UPDATE ON public.user_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();