-- Fix critical security warnings in Supabase (Part 2)
-- This migration addresses the security scan findings

-- 1. Fix missing RLS policies for sensitive data exposure

-- First check if policies exist and drop them if they do
DO $$
BEGIN
  -- Fix feedback_posts table - restrict public access to email addresses
  DROP POLICY IF EXISTS "Admins and moderators can view feedback posts" ON public.feedback_posts;
  DROP POLICY IF EXISTS "Anonymous users can create feedback posts" ON public.feedback_posts;
  DROP POLICY IF EXISTS "Authenticated users can create feedback posts" ON public.feedback_posts;

  CREATE POLICY "Admins and moderators can view feedback posts" ON public.feedback_posts
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin'::user_role, 'moderator'::user_role)
  );

  CREATE POLICY "Authenticated users can create feedback posts" ON public.feedback_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
END$$;

-- Fix pre_launch_signups table - restrict to admin access only
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anonymous users can signup" ON public.pre_launch_signups;
  DROP POLICY IF EXISTS "Anonymous users can insert signups" ON public.pre_launch_signups;
  DROP POLICY IF EXISTS "Admins can view all signups" ON public.pre_launch_signups;

  CREATE POLICY "Anonymous users can insert signups" ON public.pre_launch_signups
  FOR INSERT WITH CHECK (auth.uid() IS NULL);

  CREATE POLICY "Admins can view all signups" ON public.pre_launch_signups
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);
END$$;

-- Fix user_business_hours table - restrict access to user and their network
DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view business hours" ON public.user_business_hours;
  DROP POLICY IF EXISTS "Users can view own business hours" ON public.user_business_hours;
  DROP POLICY IF EXISTS "Network members can view business hours" ON public.user_business_hours;
  DROP POLICY IF EXISTS "Users can manage own business hours" ON public.user_business_hours;

  CREATE POLICY "Users can view own business hours" ON public.user_business_hours
  FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Network members can view business hours" ON public.user_business_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contact_unlocks cu 
      WHERE (
        (cu.unlocker_id = auth.uid() AND cu.unlocked_user_id = user_business_hours.user_id) OR
        (cu.unlocked_user_id = auth.uid() AND cu.unlocker_id = user_business_hours.user_id)
      )
    )
  );

  CREATE POLICY "Users can manage own business hours" ON public.user_business_hours
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
END$$;

-- 2. Fix function search_path issues for security definer functions
ALTER FUNCTION public.get_user_role(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_email(UUID) SET search_path = public;
ALTER FUNCTION public.is_beta_tester(text) SET search_path = public;
ALTER FUNCTION public.has_signed_nda(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_display_name(UUID) SET search_path = public;
ALTER FUNCTION public.generate_anonymous_username() SET search_path = public;
ALTER FUNCTION public.log_nda_attempt(UUID, text, text, inet, text, jsonb) SET search_path = public;
ALTER FUNCTION public.populate_location_data_from_csv() SET search_path = public;
ALTER FUNCTION public.sync_anonymous_username_for_user() SET search_path = public;
ALTER FUNCTION public.get_or_create_user_preferences(UUID) SET search_path = public;
ALTER FUNCTION public.calculate_trust_score(UUID, text) SET search_path = public;
ALTER FUNCTION public.can_submit_review(UUID, UUID) SET search_path = public;
ALTER FUNCTION public.ensure_role_counter_exists(text) SET search_path = public;
ALTER FUNCTION public.hide_review_with_credits(UUID, integer) SET search_path = public;
ALTER FUNCTION public.reset_role_counter(text, integer) SET search_path = public;
ALTER FUNCTION public.get_role_counters() SET search_path = public;
ALTER FUNCTION public.add_new_role_type(text) SET search_path = public;
ALTER FUNCTION public.generate_beta_registration_token(text, text, text) SET search_path = public;
ALTER FUNCTION public.upgrade_user_to_admin(text, text, text) SET search_path = public;
ALTER FUNCTION public.is_admin_user(UUID) SET search_path = public;
ALTER FUNCTION public.sync_anonymous_username_for_user_id() SET search_path = public;
ALTER FUNCTION public.can_create_flag(UUID) SET search_path = public;
ALTER FUNCTION public.ensure_admin_exists() SET search_path = public;
ALTER FUNCTION public.update_trust_score(UUID) SET search_path = public;
ALTER FUNCTION public.setup_test_user(text, user_role, text, integer, integer, integer) SET search_path = public;
ALTER FUNCTION public.toggle_user_activation(UUID, boolean) SET search_path = public;
ALTER FUNCTION public.spend_clear_credits(UUID, numeric, UUID, text, jsonb) SET search_path = public;
ALTER FUNCTION public.spend_credits(UUID, numeric, UUID, text, jsonb) SET search_path = public;
ALTER FUNCTION public.check_daily_invite_limit(UUID) SET search_path = public;
ALTER FUNCTION public.increment_daily_invite_count(UUID) SET search_path = public;
ALTER FUNCTION public.accept_connection_request(UUID) SET search_path = public;
ALTER FUNCTION public.decline_connection_request(UUID) SET search_path = public;
ALTER FUNCTION public.generate_anonymous_username(text) SET search_path = public;
ALTER FUNCTION public.get_next_anonymous_username(text) SET search_path = public;
ALTER FUNCTION public.check_rate_limit(UUID, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.admin_update_user_role(UUID, user_role) SET search_path = public;