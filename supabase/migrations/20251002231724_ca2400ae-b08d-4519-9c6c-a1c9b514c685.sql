-- CRITICAL SECURITY FIXES - Phase 1 (Final Fix)
-- This migration addresses the most critical security vulnerabilities

-- ===========================================
-- 1. CREATE PROPER USER ROLES SYSTEM
-- ===========================================

-- Create app_role enum (check if exists first)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'field_rep', 'vendor');
  END IF;
END $$;

-- Create dedicated user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  notes text,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing roles from users table to user_roles table
INSERT INTO public.user_roles (user_id, role, assigned_at, notes)
SELECT 
  id, 
  role::text::app_role, 
  created_at, 
  'Migrated from users table during security fix'
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- ===========================================
-- 2. FIX INFINITE RECURSION IN BULK MESSAGING
-- ===========================================

-- Create security definer function to prevent circular RLS dependencies
CREATE OR REPLACE FUNCTION public.user_can_view_bulk_message(_message_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bulk_message_recipients
    WHERE bulk_message_id = _message_id
    AND recipient_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM bulk_messages
    WHERE id = _message_id
    AND sender_id = _user_id
  )
$$;

-- Drop problematic circular policies
DROP POLICY IF EXISTS "Users can view own bulk messages" ON bulk_messages;
DROP POLICY IF EXISTS "Recipients can view messages sent to them" ON bulk_messages;

-- Create simplified non-recursive policy
CREATE POLICY "Users can view relevant bulk messages"
ON bulk_messages FOR SELECT
TO authenticated
USING (user_can_view_bulk_message(id, auth.uid()));

-- Fix bulk_message_recipients policy too
DROP POLICY IF EXISTS "Users can view own received messages" ON bulk_message_recipients;

CREATE POLICY "Users can view own received messages"
ON bulk_message_recipients FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

-- ===========================================
-- 3. ADD SEARCH_PATH TO SECURITY DEFINER FUNCTIONS
-- ===========================================

-- Fix all existing security definer functions to prevent hijacking
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_email(uuid) SET search_path = public;
ALTER FUNCTION public.is_beta_tester(text) SET search_path = public;
ALTER FUNCTION public.has_signed_nda(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_display_name(uuid) SET search_path = public;
ALTER FUNCTION public.can_send_connection_request(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.generate_anonymous_username() SET search_path = public;
ALTER FUNCTION public.log_nda_attempt(uuid, text, text, inet, text, jsonb) SET search_path = public;
ALTER FUNCTION public.can_submit_review(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.can_create_flag(uuid) SET search_path = public;
ALTER FUNCTION public.populate_location_data_from_csv() SET search_path = public;
ALTER FUNCTION public.admin_update_user_role(uuid, user_role) SET search_path = public;
ALTER FUNCTION public.increment_daily_invite_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_or_create_user_preferences(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_trust_score(uuid, text) SET search_path = public;
ALTER FUNCTION public.get_signup_stats() SET search_path = public;
ALTER FUNCTION public.award_credit(uuid, integer, text) SET search_path = public;
ALTER FUNCTION public.get_user_document_stats(uuid) SET search_path = public;
ALTER FUNCTION public.get_giveaway_eligibility(uuid, uuid, text) SET search_path = public;
ALTER FUNCTION public.ensure_role_counter_exists(text) SET search_path = public;
ALTER FUNCTION public.complete_beta_registration(text, text) SET search_path = public;
ALTER FUNCTION public.get_user_login_analytics(text, integer) SET search_path = public;
ALTER FUNCTION public.generate_anonymous_username(text) SET search_path = public;
ALTER FUNCTION public.get_user_saved_posts(uuid) SET search_path = public;
ALTER FUNCTION public.update_user_last_active(uuid) SET search_path = public;
ALTER FUNCTION public.get_next_anonymous_username(text) SET search_path = public;
ALTER FUNCTION public.award_credits(uuid, numeric, text, uuid, text, jsonb) SET search_path = public;
ALTER FUNCTION public.can_use_bad_day_token(uuid) SET search_path = public;
ALTER FUNCTION public.hide_review_with_credits(uuid, integer) SET search_path = public;
ALTER FUNCTION public.spend_rep_points(uuid, numeric, uuid, text, integer) SET search_path = public;
ALTER FUNCTION public.use_bad_day_token(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.cleanup_expired_ai_data() SET search_path = public;

-- ===========================================
-- 4. DROP AND RECREATE is_admin_user FUNCTION
-- ===========================================

-- Drop the old is_admin_user function
DROP FUNCTION IF EXISTS public.is_admin_user(uuid);

-- Create updated is_admin_user function using new has_role check
CREATE FUNCTION public.is_admin_user(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id_param, 'admin')
$$;

-- ===========================================
-- SUMMARY
-- ===========================================
-- ✅ Created dedicated user_roles table with proper RLS
-- ✅ Migrated existing roles from users table
-- ✅ Fixed infinite recursion in bulk_messages RLS
-- ✅ Added search_path protection to all SECURITY DEFINER functions
-- ✅ Created has_role() function to prevent RLS recursion
-- ✅ Updated is_admin_user() to use new role system