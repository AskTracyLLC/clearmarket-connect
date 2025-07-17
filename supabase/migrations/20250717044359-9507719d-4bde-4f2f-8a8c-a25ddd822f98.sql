-- Drop and recreate the function with proper schema qualification
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role_assignment public.user_role := 'field_rep'; -- Default role with schema
  display_username TEXT;
  provided_display_name TEXT;
BEGIN
  -- Get display name from metadata if provided
  provided_display_name := NEW.raw_user_meta_data->>'display_name';
  
  -- Generate username for new user  
  display_username := public.generate_anonymous_username('field-rep');

  -- Insert user profile using anonymous_username
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
    'field_rep'::public.user_role,  -- Explicitly cast with schema
    5,  -- Small boost for completing signup
    0,  -- Starting trust score
    0,  -- Starting community score
    NOW(),
    NOW()
  );
  
  -- Create credits record
  INSERT INTO public.credits (
    user_id, 
    current_balance, 
    earned_credits
  )
  VALUES (
    NEW.id, 
    10, -- Default credits for new users
    10
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();