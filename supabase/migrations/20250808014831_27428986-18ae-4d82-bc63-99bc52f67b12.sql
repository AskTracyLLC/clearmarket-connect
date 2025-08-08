-- Migration: Sync anonymous_username across tables and enforce consistency
-- Description: Ensure users.anonymous_username matches pre_launch_signups.anonymous_username
-- and generate role-based usernames when missing or generic. Adds trigger on public.users.
-- Rollback instructions (manual):
-- 1) DROP TRIGGER IF EXISTS sync_anonymous_username_before_insert ON public.users;
-- 2) DROP FUNCTION IF EXISTS public.sync_anonymous_username_for_user();
-- 3) Optionally revert updated usernames by restoring from a backup.

BEGIN;

-- 1) Create or replace function to sync anonymous_username from pre_launch_signups
CREATE OR REPLACE FUNCTION public.sync_anonymous_username_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  email TEXT;
  pre_username TEXT;
  user_type TEXT;
BEGIN
  -- Get email for this user from auth.users
  SELECT public.get_user_email(NEW.id) INTO email;

  IF email IS NOT NULL THEN
    -- Prefer the most recent pre_launch_signups entry for the email
    SELECT pls.anonymous_username
    INTO pre_username
    FROM public.pre_launch_signups pls
    WHERE pls.email = email
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
    IF NEW.anonymous_username IS NULL OR NEW.anonymous_username ~* '^user\d+$' THEN
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
$$;

-- 2) Create trigger (if not exists) to enforce syncing on INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_before_insert'
  ) THEN
    CREATE TRIGGER sync_anonymous_username_before_insert
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_anonymous_username_for_user();
  END IF;
END$$;

-- 3) One-time data fix: align existing users with pre_launch_signups entries
-- Only update if users.anonymous_username is NULL, generic 'userN', or different from prelaunch username
WITH joined AS (
  SELECT u.id AS user_id, pls.anonymous_username AS pre_username
  FROM public.users u
  JOIN auth.users au ON au.id = u.id
  JOIN public.pre_launch_signups pls ON pls.email = au.email
  WHERE pls.anonymous_username IS NOT NULL AND pls.anonymous_username <> ''
  QUALIFY ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY pls.created_at DESC) = 1
)
UPDATE public.users u
SET anonymous_username = j.pre_username,
    updated_at = now()
FROM joined j
WHERE u.id = j.user_id
  AND (
    u.anonymous_username IS NULL OR
    u.anonymous_username ~* '^user\d+$' OR
    u.anonymous_username <> j.pre_username
  );

COMMIT;