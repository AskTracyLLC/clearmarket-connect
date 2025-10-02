-- Fix Remaining PII Exposure Issues
-- This migration addresses beta_testers and hidden_reviews security issues

-- ===========================================
-- 1. FIX BETA_TESTERS TABLE (contains emails)
-- ===========================================

-- Drop old public-role policies
DROP POLICY IF EXISTS "Admins can view all beta testers" ON public.beta_testers;
DROP POLICY IF EXISTS "Admins can manage beta testers" ON public.beta_testers;

-- Create authenticated-only admin policies
CREATE POLICY "Admins can view all beta testers"
ON public.beta_testers
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can manage beta testers"
ON public.beta_testers
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- ===========================================
-- 2. FIX HIDDEN_REVIEWS TABLE
-- ===========================================

-- Drop duplicate and public-role policies
DROP POLICY IF EXISTS "Users can view own hidden reviews" ON public.hidden_reviews;
DROP POLICY IF EXISTS "Users can view their own hidden reviews" ON public.hidden_reviews;
DROP POLICY IF EXISTS "System can manage hidden reviews" ON public.hidden_reviews;
DROP POLICY IF EXISTS "Admins can view all hidden reviews" ON public.hidden_reviews;

-- Create clean authenticated-only policies
CREATE POLICY "Authenticated users can view own hidden reviews"
ON public.hidden_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all hidden reviews"
ON public.hidden_reviews
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- System needs to manage expiration, but restrict to service role only
CREATE POLICY "Service role can manage hidden reviews"
ON public.hidden_reviews
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ===========================================
-- SUMMARY
-- ===========================================
-- ✅ beta_testers: Now requires authentication for all access
-- ✅ hidden_reviews: Now requires authentication, service role can manage
-- ✅ active_hidden_reviews view: Will respect these RLS policies (security_invoker=true)
-- ✅ All user email/phone data now protected from unauthenticated access