-- Fix Security Definer Views by enabling security_invoker
-- This ensures views use the querying user's permissions and RLS policies

-- Fix field_rep_full_profiles view to use security_invoker
ALTER VIEW public.field_rep_full_profiles SET (security_invoker = true);

-- Fix active_hidden_reviews view to use security_invoker
ALTER VIEW public.active_hidden_reviews SET (security_invoker = true);

-- Note: The user_balances view already has security_invoker = true, so it's correctly configured