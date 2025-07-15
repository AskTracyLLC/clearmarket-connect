-- Create a unified anonymous username generation function
-- This replaces all existing username generation functions with a consistent approach

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.generate_anonymous_username(text);
DROP FUNCTION IF EXISTS public.generate_anonymous_username(text, uuid);
DROP FUNCTION IF EXISTS public.generate_unique_display_name(text);
DROP FUNCTION IF EXISTS public.generate_sequential_anonymous_username(text);

-- Create the unified function that works across all tables
CREATE OR REPLACE FUNCTION public.generate_anonymous_username(user_type_param text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_prefix TEXT;
  next_number INTEGER;
  new_username TEXT;
BEGIN
  -- Set prefix based on user type with consistent formatting
  CASE user_type_param
    WHEN 'vendor' THEN username_prefix := 'Vendor';
    WHEN 'field-rep' THEN username_prefix := 'FieldRep';
    WHEN 'field_rep' THEN username_prefix := 'FieldRep';
    WHEN 'moderator' THEN username_prefix := 'Moderator';
    WHEN 'admin' THEN username_prefix := 'Admin';
    ELSE username_prefix := 'User';
  END CASE;
  
  -- Get the next sequential number by checking ALL places where this username type exists
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN anonymous_username ~ ('^' || username_prefix || '#[0-9]+$') 
        THEN CAST(SUBSTRING(anonymous_username FROM (username_prefix || '#([0-9]+)$')) AS INTEGER)
        ELSE 0
      END
    ), 0) + 1
  INTO next_number
  FROM (
    -- Check field_rep_signups table
    SELECT anonymous_username FROM public.field_rep_signups WHERE anonymous_username LIKE username_prefix || '#%'
    UNION ALL
    -- Check vendor_signups table  
    SELECT anonymous_username FROM public.vendor_signups WHERE anonymous_username LIKE username_prefix || '#%'
    UNION ALL
    -- Check users table
    SELECT anonymous_username FROM public.users WHERE anonymous_username LIKE username_prefix || '#%'
    UNION ALL
    -- Check display_name from users table (in case it's stored there)
    SELECT display_name as anonymous_username FROM public.users WHERE display_name LIKE username_prefix || '#%'
  ) combined_usernames;

  -- Generate new username in format: Role#Number
  new_username := username_prefix || '#' || next_number;
  
  RETURN new_username;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_anonymous_username(text) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_anonymous_username(text) TO authenticated;

-- Update the field rep signup trigger to use the unified function
CREATE OR REPLACE FUNCTION public.send_field_rep_signup_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  payload JSONB;
  http_response RECORD;
BEGIN
  -- Hardcode the function URL with correct project ID
  function_url := 'https://bgqlhaqwsnfhhatxhtfx.supabase.co/functions/v1/send-signup-email';
  
  -- Prepare the payload with correct column names
  payload := jsonb_build_object(
    'signupType', 'field_rep',
    'email', NEW.email,
    'anonymous_username', COALESCE(NEW.anonymous_username, 'FieldRep#0'),
    'beta_tester', COALESCE(NEW.interested_in_beta_testing, false)
  );

  -- Call the Edge Function using http extension
  SELECT INTO http_response * FROM http((
    'POST',
    function_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWxoYXF3c25maGhhdHhodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk1MDksImV4cCI6MjA2NzUxNTUwOX0.El8dESk86p4-yb8gIIoheKHRMl2YTegQb9BIfaKIhAU')
    ],
    'application/json',
    payload::text
  ));

  -- Log the response (optional)
  RAISE NOTICE 'Field Rep signup email trigger response: status=%, content=%', 
    http_response.status, http_response.content;

  -- If email sending failed, log it but don't prevent the signup
  IF http_response.status NOT BETWEEN 200 AND 299 THEN
    RAISE WARNING 'Failed to send field rep signup email for %: HTTP %', 
      NEW.email, http_response.status;
  END IF;

  RETURN NEW;
END;
$$;

-- Update the vendor signup trigger to use the unified function
CREATE OR REPLACE FUNCTION public.send_vendor_signup_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  payload JSONB;
  http_response RECORD;
