-- Add draft support to user_exams table
ALTER TABLE public.user_exams 
ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS draft_data jsonb DEFAULT null;

-- Add index for better draft query performance
CREATE INDEX IF NOT EXISTS idx_user_exams_drafts ON public.user_exams(user_id, is_draft) WHERE is_draft = true;

COMMENT ON COLUMN public.user_exams.is_draft IS 'Indicates whether the exam is a draft (not published)';
COMMENT ON COLUMN public.user_exams.draft_data IS 'Stores partial exam data during creation (basicInfo, structure, blocks, currentStep)';