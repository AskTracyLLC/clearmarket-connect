
-- Re-enable RLS and create proper policies for anonymous signups
-- This replaces the temporary RLS disable with secure policies

-- Re-enable RLS on pre_launch_signups table
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Anonymous users can create signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Admins can view all signups" ON public.pre_launch_signups;

-- Allow anonymous users (role: 'anon') to INSERT signups
CREATE POLICY "Allow anonymous signup insertions"
ON public.pre_launch_signups
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to also INSERT signups (in case they're logged in)
CREATE POLICY "Allow authenticated signup insertions"
ON public.pre_launch_signups
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only admins can SELECT/view all signups
CREATE POLICY "Admins can view all signups"
ON public.pre_launch_signups
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

-- Only admins can UPDATE signups
CREATE POLICY "Admins can update signups"
ON public.pre_launch_signups
FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

-- Only admins can DELETE signups
CREATE POLICY "Admins can delete signups"
ON public.pre_launch_signups
FOR DELETE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');
