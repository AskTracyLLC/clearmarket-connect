-- Fix Critical Security Issues

-- 1. Protect pre_launch_signups table - only admins can view
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view pre-launch signups" ON public.pre_launch_signups;
CREATE POLICY "Only admins can view pre-launch signups"
ON public.pre_launch_signups
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- 2. active_hidden_reviews is a view - secure the underlying table instead
-- The hidden_reviews table should be protected
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hidden_reviews') THEN
    EXECUTE 'ALTER TABLE public.hidden_reviews ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own hidden reviews" ON public.hidden_reviews';
    EXECUTE 'CREATE POLICY "Users can view their own hidden reviews" ON public.hidden_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all hidden reviews" ON public.hidden_reviews';
    EXECUTE 'CREATE POLICY "Admins can view all hidden reviews" ON public.hidden_reviews FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = ''admin''::user_role)';
  END IF;
END $$;

-- 3. Protect user_balances if it exists (could be a view or table)
DO $$
BEGIN
  -- Check if it's a table first
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_balances') THEN
    EXECUTE 'ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own balance" ON public.user_balances';
    EXECUTE 'CREATE POLICY "Users can view own balance" ON public.user_balances FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all balances" ON public.user_balances';
    EXECUTE 'CREATE POLICY "Admins can view all balances" ON public.user_balances FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = ''admin''::user_role)';
  ELSIF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'user_balances') THEN
    -- If it's a view, secure the credits table instead
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own credits balance" ON public.credits';
    EXECUTE 'CREATE POLICY "Users can view own credits balance" ON public.credits FOR SELECT TO authenticated USING (auth.uid() = user_id OR get_user_role(auth.uid()) = ''admin''::user_role)';
  END IF;
END $$;

-- 4. Create security definer function to check network membership
CREATE OR REPLACE FUNCTION public.is_in_network_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contact_unlocks
    WHERE (unlocker_id = auth.uid() AND unlocked_user_id = target_user_id)
       OR (unlocked_user_id = auth.uid() AND unlocker_id = target_user_id)
  );
$$;