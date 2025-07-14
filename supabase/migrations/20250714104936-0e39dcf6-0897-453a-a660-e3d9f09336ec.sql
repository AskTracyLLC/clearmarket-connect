-- Fix RLS policies for anonymous signup
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create field rep signups" ON public.field_rep_signups;
DROP POLICY IF EXISTS "Anyone can create vendor signups" ON public.vendor_signups;

-- Create new policies that properly handle anonymous users
CREATE POLICY "Anonymous users can create field rep signups" 
ON public.field_rep_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anonymous users can create vendor signups" 
ON public.vendor_signups 
FOR INSERT 
WITH CHECK (true);