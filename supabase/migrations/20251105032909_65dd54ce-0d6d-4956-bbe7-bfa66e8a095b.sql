-- Create table to track custom platform/work type requests
CREATE TABLE IF NOT EXISTS public.platform_worktype_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('platform', 'work_type')),
  requested_name text NOT NULL,
  user_role text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'added')),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_worktype_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own requests"
  ON public.platform_worktype_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert requests"
  ON public.platform_worktype_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all requests"
  ON public.platform_worktype_requests
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can update requests"
  ON public.platform_worktype_requests
  FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_worktype_requests_status 
  ON public.platform_worktype_requests(status);

CREATE INDEX IF NOT EXISTS idx_platform_worktype_requests_user 
  ON public.platform_worktype_requests(user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_platform_worktype_requests_updated_at
  BEFORE UPDATE ON public.platform_worktype_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();