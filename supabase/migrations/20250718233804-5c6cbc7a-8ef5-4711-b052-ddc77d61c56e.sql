-- Create email trigger for pre_launch_signups
CREATE OR REPLACE FUNCTION public.send_prelaunch_signup_email()
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
  
  -- Prepare the payload based on user type
  payload := jsonb_build_object(
    'signupType', NEW.user_type,
    'email', NEW.email,
    'anonymous_username', COALESCE(NEW.anonymous_username, 'User#0'),
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

  -- Log the response
  RAISE NOTICE 'Prelaunch signup email trigger response: status=%, content=%', 
    http_response.status, http_response.content;

  -- If email sending failed, log it but don't prevent the signup
  IF http_response.status NOT BETWEEN 200 AND 299 THEN
    RAISE WARNING 'Failed to send prelaunch signup email for %: HTTP %', 
      NEW.email, http_response.status;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for pre_launch_signups email notifications
DROP TRIGGER IF EXISTS send_prelaunch_email_trigger ON public.pre_launch_signups;
CREATE TRIGGER send_prelaunch_email_trigger
  AFTER INSERT ON public.pre_launch_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.send_prelaunch_signup_email();