-- Migration: Anonymous Username Implementation for Field Rep Profiles
-- Date: 2025-01-22

-- 1. Add anonymous_username column to users table if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS anonymous_username TEXT;

-- 2. Create sequential username generation function
-- ❌ ISSUE: Using anonymous dollar quotes AS $$ ... $$ causes syntax errors
-- ✅ FIX: Use named dollar quoting AS $func$ ... $func$
CREATE OR REPLACE FUNCTION public.generate_anonymous_username()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  counter INTEGER;
  new_username TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(anonymous_username FROM 'user(\d+)') AS INTEGER)), 0) + 1
  INTO counter
  FROM public.users 
  WHERE anonymous_username ~ '^user\d+$';
  
  IF counter IS NULL THEN
    counter := 1;
  END IF;
  
  new_username := 'user' || counter::TEXT;
  
  WHILE EXISTS (SELECT 1 FROM public.users WHERE anonymous_username = new_username) LOOP
    counter := counter + 1;
    new_username := 'user' || counter::TEXT;
  END LOOP;
  
  RETURN new_username;
END;
$func$;

-- 3. Update handle_new_user function to generate and store anonymous username
-- ❌ ISSUE: Using anonymous dollar quotes AS $$ ... $$ causes syntax errors
-- ✅ FIX: Use named dollar quoting AS $func$ ... $func$
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $func$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate anonymous username
  generated_username := generate_anonymous_username();
  
  -- Insert into users table with anonymous_username
  INSERT INTO public.users (
    id, 
    display_name, 
    anonymous_username,
    role,
    profile_complete,
    trust_score,
    community_score,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', generated_username),
    generated_username,
    'field_rep'::public.user_role,
    5,  -- Small boost for completing signup
    0,  -- Starting trust score
    0,  -- Starting community score
    NOW(),
    NOW()
  );
  
  -- Create credits record
  INSERT INTO public.credits (
    user_id, 
    current_balance, 
    earned_credits
  ) VALUES (
    NEW.id, 
    10, -- Default credits for new users
    10
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$func$;

-- 4. Create field_rep_profiles table to store profile data
CREATE TABLE IF NOT EXISTS public.field_rep_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  bio TEXT,
  aspen_grove_id TEXT,
  aspen_grove_expiration DATE,
  aspen_grove_image TEXT,
  platforms TEXT[],
  other_platform TEXT,
  inspection_types TEXT[],
  hud_keys TEXT[],
  other_hud_key TEXT,
  interested_in_beta BOOLEAN DEFAULT false,
  profile_complete_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on field_rep_profiles
ALTER TABLE public.field_rep_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.field_rep_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.field_rep_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.field_rep_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.field_rep_profiles;

-- Create policies for field_rep_profiles
CREATE POLICY "Users can view own profile" 
ON public.field_rep_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" 
ON public.field_rep_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.field_rep_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.field_rep_profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_field_rep_profiles_updated_at ON public.field_rep_profiles;
CREATE TRIGGER update_field_rep_profiles_updated_at
BEFORE UPDATE ON public.field_rep_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create function to handle beta tester signup from profile (updated to use anonymous_username)
-- ❌ ISSUE: Using anonymous dollar quotes AS $$ ... $$ causes syntax errors
-- ✅ FIX: Use named dollar quoting AS $func$ ... $func$
CREATE OR REPLACE FUNCTION public.handle_beta_signup_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  user_email TEXT;
  user_anonymous_username TEXT;
BEGIN
  -- Only process if interested_in_beta changed to true
  IF NEW.interested_in_beta = true AND (OLD.interested_in_beta IS NULL OR OLD.interested_in_beta = false) THEN
    -- Get user email and anonymous username
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT anonymous_username INTO user_anonymous_username FROM public.users WHERE id = NEW.user_id;
    
    -- Insert into beta_testers table if not already exists
    INSERT INTO public.beta_testers (email, user_type, name, signup_date)
    VALUES (
      user_email,
      'field-rep',
      COALESCE(user_anonymous_username, NEW.first_name || ' ' || NEW.last_name),
      now()
    )
    ON CONFLICT (email) DO UPDATE SET
      is_active = true,
      updated_at = now();
    
    -- Call edge function to send beta confirmation email
    PERFORM http((
      'POST',
      'https://bgqlhaqwsnfhhatxhtfx.supabase.co/functions/v1/send-beta-confirmation-email',
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncWxoYXF3c25maGhhdHhodGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk1MDksImV4cCI6MjA2NzUxNTUwOX0.El8dESk86p4-yb8gIIoheKHRMl2YTegQb9BIfaKIhAU')
      ],
      'application/json',
      jsonb_build_object(
        'signupType', 'field_rep',
        'email', user_email,
        'anonymous_username', user_anonymous_username,
        'credentials', jsonb_build_object(
          'email', user_email,
          'password', 'GeneratedPassword123!'
        )
      )::text
    ));
  END IF;
  
  RETURN NEW;
END;
$func$;

-- Create trigger for beta signup
DROP TRIGGER IF EXISTS handle_beta_signup_trigger ON public.field_rep_profiles;
CREATE TRIGGER handle_beta_signup_trigger
  AFTER INSERT OR UPDATE ON public.field_rep_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_beta_signup_from_profile();

-- 6. Create combined view for easy access to all field rep data
CREATE OR REPLACE VIEW public.field_rep_full_profiles AS
SELECT 
  frp.*,
  u.anonymous_username,
  u.display_name,
  u.role,
  u.trust_score,
  u.community_score,
  c.current_balance as credits
FROM public.field_rep_profiles frp
LEFT JOIN public.users u ON u.id = frp.user_id
LEFT JOIN public.credits c ON c.user_id = frp.user_id;

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_anonymous_username ON public.users(anonymous_username);
CREATE INDEX IF NOT EXISTS idx_field_rep_profiles_user_id ON public.field_rep_profiles(user_id);

-- 8. Update existing users to have anonymous_username if missing
DO $migration$
DECLARE
  user_record RECORD;
  new_username TEXT;
BEGIN
  -- Update any existing users who don't have anonymous_username
  FOR user_record IN 
    SELECT id, display_name 
    FROM public.users 
    WHERE anonymous_username IS NULL
  LOOP
    SELECT generate_anonymous_username() INTO new_username;
    
    UPDATE public.users 
    SET anonymous_username = new_username
    WHERE id = user_record.id;
  END LOOP;
END;
$migration$;

-- 9. Add helpful comments
COMMENT ON TABLE public.field_rep_profiles IS 'Extended profile information for field representatives';
COMMENT ON COLUMN public.users.anonymous_username IS 'Sequential anonymous username (e.g., user1, user2) generated at signup for prelaunch users';
COMMENT ON VIEW public.field_rep_full_profiles IS 'Complete field rep profile view including anonymous_username and user data';