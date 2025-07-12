-- Create signup_attempts table for logging all signup attempts
CREATE TABLE public.signup_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('field-rep', 'vendor')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  metadata JSONB,
  honeypot_filled BOOLEAN DEFAULT false,
  recaptcha_score DECIMAL(3,2),
  is_disposable_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all signup attempts
CREATE POLICY "Admins can view all signup attempts" 
ON public.signup_attempts 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create policy for anyone to insert signup attempts (used by signup flow)
CREATE POLICY "Anyone can create signup attempts" 
ON public.signup_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_signup_attempts_email ON public.signup_attempts(email);
CREATE INDEX idx_signup_attempts_ip_created ON public.signup_attempts(ip_address, created_at);
CREATE INDEX idx_signup_attempts_success ON public.signup_attempts(success);
CREATE INDEX idx_signup_attempts_created_at ON public.signup_attempts(created_at);

-- Create function to check IP rate limiting
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(ip_addr INET, hours_window INTEGER DEFAULT 1, max_attempts INTEGER DEFAULT 3)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count successful signups from this IP in the specified time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.signup_attempts
  WHERE ip_address = ip_addr 
    AND success = true
    AND created_at > (NOW() - (hours_window || ' hours')::INTERVAL);
  
  -- Return true if under the limit, false if at or over the limit
  RETURN attempt_count < max_attempts;
END;
$$;

-- Create function to log signup attempts
CREATE OR REPLACE FUNCTION public.log_signup_attempt(
  p_email TEXT,
  p_user_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT false,
  p_failure_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_honeypot_filled BOOLEAN DEFAULT false,
  p_recaptcha_score DECIMAL DEFAULT NULL,
  p_is_disposable_email BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_id UUID;
BEGIN
  INSERT INTO public.signup_attempts (
    email,
    user_type,
    ip_address,
    user_agent,
    success,
    failure_reason,
    metadata,
    honeypot_filled,
    recaptcha_score,
    is_disposable_email
  ) VALUES (
    p_email,
    p_user_type,
    p_ip_address,
    p_user_agent,
    p_success,
    p_failure_reason,
    p_metadata,
    p_honeypot_filled,
    p_recaptcha_score,
    p_is_disposable_email
  ) RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$;