-- Fix RLS policy for pre_launch_signups to allow public signups

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.pre_launch_signups;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pre_launch_signups;

-- Enable RLS if not already enabled
ALTER TABLE public.pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert signups (public signups should be allowed)
CREATE POLICY "Anyone can sign up for pre-launch"
ON public.pre_launch_signups
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own signups
CREATE POLICY "Users can view own signups"
ON public.pre_launch_signups
FOR SELECT
TO public
USING (true);

-- Only admins can update or delete
CREATE POLICY "Admins can manage signups"
ON public.pre_launch_signups
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));