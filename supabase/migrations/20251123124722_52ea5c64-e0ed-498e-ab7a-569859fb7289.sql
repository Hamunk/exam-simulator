-- Create exam_attempts table to track user progress
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  exam_data JSONB NOT NULL,
  user_answers JSONB DEFAULT '{}'::jsonb NOT NULL,
  current_block_index INT DEFAULT 0 NOT NULL,
  remaining_seconds INT NOT NULL,
  total_seconds INT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  block_scores JSONB,
  total_score INT,
  max_score INT,
  percentage NUMERIC(5,2),
  status TEXT DEFAULT 'in_progress' NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_status ON public.exam_attempts(status);
CREATE INDEX idx_exam_attempts_user_exam ON public.exam_attempts(user_id, exam_id, status);

-- Enable RLS
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own exam attempts
CREATE POLICY "Users can view own exam attempts"
  ON public.exam_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own exam attempts
CREATE POLICY "Users can create own exam attempts"
  ON public.exam_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own exam attempts
CREATE POLICY "Users can update own exam attempts"
  ON public.exam_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own exam attempts
CREATE POLICY "Users can delete own exam attempts"
  ON public.exam_attempts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_exam_attempts_updated_at
  BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();