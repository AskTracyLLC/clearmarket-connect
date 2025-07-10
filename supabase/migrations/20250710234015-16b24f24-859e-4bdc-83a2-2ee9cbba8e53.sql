-- Fix the generate_anonymous_username function to allow public access
-- This function needs to be accessible for signup forms

-- Update the function to ensure it's accessible for public signup
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
  -- Set prefix based on user type
  IF user_type_param = 'vendor' THEN
    username_prefix := 'Vendor';
  ELSIF user_type_param = 'field-rep' THEN
    username_prefix := 'FieldRep';
  ELSE
    username_prefix := 'User';
  END IF;
  
  -- Get the next number for this user type
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(anonymous_username FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.pre_launch_signups
  WHERE anonymous_username LIKE username_prefix || '%'
    AND anonymous_username ~ (username_prefix || '[0-9]+$');
  
  -- Create the new username
  new_username := username_prefix || '#' || next_number;
  
  RETURN new_username;
END;
$$;

-- Grant execute permission to anonymous users for signup functionality
GRANT EXECUTE ON FUNCTION public.generate_anonymous_username(text) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_anonymous_username(text) TO authenticated;