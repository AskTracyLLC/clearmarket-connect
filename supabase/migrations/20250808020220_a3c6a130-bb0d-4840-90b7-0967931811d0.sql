-- Migration: Add anonymous_username to tables with user_id, backfill, and sync triggers
-- Purpose: Improve admin searchability and performance by denormalizing anonymous_username
-- Rollback instructions (manual):
-- 1) DROP TRIGGERs created below on each table
-- 2) DROP FUNCTION IF EXISTS public.sync_anonymous_username_for_user_id();
-- 3) Optionally ALTER TABLE ... DROP COLUMN anonymous_username on each table if needed
-- Notes:
-- - Uses IF NOT EXISTS guards and conditional DO blocks for safety
-- - Only applies to tables that both exist and contain a user_id column

BEGIN;

-- 0) Helper function to sync anonymous_username from public.users using NEW.user_id
CREATE OR REPLACE FUNCTION public.sync_anonymous_username_for_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Set from users table; if not found, keep as-is (NULL)
  SELECT u.anonymous_username
  INTO NEW.anonymous_username
  FROM public.users u
  WHERE u.id = NEW.user_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fail-safe: never block DML if lookup fails
  RETURN NEW;
END;
$$;

-- Utility: procedure-like block to add column, backfill, and create trigger for a given table
-- We repeat per table to preserve clarity and explicitness

-- 1) community_posts
DO $$
BEGIN
  IF to_regclass('public.community_posts') IS NOT NULL THEN
    -- Ensure column exists
    ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS anonymous_username TEXT;

    -- Backfill existing rows
    UPDATE public.community_posts cp
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = cp.user_id
      AND (cp.anonymous_username IS DISTINCT FROM u.anonymous_username);

    -- Create trigger if table has user_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='community_posts' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_community_posts'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_community_posts
      BEFORE INSERT OR UPDATE OF user_id ON public.community_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 2) community_comments
DO $$
BEGIN
  IF to_regclass('public.community_comments') IS NOT NULL THEN
    ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.community_comments c
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = c.user_id
      AND (c.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='community_comments' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_community_comments'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_community_comments
      BEFORE INSERT OR UPDATE OF user_id ON public.community_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 3) feedback_posts
DO $$
BEGIN
  IF to_regclass('public.feedback_posts') IS NOT NULL THEN
    ALTER TABLE public.feedback_posts ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.feedback_posts fp
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = fp.user_id
      AND (fp.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='feedback_posts' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_feedback_posts'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_feedback_posts
      BEFORE INSERT OR UPDATE OF user_id ON public.feedback_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 4) user_documents
DO $$
BEGIN
  IF to_regclass('public.user_documents') IS NOT NULL THEN
    ALTER TABLE public.user_documents ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.user_documents d
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = d.user_id
      AND (d.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='user_documents' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_user_documents'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_user_documents
      BEFORE INSERT OR UPDATE OF user_id ON public.user_documents
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 5) field_rep_profiles
DO $$
BEGIN
  IF to_regclass('public.field_rep_profiles') IS NOT NULL THEN
    ALTER TABLE public.field_rep_profiles ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.field_rep_profiles p
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = p.user_id
      AND (p.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='field_rep_profiles' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_field_rep_profiles'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_field_rep_profiles
      BEFORE INSERT OR UPDATE OF user_id ON public.field_rep_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 6) vendor_profiles
DO $$
BEGIN
  IF to_regclass('public.vendor_profiles') IS NOT NULL THEN
    ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.vendor_profiles p
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = p.user_id
      AND (p.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='vendor_profiles' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_vendor_profiles'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_vendor_profiles
      BEFORE INSERT OR UPDATE OF user_id ON public.vendor_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 7) credits
