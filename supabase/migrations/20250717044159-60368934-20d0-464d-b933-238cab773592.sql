-- Create the trigger for handling new user creation
-- This will automatically create a user profile when someone signs up

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
  
  -- Generate username for new user
  user_role_assignment := 'field_rep';
  signup_source := 'direct';
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
    10, -- Default credits for new users
    10
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger to run this function when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();