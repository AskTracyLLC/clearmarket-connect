-- Fix Remaining Search Path Issues on Trigger Functions
-- This addresses the remaining function_search_path_mutable warnings

-- Add search_path to all trigger functions
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.send_field_rep_signup_email() SET search_path = public;
ALTER FUNCTION public.update_trust_score_trigger() SET search_path = public;
ALTER FUNCTION public.track_review_frequency() SET search_path = public;
ALTER FUNCTION public.increment_connection_request_limit() SET search_path = public;
ALTER FUNCTION public.sync_anonymous_username_for_user() SET search_path = public;
ALTER FUNCTION public.audit_role_changes() SET search_path = public;
ALTER FUNCTION public.log_user_creation() SET search_path = public;
ALTER FUNCTION public.log_post_removal() SET search_path = public;
ALTER FUNCTION public.log_review_activity() SET search_path = public;
ALTER FUNCTION public.update_last_active_and_log() SET search_path = public;
ALTER FUNCTION public.set_anonymous_username() SET search_path = public;
ALTER FUNCTION public.set_anonymous_username_prelaunch() SET search_path = public;
ALTER FUNCTION public.handle_beta_signup_email_with_token() SET search_path = public;
ALTER FUNCTION public.update_admin_discussions_updated_at() SET search_path = public;
ALTER FUNCTION public.update_user_documents_updated_at() SET search_path = public;
ALTER FUNCTION public.expire_old_connection_requests() SET search_path = public;

-- ✅ All trigger and scheduled functions now have search_path protection