DO $$
BEGIN
  IF to_regclass('public.credits') IS NOT NULL THEN
    ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.credits c
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = c.user_id
      AND (c.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='credits' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_credits'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_credits
      BEFORE INSERT OR UPDATE OF user_id ON public.credits
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 8) credit_transactions
DO $$
BEGIN
  IF to_regclass('public.credit_transactions') IS NOT NULL THEN
    ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.credit_transactions ct
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = ct.user_id
      AND (ct.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='credit_transactions' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_credit_transactions'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_credit_transactions
      BEFORE INSERT OR UPDATE OF user_id ON public.credit_transactions
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 9) daily_credit_earnings
DO $$
BEGIN
  IF to_regclass('public.daily_credit_earnings') IS NOT NULL THEN
    ALTER TABLE public.daily_credit_earnings ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.daily_credit_earnings dce
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = dce.user_id
      AND (dce.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='daily_credit_earnings' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_daily_credit_earnings'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_daily_credit_earnings
      BEFORE INSERT OR UPDATE OF user_id ON public.daily_credit_earnings
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 10) daily_invite_limits
DO $$
BEGIN
  IF to_regclass('public.daily_invite_limits') IS NOT NULL THEN
    ALTER TABLE public.daily_invite_limits ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.daily_invite_limits dil
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = dil.user_id
      AND (dil.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='daily_invite_limits' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_daily_invite_limits'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_daily_invite_limits
      BEFORE INSERT OR UPDATE OF user_id ON public.daily_invite_limits
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 11) auto_reply_settings
DO $$
BEGIN
  IF to_regclass('public.auto_reply_settings') IS NOT NULL THEN
    ALTER TABLE public.auto_reply_settings ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.auto_reply_settings ars
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = ars.user_id
      AND (ars.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='auto_reply_settings' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_auto_reply_settings'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_auto_reply_settings
      BEFORE INSERT OR UPDATE OF user_id ON public.auto_reply_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 12) calendar_events
DO $$
BEGIN
  IF to_regclass('public.calendar_events') IS NOT NULL THEN
    ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.calendar_events ce
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = ce.user_id
      AND (ce.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='calendar_events' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_calendar_events'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_calendar_events
      BEFORE INSERT OR UPDATE OF user_id ON public.calendar_events
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 13) saved_posts (if exists)
DO $$
BEGIN
  IF to_regclass('public.saved_posts') IS NOT NULL THEN
    ALTER TABLE public.saved_posts ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    UPDATE public.saved_posts sp
    SET anonymous_username = u.anonymous_username
    FROM public.users u
    WHERE u.id = sp.user_id
      AND (sp.anonymous_username IS DISTINCT FROM u.anonymous_username);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='saved_posts' AND column_name='user_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_saved_posts'
    ) THEN
      CREATE TRIGGER sync_anonymous_username_saved_posts
      BEFORE INSERT OR UPDATE OF user_id ON public.saved_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
    END IF;
  END IF;
END$$;

-- 14) coverage_areas (if exists and has user_id)
DO $$
BEGIN
  IF to_regclass('public.coverage_areas') IS NOT NULL THEN
    ALTER TABLE public.coverage_areas ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='coverage_areas' AND column_name='user_id'
    ) THEN
      UPDATE public.coverage_areas ca
      SET anonymous_username = u.anonymous_username
      FROM public.users u
      WHERE u.id = ca.user_id
        AND (ca.anonymous_username IS DISTINCT FROM u.anonymous_username);
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_coverage_areas'
      ) THEN
        CREATE TRIGGER sync_anonymous_username_coverage_areas
        BEFORE INSERT OR UPDATE OF user_id ON public.coverage_areas
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
      END IF;
    END IF;
  END IF;
END$$;

-- 15) user_communication_badges (if exists)
DO $$
BEGIN
  IF to_regclass('public.user_communication_badges') IS NOT NULL THEN
    ALTER TABLE public.user_communication_badges ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='user_communication_badges' AND column_name='user_id'
    ) THEN
      UPDATE public.user_communication_badges ucb
      SET anonymous_username = u.anonymous_username
      FROM public.users u
      WHERE u.id = ucb.user_id
        AND (ucb.anonymous_username IS DISTINCT FROM u.anonymous_username);
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_user_communication_badges'
      ) THEN
        CREATE TRIGGER sync_anonymous_username_user_communication_badges
        BEFORE INSERT OR UPDATE OF user_id ON public.user_communication_badges
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
      END IF;
    END IF;
  END IF;
