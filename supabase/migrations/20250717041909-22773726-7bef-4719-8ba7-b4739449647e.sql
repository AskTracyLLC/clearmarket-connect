-- Just create the admin user profile and credits - user will sign up normally first
-- This is a fallback approach since we can't directly modify auth.users

-- Let's check if tracy@asktracyllc.com already exists in auth.users
-- If they sign up first, we can then update their profile

-- First, let's create a function to upgrade a user to admin
CREATE OR REPLACE FUNCTION public.upgrade_user_to_admin(
  target_email TEXT,
  new_display_name TEXT DEFAULT 'Admin#1',
  new_anonymous_username TEXT DEFAULT 'Admin#1'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from auth.users by email
  SELECT au.id INTO target_user_id 
  FROM auth.users au 
  WHERE au.email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update user profile to admin
  UPDATE public.users 
  SET 
    role = 'admin',
    display_name = new_display_name,
    anonymous_username = new_anonymous_username,
    trust_score = 100,
    profile_complete = 100,
    storage_limit_mb = 1000,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Update credits to admin level
  UPDATE public.credits
  SET 
    current_balance = 100,
    earned_credits = 100,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- If credits record doesn't exist, create it
  INSERT INTO public.credits (user_id, current_balance, earned_credits, paid_credits)
  VALUES (target_user_id, 100, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;