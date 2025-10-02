-- Fix User PII Exposure - Restrict Email and Phone Access to Authenticated Users Only
-- This migration secures the users, user_profiles, and field_rep_profiles tables

-- ===========================================
-- 1. FIX USERS TABLE
-- ===========================================

-- Drop old public-role SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create authenticated-only SELECT policies
CREATE POLICY "Authenticated users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all user profiles"
ON public.users
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Update UPDATE policies to be explicit about authenticated access
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

CREATE POLICY "Authenticated users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can update any user profile"
ON public.users
FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- ===========================================
-- 2. FIX USER_PROFILES TABLE (contains email and phone)
-- ===========================================

-- Drop old public-role SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Create authenticated-only SELECT policies
CREATE POLICY "Authenticated users can view own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Update other policies to be explicit about authenticated access
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;

CREATE POLICY "Authenticated users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all user profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Authenticated users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert user profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- ===========================================
-- 3. FIX FIELD_REP_PROFILES TABLE (contains phone)
-- ===========================================

-- Drop old public-role SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.field_rep_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.field_rep_profiles;

-- Create authenticated-only SELECT policies
CREATE POLICY "Authenticated users can view own profile"
ON public.field_rep_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all field rep profiles"
ON public.field_rep_profiles
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Update other policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.field_rep_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.field_rep_profiles;

CREATE POLICY "Authenticated users can update own profile"
ON public.field_rep_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create own profile"
ON public.field_rep_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- SUMMARY
-- ===========================================
-- All SELECT policies on users, user_profiles, and field_rep_profiles now:
-- 1. Require authentication (TO authenticated)
-- 2. Allow users to view only their own data
-- 3. Allow admins to view all data
-- 4. Do NOT expose email/phone to network members
-- 5. Contact unlocking via credits system remains unchanged