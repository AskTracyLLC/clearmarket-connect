-- Create profiles table if not exists (maps to users table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_username text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policies for user_credits
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits" ON public.user_credits
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create credit_usage table
CREATE TABLE IF NOT EXISTS public.credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  state text,
  county text,
  credits_used int NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;

-- Policies for credit_usage
CREATE POLICY "Users can view own usage" ON public.credit_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage" ON public.credit_usage
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert usage" ON public.credit_usage
  FOR INSERT WITH CHECK (true);

-- Update coverage_requests table to match requirements
ALTER TABLE public.coverage_requests 
  DROP COLUMN IF EXISTS vendor_id CASCADE;

ALTER TABLE public.coverage_requests 
  ADD COLUMN IF NOT EXISTS vendor_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.coverage_requests 
  ADD COLUMN IF NOT EXISTS state text;

ALTER TABLE public.coverage_requests 
  ADD COLUMN IF NOT EXISTS county text;

ALTER TABLE public.coverage_requests 
  ADD COLUMN IF NOT EXISTS details text;

-- Create the atomic RPC function
CREATE OR REPLACE FUNCTION public.create_coverage_request_with_credit(
  p_user_id uuid,
  p_state text,
  p_county text,
  p_title text,
  p_details text,
  p_credits_required int DEFAULT 1
)
RETURNS TABLE (
  coverage_request_id uuid,
  new_balance int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance int;
  v_request_id uuid;
  v_display_name text;
BEGIN
  -- Lock credit row
  SELECT balance
    INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'NO_CREDIT_RECORD';
  END IF;
  IF p_credits_required <= 0 THEN
    RAISE EXCEPTION 'INVALID_CREDIT_AMOUNT';
  END IF;
  IF v_balance < p_credits_required THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  -- Get display name (try profiles first, then users table)
  SELECT anonymous_username
    INTO v_display_name
  FROM profiles
  WHERE id = p_user_id;
  
  -- Fallback to users table if not in profiles
  IF v_display_name IS NULL THEN
    SELECT anonymous_username
      INTO v_display_name
    FROM users
    WHERE id = p_user_id;
  END IF;

  -- Deduct credits
  UPDATE user_credits
     SET balance = balance - p_credits_required,
         updated_at = now()
   WHERE user_id = p_user_id;

  -- Create posting
  INSERT INTO coverage_requests (vendor_user_id, state, county, title, details)
  VALUES (p_user_id, p_state, p_county, p_title, p_details)
  RETURNING id INTO v_request_id;

  -- Log usage (include display name in meta)
  INSERT INTO credit_usage (user_id, action_type, state, county, credits_used, meta)
  VALUES (
    p_user_id,
    'coverage_post',
    p_state,
    p_county,
    p_credits_required,
    jsonb_build_object(
      'display_name', COALESCE(v_display_name, 'User'),
      'title', p_title,
      'details_len', GREATEST(LENGTH(COALESCE(p_details,'')),0)
    )
  );

  -- Return result
  RETURN QUERY
  SELECT v_request_id::uuid,
         (SELECT balance FROM user_credits WHERE user_id = p_user_id)::int;

EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%INSUFFICIENT_CREDITS%' THEN
      RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
    ELSIF SQLERRM LIKE '%NO_CREDIT_RECORD%' THEN
      RAISE EXCEPTION 'NO_CREDIT_RECORD';
    ELSIF SQLERRM LIKE '%INVALID_CREDIT_AMOUNT%' THEN
      RAISE EXCEPTION 'INVALID_CREDIT_AMOUNT';
    ELSE
      RAISE;
    END IF;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.create_coverage_request_with_credit(uuid,text,text,text,text,int) FROM public;
GRANT EXECUTE ON FUNCTION public.create_coverage_request_with_credit(uuid,text,text,text,text,int) TO anon, authenticated, service_role;