BEGIN
  -- Hardcode the function URL with correct project ID
  function_url := 'https://bgqlhaqwsnfhhatxhtfx.supabase.co/functions/v1/send-signup-email';
  
  -- Prepare the payload with correct column names
  payload := jsonb_build_object(
    'signupType', 'vendor',
    'email', NEW.email,
    'anonymous_username', COALESCE(NEW.anonymous_username, 'Vendor#0'),
    'beta_tester', COALESCE(NEW.interested_in_beta_testing, false)
  );

  -- Call the Edge Function using http extension
  SELECT INTO http_response * FROM http((
    'POST',
    function_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWxoYXF3c25maGhhdHhodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk1MDksImV4cCI6MjA2NzUxNTUwOX0.El8dESk86p4-yb8gIIoheKHRMl2YTegQb9BIfaKIhAU')
    ],
    'application/json',
    payload::text
  ));

  -- Log the response (optional)
  RAISE NOTICE 'Vendor signup email trigger response: status=%, content=%', 
    http_response.status, http_response.content;

  -- If email sending failed, log it but don't prevent the signup
  IF http_response.status NOT BETWEEN 200 AND 299 THEN
    RAISE WARNING 'Failed to send vendor signup email for %: HTTP %', 
      NEW.email, http_response.status;
  END IF;

  RETURN NEW;
END;
$$;

-- Update the handle_new_user function to use consistent username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_assignment user_role := 'field_rep'; -- Default role
  display_username TEXT;
  provided_display_name TEXT;
  signup_source TEXT := 'direct'; -- Track where user came from
BEGIN
  -- Get display name from metadata if provided
  provided_display_name := NEW.raw_user_meta_data->>'display_name';
  
  -- Determine role and get anonymous_username from signup tables
  -- Check field_rep_signups table first
  SELECT anonymous_username INTO display_username
  FROM public.field_rep_signups 
  WHERE email = NEW.email AND status = 'pending'
  LIMIT 1;
  
  IF display_username IS NOT NULL THEN
    user_role_assignment := 'field_rep';
    signup_source := 'field_rep_signup';
  ELSE
    -- Check vendor_signups table
    SELECT anonymous_username INTO display_username
    FROM public.vendor_signups 
    WHERE email = NEW.email AND status = 'pending'
    LIMIT 1;
    
    IF display_username IS NOT NULL THEN
      user_role_assignment := 'vendor';
      signup_source := 'vendor_signup';
    ELSE
      -- No signup record found - generate fallback username using unified function
      user_role_assignment := 'field_rep';
      signup_source := 'direct';
      display_username := public.generate_anonymous_username('field-rep');
    END IF;
  END IF;

  -- Insert user profile using anonymous_username from signup or fallback
  INSERT INTO public.users (
    id, 
    anonymous_username,
    display_name,
    role,
    profile_complete,
    trust_score,
    community_score,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    display_username,
    COALESCE(provided_display_name, display_username),
    user_role_assignment,
    5,  -- Small boost for completing signup
    0,  -- Starting trust score
    0,  -- Starting community score
    NOW(),
    NOW()
  );
  
  -- Create credits record with role-based welcome bonus
  INSERT INTO public.credits (
    user_id, 
    current_balance, 
    earned_credits
  )
  VALUES (
    NEW.id, 
    CASE 
      WHEN user_role_assignment = 'admin' THEN 100
      WHEN user_role_assignment = 'moderator' THEN 50
      WHEN user_role_assignment = 'vendor' THEN 25
      ELSE 10  -- field_rep default
    END,
    CASE 
      WHEN user_role_assignment = 'admin' THEN 100
      WHEN user_role_assignment = 'moderator' THEN 50
      WHEN user_role_assignment = 'vendor' THEN 25
      ELSE 10  -- field_rep default
    END
  );
  
  -- Mark signup as converted based on source
  IF signup_source = 'field_rep_signup' THEN
    UPDATE public.field_rep_signups 
    SET status = 'converted', updated_at = NOW()
    WHERE email = NEW.email 
    AND status = 'pending';
  ELSIF signup_source = 'vendor_signup' THEN
    UPDATE public.vendor_signups 
    SET status = 'converted', updated_at = NOW()
    WHERE email = NEW.email
    AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;