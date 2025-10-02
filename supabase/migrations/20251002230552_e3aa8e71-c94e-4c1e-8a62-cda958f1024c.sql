-- Fix Pre-Launch Signups Security - Remove All Public SELECT Access
-- This table contains sensitive PII (emails, names, locations) and must be admin-only

-- Drop all existing SELECT policies that allow public access
DROP POLICY IF EXISTS "Admins can view all pre-launch signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Admins can view all signups" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Users can view own pre-launch signup" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Only admins can view pre-launch signups" ON public.pre_launch_signups;

-- Create single admin-only SELECT policy
CREATE POLICY "Admins only can view pre-launch signups"
ON public.pre_launch_signups
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Keep the INSERT policy for anonymous signups (needed for registration flow)
-- "Anonymous users can insert signups" and "System can insert pre-launch signups" remain unchanged

-- Keep admin UPDATE and DELETE policies unchanged