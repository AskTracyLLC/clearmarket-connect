-- Drop the incorrect generate_anonymous_username function overloads
DROP FUNCTION IF EXISTS public.generate_anonymous_username(text);
DROP FUNCTION IF EXISTS public.generate_anonymous_username();

-- Create proper role-based username generator
CREATE OR REPLACE FUNCTION public.generate_anonymous_username(user_type_param text DEFAULT 'field-rep')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  counter INTEGER;
  new_username TEXT;
  username_prefix TEXT;
  pattern TEXT;
BEGIN
  -- Determine prefix based on user type
  CASE user_type_param
    WHEN 'vendor' THEN
      username_prefix := 'Vendor#';
      pattern := '^Vendor#(\d+)$';
    WHEN 'field-rep', 'field_rep' THEN
      username_prefix := 'FieldRep#';
      pattern := '^FieldRep#(\d+)$';
    WHEN 'admin' THEN
      username_prefix := 'Admin#';
      pattern := '^Admin#(\d+)$';
    WHEN 'moderator' THEN
      username_prefix := 'Moderator#';
      pattern := '^Moderator#(\d+)$';
    ELSE
      username_prefix := 'User#';
      pattern := '^User#(\d+)$';
  END CASE;
  
  -- Find the highest number used for this prefix
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(anonymous_username FROM pattern) AS INTEGER)), 
    0
  ) + 1
  INTO counter
  FROM public.users 
  WHERE anonymous_username ~ pattern;
  
  IF counter IS NULL THEN
    counter := 1;
  END IF;
  
  new_username := username_prefix || counter::TEXT;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.users WHERE anonymous_username = new_username) LOOP
    counter := counter + 1;
    new_username := username_prefix || counter::TEXT;
  END LOOP;
  
  RETURN new_username;
END;
$$;

-- Update handle_new_user to use proper username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_type TEXT;
  generated_username TEXT;
BEGIN
  -- Determine user type from metadata or default to field_rep
  user_type := COALESCE(NEW.raw_user_meta_data->>'role', 'field_rep');
  
  -- Map role to username type
  user_type := CASE user_type
    WHEN 'field_rep' THEN 'field-rep'
    WHEN 'vendor' THEN 'vendor'
    WHEN 'admin' THEN 'admin'
    WHEN 'moderator' THEN 'moderator'
    ELSE 'field-rep'
  END;
  
  -- Generate username if not provided in metadata
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'anonymous_username',
    public.generate_anonymous_username(user_type)
  );
  
  INSERT INTO public.users (
    id,
    email,
    role,
    anonymous_username,
    display_name,
    trust_score,
    community_score,
    profile_complete,
    nda_signed
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'field_rep'::user_role),
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      generated_username
    ),
    50,
    50,
    0,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;

-- Update existing users to have proper role-based usernames
DO $$
DECLARE
  user_record RECORD;
  new_username TEXT;
  user_type TEXT;
BEGIN
  FOR user_record IN 
    SELECT id, role, anonymous_username 
    FROM public.users 
    WHERE anonymous_username !~ '^(Vendor#\d+|FieldRep#\d+|Admin#\d+|Moderator#\d+)$'
    ORDER BY created_at
  LOOP
    -- Map role to username type
    user_type := CASE user_record.role::text
      WHEN 'vendor' THEN 'vendor'
      WHEN 'field_rep' THEN 'field-rep'
      WHEN 'admin' THEN 'admin'
      WHEN 'moderator' THEN 'moderator'
      ELSE 'field-rep'
    END;
    
    -- Generate new username
    new_username := public.generate_anonymous_username(user_type);
    
    -- Update user
    UPDATE public.users 
    SET anonymous_username = new_username
    WHERE id = user_record.id;
  END LOOP;
END $$;