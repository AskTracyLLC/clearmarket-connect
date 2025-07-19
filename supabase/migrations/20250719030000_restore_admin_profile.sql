
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'tracy@asktracyllc.com';
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      role,
      display_name,
      anonymous_username,
      trust_score,
      profile_complete,
      storage_limit_mb,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin',
      'Admin Tracy',
      'Admin#1',
      100,
      100,
      1000,
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      display_name = 'Admin Tracy',
      anonymous_username = 'Admin#1',
      trust_score = 100,
      profile_complete = 100,
      storage_limit_mb = 1000,
      updated_at = now();
    
    INSERT INTO public.credits (
      user_id,
      current_balance,
      earned_credits,
      paid_credits,
      updated_at
    ) VALUES (
      admin_user_id,
      100,
      100,
      0,
      now()
    ) ON CONFLICT (user_id) DO UPDATE SET
      current_balance = 100,
      earned_credits = 100,
      updated_at = now();
    
    RAISE NOTICE 'Admin profile restored for tracy@asktracyllc.com';
  ELSE
    RAISE NOTICE 'Auth user not found for tracy@asktracyllc.com';
  END IF;
END $$;
