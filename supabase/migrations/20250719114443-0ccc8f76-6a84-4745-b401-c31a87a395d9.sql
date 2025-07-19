-- Fix the RLS policy for pre_launch_signups to allow anyone to insert
DROP POLICY IF EXISTS "Anyone can insert pre-launch signups" ON public.pre_launch_signups;

CREATE POLICY "Anyone can insert pre-launch signups" 
ON public.pre_launch_signups 
FOR INSERT 
WITH CHECK (true);