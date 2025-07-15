-- Fix typo in both email sending functions - correct project ID from bqqlhaqwsnfhhatxhtfx to bgqlhaqwsnfhhatxhtfx

-- Update field rep signup email function
CREATE OR REPLACE FUNCTION public.send_field_rep_signup_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    'anonymous_username', COALESCE(NEW.anonymous_username, 'NewFieldRep'),
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
$function$;

-- Update vendor signup email function
CREATE OR REPLACE FUNCTION public.send_vendor_signup_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    'anonymous_username', COALESCE(NEW.anonymous_username, 'NewVendor'),
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
$function$;