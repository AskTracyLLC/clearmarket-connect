-- Fix Critical Beta Tester Onboarding Issues
-- Date: 2025-01-30

-- 1. Add nda_signed field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS nda_signed BOOLEAN NOT NULL DEFAULT false;

-- 2. Create NDA audit logs table for tracking submission events
CREATE TABLE IF NOT EXISTS public.nda_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'fail', 'attempt')),
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on nda_logs table
ALTER TABLE public.nda_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for nda_logs
CREATE POLICY "Admins can view all NDA logs" ON public.nda_logs
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view own NDA logs" ON public.nda_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert NDA logs" ON public.nda_logs
  FOR INSERT WITH CHECK (true);

-- 3. Create trigger function to update users.nda_signed when NDA is signed
CREATE OR REPLACE FUNCTION public.handle_nda_signature()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the user's nda_signed status to true
  UPDATE public.users
  SET 
    nda_signed = true,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Log successful NDA signature
  INSERT INTO public.nda_logs (
    user_id,
    status,
    metadata
  ) VALUES (
    NEW.user_id,
    'success',
    jsonb_build_object(
      'signature_name', NEW.signature_name,
      'signature_version', NEW.signature_version,
      'signed_at', NEW.signed_date
    )
  );
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger on nda_signatures table
DROP TRIGGER IF EXISTS trigger_update_nda_signed ON public.nda_signatures;
CREATE TRIGGER trigger_update_nda_signed
  AFTER INSERT ON public.nda_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_nda_signature();

-- 5. Create function to log NDA submission attempts
CREATE OR REPLACE FUNCTION public.log_nda_attempt(
  target_user_id UUID,
  attempt_status TEXT,
  error_msg TEXT DEFAULT NULL,
  client_ip INET DEFAULT NULL,
  client_user_agent TEXT DEFAULT NULL,
  additional_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.nda_logs (
    user_id,
    status,
    error_message,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    target_user_id,
    attempt_status,
    error_msg,
    client_ip,
    client_user_agent,
    additional_metadata
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    RETURN false;
END;
$$;

-- 6. Update existing users who have already signed NDAs (backfill)
UPDATE public.users 
SET nda_signed = true, updated_at = now()
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.nda_signatures 
  WHERE is_active = true
);

-- 7. Create index for better performance on nda_signed queries
CREATE INDEX IF NOT EXISTS idx_users_nda_signed ON public.users(nda_signed);
CREATE INDEX IF NOT EXISTS idx_nda_logs_user_status ON public.nda_logs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_nda_logs_created_at ON public.nda_logs(created_at);