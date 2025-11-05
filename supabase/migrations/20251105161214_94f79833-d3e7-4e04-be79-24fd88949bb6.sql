-- Fix security issue: Restrict access to pre_launch_signups table
-- Only admins should be able to view this sensitive customer data

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Anyone can view signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Public read access" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "System can insert pre-launch signups" ON public.pre_launch_signups;

-- Ensure RLS is enabled
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Only admins can view pre-launch signup data
CREATE POLICY "Admins can view all pre-launch signups"
ON public.pre_launch_signups
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update pre-launch signups
CREATE POLICY "Admins can update pre-launch signups"
ON public.pre_launch_signups
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete pre-launch signups
CREATE POLICY "Admins can delete pre-launch signups"
ON public.pre_launch_signups
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow system to insert new signups (for public signup form)
-- This is safe because users can only create their own signup, not read others
CREATE POLICY "System can insert pre-launch signups"
ON public.pre_launch_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);