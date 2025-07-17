-- Create NDA signatures table for tracking signed agreements
CREATE TABLE IF NOT EXISTS public.nda_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_name TEXT NOT NULL,
  signed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signature_version TEXT NOT NULL DEFAULT 'v1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, signature_version)
);

-- Enable Row Level Security
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for NDA signatures
CREATE POLICY "Users can view their own NDA signatures" 
ON public.nda_signatures 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NDA signatures" 
ON public.nda_signatures 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all NDA signatures
CREATE POLICY "Admins can view all NDA signatures" 
ON public.nda_signatures 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create function to check if user has signed NDA
CREATE OR REPLACE FUNCTION public.has_signed_nda(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.nda_signatures 
    WHERE user_id = target_user_id 
    AND is_active = true
  );
$$;

-- Create function to get user's display name for NDA signature
CREATE OR REPLACE FUNCTION public.get_user_display_name(target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(display_name, anonymous_username, 'User') 
  FROM public.users 
  WHERE id = target_user_id;
$$;

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_nda_signatures_updated_at
BEFORE UPDATE ON public.nda_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();