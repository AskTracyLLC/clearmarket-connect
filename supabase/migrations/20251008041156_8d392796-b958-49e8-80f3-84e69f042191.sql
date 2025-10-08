-- Update the handle_new_user trigger to ensure display_name defaults to anonymous_username
-- This ensures all new users have display_name = anonymous_username by default
-- Users can change it later if they want

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- IMPORTANT: display_name defaults to anonymous_username
    -- but can be changed by the user later
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
$function$;