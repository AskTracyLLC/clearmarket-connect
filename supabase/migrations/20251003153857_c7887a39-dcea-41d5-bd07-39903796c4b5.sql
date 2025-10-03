-- Fix the sync_anonymous_username_for_user function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION public.sync_anonymous_username_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
DECLARE
  user_email TEXT;
  pre_username TEXT;
  user_type TEXT;
BEGIN
  -- Get email for this user from auth.users using a function to avoid ambiguity
  SELECT public.get_user_email(NEW.id) INTO user_email;

  IF user_email IS NOT NULL THEN
    -- Prefer the most recent pre_launch_signups entry for the email
    SELECT pls.anonymous_username
    INTO pre_username
    FROM public.pre_launch_signups pls
    WHERE pls.email = user_email
    ORDER BY pls.created_at DESC
    LIMIT 1;
  END IF;

  IF pre_username IS NOT NULL THEN
    -- Always prefer the prelaunch username to keep consistency across tables
    IF NEW.anonymous_username IS DISTINCT FROM pre_username THEN
      NEW.anonymous_username := pre_username;
    END IF;
  ELSE
    -- If missing or generic, generate a role-based username using existing generator
    IF NEW.anonymous_username IS NULL OR NEW.anonymous_username ~* '^user\\d+$' THEN
      user_type := CASE NEW.role
        WHEN 'field_rep' THEN 'field-rep'
        WHEN 'vendor' THEN 'vendor'
        ELSE 'field-rep'
      END;

      -- Use role-based generator that produces values like "FieldRep#1" / "Vendor#1"
      NEW.anonymous_username := public.generate_anonymous_username(user_type);
    END IF;
  END IF;

  RETURN NEW;
END;
$func$;

-- Now fix missing user records for authenticated users
INSERT INTO public.users (
  id,
  role,
  anonymous_username,
  display_name,
  trust_score,
  community_score,
  profile_complete,
  nda_signed,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(
    (au.raw_user_meta_data->>'role')::user_role,
    'field_rep'::user_role
  ) as role,
  COALESCE(
    au.raw_user_meta_data->>'anonymous_username',
    'User#' || (FLOOR(RANDOM() * 10000) + 1)::text
  ) as anonymous_username,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'anonymous_username',
    'User#' || (FLOOR(RANDOM() * 10000) + 1)::text
  ) as display_name,
  50 as trust_score,
  50 as community_score,
  0 as profile_complete,
  COALESCE((au.raw_user_meta_data->>'nda_signed')::boolean, false) as nda_signed,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
AND au.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- Ensure all existing users have nda_signed set to false by default if NULL
UPDATE public.users
SET nda_signed = false
WHERE nda_signed IS NULL;