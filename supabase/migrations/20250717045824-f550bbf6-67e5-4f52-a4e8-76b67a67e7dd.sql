-- Update tracy@asktracyllc.com to admin status with proper settings
UPDATE public.users 
SET 
  role = 'admin',
  display_name = 'Admin Tracy',
  anonymous_username = 'Admin#1',
  trust_score = 100,
  profile_complete = 100,
  storage_limit_mb = 1000,
  updated_at = now()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'tracy@asktracyllc.com'
);

-- Update credits to admin level
UPDATE public.credits
SET 
  current_balance = 100,
  earned_credits = 100,
  updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'tracy@asktracyllc.com'
);

-- Verify the changes
SELECT 
  u.id,
  u.display_name,
  u.anonymous_username,
  u.role,
  u.trust_score,
  u.profile_complete,
  c.current_balance,
  c.earned_credits
FROM public.users u
LEFT JOIN public.credits c ON u.id = c.user_id
WHERE u.id = (
  SELECT id FROM auth.users WHERE email = 'tracy@asktracyllc.com'
);