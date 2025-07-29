-- CRITICAL SECURITY FIXES
-- Phase 1: Fix Database Function Security Issues

-- Fix search_path for all security definer functions to prevent privilege escalation
-- This addresses the 66+ function search path mutable warnings

-- Fix the core security functions first
CREATE OR REPLACE FUNCTION public.is_beta_tester(user_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.beta_testers 
    WHERE email = user_email AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT email FROM auth.users WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.has_signed_nda(target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.nda_signatures 
    WHERE user_id = target_user_id 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_display_name(target_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(display_name, anonymous_username, 'User') 
  FROM public.users 
  WHERE id = target_user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.users WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.log_document_access(doc_id uuid, access_type_param text, shared_with_param uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.document_access_log (
    document_id, accessed_by, access_type, shared_with, ip_address
  ) VALUES (
    doc_id, auth.uid(), access_type_param, shared_with_param, 
    inet_client_addr()
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_anonymous_username()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  counter INTEGER;
  new_username TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(anonymous_username FROM 'user(\d+)') AS INTEGER)), 0) + 1
  INTO counter
  FROM public.users 
  WHERE anonymous_username ~ '^user\d+$';
  
  IF counter IS NULL THEN
    counter := 1;
  END IF;
  
  new_username := 'user' || counter::TEXT;
  
  WHILE EXISTS (SELECT 1 FROM public.users WHERE anonymous_username = new_username) LOOP
    counter := counter + 1;
    new_username := 'user' || counter::TEXT;
  END LOOP;
  
  RETURN new_username;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_beta_registration_token(user_email text, user_type_param text, username text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  -- Generate a secure random token
  LOOP
    new_token := encode(gen_random_bytes(32), 'base64url');
    
    -- Check if token already exists
    SELECT EXISTS (
      SELECT 1 FROM public.beta_registration_tokens 
      WHERE token = new_token
    ) INTO token_exists;
    
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  -- Insert the new token
  INSERT INTO public.beta_registration_tokens (
    email, token, user_type, anonymous_username
  ) VALUES (
    user_email, new_token, user_type_param, username
  );
  
  RETURN new_token;
END;
$function$;

-- Fix more critical security definer functions with search_path
CREATE OR REPLACE FUNCTION public.upgrade_user_to_admin(target_email text, new_display_name text DEFAULT 'Admin#1'::text, new_anonymous_username text DEFAULT 'Admin#1'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from auth.users by email
  SELECT au.id INTO target_user_id 
  FROM auth.users au 
  WHERE au.email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update user profile to admin
  UPDATE public.users 
  SET 
    role = 'admin',
    display_name = new_display_name,
    anonymous_username = new_anonymous_username,
    trust_score = 100,
    profile_complete = 100,
    storage_limit_mb = 1000,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Update credits to admin level
  UPDATE public.credits
  SET 
    current_balance = 100,
    earned_credits = 100,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- If credits record doesn't exist, create it
  INSERT INTO public.credits (user_id, current_balance, earned_credits, paid_credits)
  VALUES (target_user_id, 100, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

-- Create secure admin role checking function to replace hardcoded emails
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id_param uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role = 'admin' FROM public.users WHERE id = user_id_param;
$function$;

-- Enhanced user spending function with better security
CREATE OR REPLACE FUNCTION public.spend_clear_credits(spender_user_id uuid, amount_param numeric, reference_id_param uuid DEFAULT NULL::uuid, reference_type_param text DEFAULT NULL::text, metadata_param jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_balance_val numeric;
BEGIN
  -- Validate input parameters
  IF amount_param <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF spender_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  -- Get current balance with row lock to prevent race conditions
  SELECT current_balance INTO current_balance_val
  FROM public.credits 
  WHERE user_id = spender_user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_balance_val IS NULL OR current_balance_val < amount_param THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE public.credits 
  SET 
    current_balance = current_balance - amount_param,
    updated_at = now()
  WHERE user_id = spender_user_id;
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, reference_id, reference_type, metadata
  ) VALUES (
    spender_user_id, -amount_param, 'spent', reference_id_param, reference_type_param, metadata_param
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

-- Secure rate limiting for critical operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_id_param uuid, operation_type text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count integer;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_log
  WHERE user_id = user_id_param 
    AND action = operation_type
    AND created_at > now() - (window_minutes || ' minutes')::interval;
  
  RETURN attempt_count < max_attempts;
END;
$function$;