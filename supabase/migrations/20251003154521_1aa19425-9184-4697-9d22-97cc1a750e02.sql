-- Add email column to public.users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email text;
  END IF;
END $$;

-- Populate email for all existing users from auth.users
UPDATE public.users pu
SET email = au.email
FROM auth.users au
WHERE pu.id = au.id
AND pu.email IS NULL;

-- Update the handle_new_user trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'anonymous_username', 'User#' || (FLOOR(RANDOM() * 10000) + 1)::text),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'anonymous_username', 'User#' || (FLOOR(RANDOM() * 10000) + 1)::text),
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