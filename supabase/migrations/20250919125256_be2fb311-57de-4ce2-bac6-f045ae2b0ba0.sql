-- Fix conflicting RLS policies by removing permissive ones and keeping only secure policies
-- Use proper PostgreSQL syntax for conditional policy creation

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

-- Add restrictive policies for feedback posts with proper syntax
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback_posts' 
    AND policyname = 'Admins and moderators can view feedback posts'
  ) THEN
    CREATE POLICY "Admins and moderators can view feedback posts" ON public.feedback_posts
    FOR SELECT USING (
      get_user_role(auth.uid()) IN ('admin'::user_role, 'moderator'::user_role)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback_posts' 
    AND policyname = 'Anonymous users can create feedback posts'
  ) THEN
    CREATE POLICY "Anonymous users can create feedback posts" ON public.feedback_posts
    FOR INSERT WITH CHECK (auth.uid() IS NULL);
  END IF;
END$$;

-- Add restrictive policy for pre_launch_signups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pre_launch_signups' 
    AND policyname = 'Anonymous users can signup'
  ) THEN
    CREATE POLICY "Anonymous users can signup" ON public.pre_launch_signups
    FOR INSERT WITH CHECK (auth.uid() IS NULL);
  END IF;
END$$;

-- Fix SECURITY DEFINER functions by changing them to SECURITY INVOKER where appropriate
-- Keep only essential functions as SECURITY DEFINER
ALTER FUNCTION public.send_field_rep_signup_email() SECURITY INVOKER;
ALTER FUNCTION public.send_prelaunch_signup_email() SECURITY INVOKER; 
ALTER FUNCTION public.send_vendor_signup_email() SECURITY INVOKER;
ALTER FUNCTION public.auto_generate_signup_username() SECURITY INVOKER;
ALTER FUNCTION public.set_anonymous_username() SECURITY INVOKER;
ALTER FUNCTION public.set_anonymous_username_prelaunch() SECURITY INVOKER;

-- Add search_path to essential SECURITY DEFINER functions
ALTER FUNCTION public.get_user_role(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_email(UUID) SET search_path = public;
ALTER FUNCTION public.is_beta_tester(text) SET search_path = public;