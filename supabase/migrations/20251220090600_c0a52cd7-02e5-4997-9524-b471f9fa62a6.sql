-- Create access requests table for users requesting beta access
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an access request (no auth required)
CREATE POLICY "Anyone can submit access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view all access requests
CREATE POLICY "Admins can view access requests"
ON public.access_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update access requests
CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete access requests
CREATE POLICY "Admins can delete access requests"
ON public.access_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));