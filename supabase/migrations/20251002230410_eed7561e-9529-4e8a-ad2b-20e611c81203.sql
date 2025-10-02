-- Fix remaining Security Definer Views
-- These views need security_invoker to ensure they use the querying user's permissions

-- Fix user_balances view (recreate with security_invoker)
DROP VIEW IF EXISTS public.user_balances;
CREATE VIEW public.user_balances
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  COALESCE(current_balance, 0) AS clear_credits,
  COALESCE(earned_credits, 0) AS total_earned_credits,
  COALESCE(paid_credits, 0) AS paid_credits,
  updated_at
FROM public.credits;

-- Fix users_with_display_names view (recreate with security_invoker)
DROP VIEW IF EXISTS public.users_with_display_names;
CREATE VIEW public.users_with_display_names
WITH (security_invoker = true)
AS
SELECT 
  u.id,
  u.role,
  CASE
    WHEN (u.display_name IS NOT NULL AND u.display_name <> '') THEN u.display_name
    WHEN (up.first_name IS NOT NULL AND up.last_name IS NOT NULL) THEN concat(up.first_name, ' ', up.last_name)
    WHEN up.username IS NOT NULL THEN up.username
    ELSE 'Anonymous User'
  END AS display_name,
  u.trust_score,
  u.community_score,
  u.profile_complete,
  u.last_active,
  u.created_at
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id;