-- Create table for storing deleted exams as backups
CREATE TABLE IF NOT EXISTS public.deleted_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_exam_id uuid NOT NULL,
  user_id uuid NOT NULL,
  course_code text NOT NULL,
  course_name text NOT NULL,
  exam_title text NOT NULL,
  exam_year text NOT NULL,
  exam_semester text NOT NULL,
  blocks jsonb NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  original_created_at timestamp with time zone NOT NULL,
  CONSTRAINT deleted_exams_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE public.deleted_exams ENABLE ROW LEVEL SECURITY;

-- Users can view their own deleted exams
CREATE POLICY "Users can view own deleted exams"
  ON public.deleted_exams
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own deleted exams (for backup)
CREATE POLICY "Users can backup own deleted exams"
  ON public.deleted_exams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_deleted_exams_user_id ON public.deleted_exams(user_id);
CREATE INDEX idx_deleted_exams_deleted_at ON public.deleted_exams(deleted_at);