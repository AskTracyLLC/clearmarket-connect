-- Update default trust_score and community_score to 50 baseline
-- Modify the handle_new_user function to set baseline scores to 50

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  generated_username TEXT;
  token_username TEXT;
BEGIN
  -- Check if this user came from a beta registration token
  SELECT anonymous_username INTO token_username
  FROM public.beta_registration_tokens
  WHERE created_user_id = NEW.id AND used_at IS NOT NULL;
  
  -- Use token username if available, otherwise generate new one
  IF token_username IS NOT NULL THEN
    generated_username := token_username;
  ELSE
    generated_username := generate_anonymous_username();
  END IF;
  
  -- Insert into users table with display_name = anonymous_username and baseline scores of 50
  INSERT INTO public.users (
    id, 
    display_name, 
    anonymous_username,
    role,
    profile_complete,
    trust_score,
    community_score,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    generated_username,  -- Set display_name to anonymous_username (locked during beta)
    generated_username,
    'field_rep'::public.user_role,
    5,  -- Small boost for completing signup
    50, -- Baseline trust score of 50
    50, -- Baseline community score of 50
    NOW(),
    NOW()
  );
  
  -- Create credits record
  INSERT INTO public.credits (
    user_id, 
    current_balance, 
    earned_credits
  ) VALUES (
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

-- Update existing users to have baseline scores of 50 if they currently have 0
UPDATE public.users 
SET 
  trust_score = 50,
  community_score = 50,
  updated_at = NOW()
WHERE trust_score = 0 OR community_score = 0;