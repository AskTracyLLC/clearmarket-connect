-- Fix conflicting RLS policies by removing permissive ones and keeping only secure policies

-- Remove permissive policies that allow public access to sensitive data
DROP POLICY IF EXISTS "Anyone can view feedback posts" ON public.feedback_posts;
DROP POLICY IF EXISTS "Allow anonymous signup insertions" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Allow authenticated signup insertions" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Anyone can insert pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Authenticated users can create pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.feedback_posts;
DROP POLICY IF EXISTS "Everyone can view business hours" ON public.user_business_hours;
DROP POLICY IF EXISTS "System can use templates" ON public.system_templates;

-- Remove duplicate admin policies to clean up
DROP POLICY IF EXISTS "Admins can view all signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Admins can manage all templates" ON public.system_templates;

-- Fix SECURITY DEFINER functions by removing the property where not needed
-- Only keep SECURITY DEFINER for functions that truly need elevated privileges

-- Get list of functions to check
DO $$
DECLARE 
    func_record RECORD;
BEGIN
    -- Remove SECURITY DEFINER from functions that don't need it
    FOR func_record IN 
        SELECT routine_name, routine_schema
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND security_type = 'DEFINER'
        AND routine_name NOT IN (
            'get_user_role', 
            'get_user_email',
            'handle_new_user',
            'check_user_role'
        )
    LOOP
        EXECUTE format('ALTER FUNCTION %I.%I() SECURITY INVOKER', 
                      func_record.routine_schema, 
                      func_record.routine_name);
    END LOOP;
END$$;

-- Ensure essential RLS policies are in place and working
-- Add more restrictive policies for feedback posts
CREATE POLICY IF NOT EXISTS "Admins and moderators can view feedback posts" ON public.feedback_posts
FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin'::user_role, 'moderator'::user_role)
);

CREATE POLICY IF NOT EXISTS "Anonymous users can create feedback posts" ON public.feedback_posts
FOR INSERT WITH CHECK (auth.uid() IS NULL);

-- Secure pre_launch_signups further
CREATE POLICY IF NOT EXISTS "Anonymous users can signup" ON public.pre_launch_signups
FOR INSERT WITH CHECK (auth.uid() IS NULL);

-- Add search_path to functions that need it
ALTER FUNCTION public.get_user_role(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_email(UUID) SET search_path = public;