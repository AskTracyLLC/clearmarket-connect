-- Add city and state columns to user_profiles table for admin location data
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add index for better performance when querying by location
CREATE INDEX IF NOT EXISTS idx_user_profiles_location 
ON public.user_profiles(state, city) 
WHERE state IS NOT NULL OR city IS NOT NULL;