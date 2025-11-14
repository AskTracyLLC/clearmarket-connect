-- Create a secure function to look up email by username for authentication
-- This function is SECURITY DEFINER so it runs with elevated privileges
-- but only returns the email for authentication purposes
CREATE OR REPLACE FUNCTION public.lookup_email_by_username(username_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Look up the email for the given username (case-insensitive)
  SELECT email INTO user_email
  FROM public.users
  WHERE anonymous_username ILIKE username_input
  LIMIT 1;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission to anonymous users (needed for sign-in)
GRANT EXECUTE ON FUNCTION public.lookup_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_username(TEXT) TO authenticated;