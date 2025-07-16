-- Create RLS policies for beta testers section access

-- First, create a function to check if a user is a beta tester
CREATE OR REPLACE FUNCTION public.is_beta_tester(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.beta_testers 
    WHERE email = user_email AND is_active = true
  );
$$;

-- Create a function to get user email from auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

-- Add policies for beta testers to access beta-testers section
CREATE POLICY "Beta testers can view beta section posts" 
ON public.community_posts 
FOR SELECT 
TO authenticated
USING (
  section = 'beta-testers' AND 
  public.is_beta_tester(public.get_user_email(auth.uid()))
);

CREATE POLICY "Beta testers can create posts in beta section" 
ON public.community_posts 
FOR INSERT 
TO authenticated
WITH CHECK (
  section = 'beta-testers' AND 
  auth.uid() = user_id AND
  public.is_beta_tester(public.get_user_email(auth.uid()))
);

CREATE POLICY "Beta testers can update own posts in beta section" 
ON public.community_posts 
FOR UPDATE 
TO authenticated
USING (
  section = 'beta-testers' AND 
  auth.uid() = user_id AND
  public.is_beta_tester(public.get_user_email(auth.uid()))
);

-- Allow beta testers to view and create comments on beta posts
CREATE POLICY "Beta testers can view comments on beta posts" 
ON public.community_comments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_comments.post_id 
    AND section = 'beta-testers'
  ) AND 
  public.is_beta_tester(public.get_user_email(auth.uid()))
);

CREATE POLICY "Beta testers can create comments on beta posts" 
ON public.community_comments 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = community_comments.post_id 
    AND section = 'beta-testers'
  ) AND 
  auth.uid() = user_id AND
  public.is_beta_tester(public.get_user_email(auth.uid()))
);