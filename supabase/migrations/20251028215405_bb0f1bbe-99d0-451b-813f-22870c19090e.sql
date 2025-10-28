-- Create impersonation_sessions table
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_only BOOLEAN NOT NULL DEFAULT true,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NULL,
  ip_address TEXT,
  user_agent TEXT,
  CONSTRAINT check_not_expired CHECK (expires_at > created_at),
  CONSTRAINT check_valid_reason CHECK (char_length(reason) >= 10)
);

-- Create impersonation_writes table
CREATE TABLE IF NOT EXISTS public.impersonation_writes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.impersonation_sessions(id) ON DELETE CASCADE,
  happened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  route TEXT NOT NULL,
  resource TEXT,
  action TEXT NOT NULL,
  payload_sha256 TEXT,
  result TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_admin ON public.impersonation_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_target ON public.impersonation_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_active ON public.impersonation_sessions(expires_at, ended_at) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_impersonation_writes_session ON public.impersonation_writes(session_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_writes_time ON public.impersonation_writes(happened_at);

-- Enable RLS
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_writes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
CREATE POLICY "Admins can view all impersonation sessions"
  ON public.impersonation_sessions FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can insert impersonation sessions"
  ON public.impersonation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role AND auth.uid() = admin_id);

CREATE POLICY "Admins can update own impersonation sessions"
  ON public.impersonation_sessions FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role AND auth.uid() = admin_id);

CREATE POLICY "Admins can view all impersonation writes"
  ON public.impersonation_writes FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert impersonation writes"
  ON public.impersonation_writes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Helper function to check if a session is valid
CREATE OR REPLACE FUNCTION public.is_impersonation_session_valid(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record
  FROM public.impersonation_sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if session is not ended and not expired
  RETURN session_record.ended_at IS NULL AND session_record.expires_at > now();
END;
$$;

-- Function to end an impersonation session
CREATE OR REPLACE FUNCTION public.end_impersonation_session(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to end sessions
  IF get_user_role(auth.uid()) != 'admin'::user_role THEN
    RAISE EXCEPTION 'Only admins can end impersonation sessions';
  END IF;
  
  UPDATE public.impersonation_sessions
  SET ended_at = now()
  WHERE id = session_id_param
    AND admin_id = auth.uid()
    AND ended_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Function to log impersonation writes
CREATE OR REPLACE FUNCTION public.log_impersonation_write(
  session_id_param UUID,
  route_param TEXT,
  resource_param TEXT,
  action_param TEXT,
  payload_sha256_param TEXT DEFAULT NULL,
  result_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  write_id UUID;
BEGIN
  -- Verify session is valid
  IF NOT public.is_impersonation_session_valid(session_id_param) THEN
    RAISE EXCEPTION 'Invalid or expired impersonation session';
  END IF;
  
  INSERT INTO public.impersonation_writes (
    session_id, route, resource, action, payload_sha256, result, metadata
  ) VALUES (
    session_id_param, route_param, resource_param, action_param, 
    payload_sha256_param, result_param, metadata_param
  )
  RETURNING id INTO write_id;
  
  RETURN write_id;
END;
$$;

-- Function to check if admin has impersonation permission
CREATE OR REPLACE FUNCTION public.can_start_impersonation(admin_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin
  RETURN get_user_role(admin_id_param) = 'admin'::user_role;
END;
$$;