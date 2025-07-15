-- Fix generate_anonymous_username function to work with correct tables and format
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
  
  -- Get the next number for this user type from the correct tables
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN anonymous_username ~ (username_prefix || '[0-9]+$') 
        THEN CAST(SUBSTRING(anonymous_username FROM (username_prefix || '([0-9]+)$')) AS INTEGER)
        ELSE 0
      END
    ), 0) + 1
  INTO next_number
  FROM (
    SELECT anonymous_username FROM public.field_rep_signups
    UNION ALL
    SELECT anonymous_username FROM public.vendor_signups
  ) combined_signups
  WHERE anonymous_username LIKE username_prefix || '%';

  -- Generate new username without # symbol (format: Vendor1, Vendor2, etc.)
  new_username := username_prefix || next_number;
  
  RETURN new_username;
END;
$$;

-- Grant execute permission to anonymous users for signup functionality
GRANT EXECUTE ON FUNCTION public.generate_anonymous_username(text) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_anonymous_username(text) TO authenticated;