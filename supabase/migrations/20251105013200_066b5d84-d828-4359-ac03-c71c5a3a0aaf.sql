-- Create vendor_profiles table
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_abbreviation TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  company_bio TEXT,
  platforms TEXT[] DEFAULT '{}',
  other_platform TEXT,
  work_types TEXT[] DEFAULT '{}',
  avg_jobs_per_month TEXT,
  payment_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON public.vendor_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Vendors can view their own profile
CREATE POLICY "Vendors can view own profile"
  ON public.vendor_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Vendors can insert their own profile
CREATE POLICY "Vendors can create own profile"
  ON public.vendor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Vendors can update their own profile
CREATE POLICY "Vendors can update own profile"
  ON public.vendor_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Vendors can delete their own profile
CREATE POLICY "Vendors can delete own profile"
  ON public.vendor_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all vendor profiles
CREATE POLICY "Admins can view all vendor profiles"
  ON public.vendor_profiles
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policy: Admins can update all vendor profiles
CREATE POLICY "Admins can update all vendor profiles"
  ON public.vendor_profiles
  FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add comment to table
COMMENT ON TABLE public.vendor_profiles IS 'Stores vendor company information, bio, platforms, and work details';