END$$;

-- 16) vendor_staff_members (if exists)
DO $$
BEGIN
  IF to_regclass('public.vendor_staff_members') IS NOT NULL THEN
    ALTER TABLE public.vendor_staff_members ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='vendor_staff_members' AND column_name='user_id'
    ) THEN
      UPDATE public.vendor_staff_members vsm
      SET anonymous_username = u.anonymous_username
      FROM public.users u
      WHERE u.id = vsm.user_id
        AND (vsm.anonymous_username IS DISTINCT FROM u.anonymous_username);
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_vendor_staff_members'
      ) THEN
        CREATE TRIGGER sync_anonymous_username_vendor_staff_members
        BEFORE INSERT OR UPDATE OF user_id ON public.vendor_staff_members
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
      END IF;
    END IF;
  END IF;
END$$;

-- 17) user_invitations (if exists)
DO $$
BEGIN
  IF to_regclass('public.user_invitations') IS NOT NULL THEN
    ALTER TABLE public.user_invitations ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='user_invitations' AND column_name='user_id'
    ) THEN
      UPDATE public.user_invitations ui
      SET anonymous_username = u.anonymous_username
      FROM public.users u
      WHERE u.id = ui.user_id
        AND (ui.anonymous_username IS DISTINCT FROM u.anonymous_username);
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_user_invitations'
      ) THEN
        CREATE TRIGGER sync_anonymous_username_user_invitations
        BEFORE INSERT OR UPDATE OF user_id ON public.user_invitations
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
      END IF;
    END IF;
  END IF;
END$$;

-- 18) giveaway_entries (if exists)
DO $$
BEGIN
  IF to_regclass('public.giveaway_entries') IS NOT NULL THEN
    ALTER TABLE public.giveaway_entries ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='giveaway_entries' AND column_name='user_id'
    ) THEN
      UPDATE public.giveaway_entries ge
      SET anonymous_username = u.anonymous_username
      FROM public.users u
      WHERE u.id = ge.user_id
        AND (ge.anonymous_username IS DISTINCT FROM u.anonymous_username);
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_giveaway_entries'
      ) THEN
        CREATE TRIGGER sync_anonymous_username_giveaway_entries
        BEFORE INSERT OR UPDATE OF user_id ON public.giveaway_entries
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
      END IF;
    END IF;
  END IF;
END$$;

-- 19) vendor_network_alert_recipients (if exists)
DO $$
BEGIN
  IF to_regclass('public.vendor_network_alert_recipients') IS NOT NULL THEN
    ALTER TABLE public.vendor_network_alert_recipients ADD COLUMN IF NOT EXISTS anonymous_username TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='vendor_network_alert_recipients' AND column_name='user_id'
    ) THEN
      UPDATE public.vendor_network_alert_recipients vnar
      SET anonymous_username = u.anonymous_username
      FROM public.users u
      WHERE u.id = vnar.user_id
        AND (vnar.anonymous_username IS DISTINCT FROM u.anonymous_username);
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'sync_anonymous_username_vendor_network_alert_recipients'
      ) THEN
        CREATE TRIGGER sync_anonymous_username_vendor_network_alert_recipients
        BEFORE INSERT OR UPDATE OF user_id ON public.vendor_network_alert_recipients
        FOR EACH ROW
        EXECUTE FUNCTION public.sync_anonymous_username_for_user_id();
      END IF;
    END IF;
  END IF;
END$$;

-- Note: beta_registration_tokens already includes anonymous_username and is not tied to user_id; no trigger added.

COMMIT;