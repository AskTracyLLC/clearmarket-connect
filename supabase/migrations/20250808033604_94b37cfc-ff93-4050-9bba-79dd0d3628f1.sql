-- Migration: Ensure user-documents storage bucket, policies, and switch prelaunch email trigger to token-based registration emails
-- Rollback instructions are included as comments for each operation

-- 1) Ensure storage bucket exists for user documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('user-documents', 'user-documents', false);
  END IF;
END $$;
-- Rollback: DELETE FROM storage.buckets WHERE id = 'user-documents';

-- 2) Storage policies for the user-documents bucket
-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Users can view own user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all user-documents" ON storage.objects;

-- Allow users to SELECT their own files (path prefix matches their user id folder)
CREATE POLICY "Users can view own user-documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Rollback: DROP POLICY IF EXISTS "Users can view own user-documents" ON storage.objects;

-- Allow users to INSERT files under their own folder
CREATE POLICY "Users can upload own user-documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Rollback: DROP POLICY IF EXISTS "Users can upload own user-documents" ON storage.objects;

-- Allow users to UPDATE (e.g., move/rename) their own files
CREATE POLICY "Users can update own user-documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Rollback: DROP POLICY IF EXISTS "Users can update own user-documents" ON storage.objects;

-- Allow admins to SELECT all files in this bucket
CREATE POLICY "Admins can view all user-documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-documents' AND public.get_user_role(auth.uid()) = 'admin'::user_role
);
-- Rollback: DROP POLICY IF EXISTS "Admins can view all user-documents" ON storage.objects;

-- 3) Switch pre_launch_signups email trigger to use token-based emails
-- This ensures beta registration tokens are generated and included in the email link
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.pre_launch_signups'::regclass
      AND tgname = 'send_prelaunch_email_trigger'
  ) THEN
    DROP TRIGGER send_prelaunch_email_trigger ON public.pre_launch_signups;
  END IF;
END $$;
-- Rollback: CREATE TRIGGER send_prelaunch_email_trigger AFTER INSERT ON public.pre_launch_signups FOR EACH ROW EXECUTE FUNCTION public.send_prelaunch_signup_email();

-- Create token-based trigger if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.pre_launch_signups'::regclass
      AND tgname = 'send_beta_token_email_trigger'
  ) THEN
    CREATE TRIGGER send_beta_token_email_trigger
    AFTER INSERT ON public.pre_launch_signups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_beta_signup_email_with_token();
  END IF;
END $$;
-- Rollback: DROP TRIGGER IF EXISTS send_beta_token_email_trigger ON public.pre_launch_signups;