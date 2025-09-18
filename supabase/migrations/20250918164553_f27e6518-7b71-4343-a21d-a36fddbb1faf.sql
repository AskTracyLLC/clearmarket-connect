-- Add Row Level Security policies for public tables containing sensitive data
-- Check for existing policies first to avoid conflicts

-- Enable RLS on pre_launch_signups table (CRITICAL - contains email addresses)
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Only add policies if they don't exist
DO $$
BEGIN
  -- Check if admin policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pre_launch_signups' 
    AND policyname = 'Admins can view all pre-launch signups'
  ) THEN
    CREATE POLICY "Admins can view all pre-launch signups" ON public.pre_launch_signups
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;

  -- Check if system insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pre_launch_signups' 
    AND policyname = 'System can insert pre-launch signups'
  ) THEN
    CREATE POLICY "System can insert pre-launch signups" ON public.pre_launch_signups
    FOR INSERT WITH CHECK (true);
  END IF;

  -- Check if user view own policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pre_launch_signups' 
    AND policyname = 'Users can view own pre-launch signup'
  ) THEN
    CREATE POLICY "Users can view own pre-launch signup" ON public.pre_launch_signups
    FOR SELECT USING (get_user_email(auth.uid()) = email);
  END IF;
END$$;

-- Secure other tables with similar checks
ALTER TABLE public.feedback_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback_posts' 
    AND policyname = 'Admins can manage feedback posts'
  ) THEN
    CREATE POLICY "Admins can manage feedback posts" ON public.feedback_posts
    FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback_posts' 
    AND policyname = 'System can insert feedback posts'
  ) THEN
    CREATE POLICY "System can insert feedback posts" ON public.feedback_posts
    FOR INSERT WITH CHECK (true);
  END IF;
END$$;

-- Secure user_business_hours table
ALTER TABLE public.user_business_hours ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_business_hours' 
    AND policyname = 'Users can manage own business hours'
  ) THEN
    CREATE POLICY "Users can manage own business hours" ON public.user_business_hours
    FOR ALL USING (auth.uid() = user_id);
  END IF;
END$$;

-- Secure system_templates table
ALTER TABLE public.system_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'system_templates' 
    AND policyname = 'Admins can manage system templates'
  ) THEN
    CREATE POLICY "Admins can manage system templates" ON public.system_templates
    FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;
END$$;